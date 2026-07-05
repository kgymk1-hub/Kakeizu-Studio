import { useMemo, useRef, useState } from 'react';
import type { NormalizedFamilyData } from '../../services/normalizationService';
import { analyzeMappedCsv, APP_COLUMNS, CHATGPT_CSV_PROMPT, getCsvHeaders, isImportAllowed, SAMPLE_CSV, suggestColumnMapping, validateColumnMapping, type AppColumn, type ColumnMapping } from '../../services/csvMappingService';
import { download } from '../../utils/download';

export async function readCsvFileAsText(file: File) {
  return file.text();
}

const steps = ['CSV入力', '列マッピング', 'プレビュー', '検証', '取込'];
const previewColumns = ['person_id','name','gender','birth_date','death_date','father_id','mother_id','spouse_ids','note'] as const;

export function CsvImport({ onImported }: { onImported: (data: NormalizedFamilyData) => Promise<boolean> | boolean }) {
  const [text, setText] = useState('');
  const [sourceName, setSourceName] = useState('family_simple.csv');
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const issueRef = useRef<HTMLDivElement>(null);

  const headers = useMemo(() => getCsvHeaders(text || SAMPLE_CSV), [text]);
  const mappingValidation = useMemo(() => validateColumnMapping(mapping), [mapping]);
  const analysis = useMemo(() => mappingValidation.canImport ? analyzeMappedCsv(text || SAMPLE_CSV, mapping, sourceName) : undefined, [mapping, mappingValidation.canImport, sourceName, text]);

  const prepareMapping = () => {
    const csv = text || SAMPLE_CSV;
    const nextHeaders = getCsvHeaders(csv);
    setMapping(suggestColumnMapping(nextHeaders));
    setStep(1);
    setMessage(`${nextHeaders.length}列を読み込みました。列マッピングを確認してください。`);
  };

  const runImport = async () => {
    if (!analysis) return;
    if (!isImportAllowed(analysis.result)) { setMessage('エラーがあるため取り込めません。'); return; }
    if (analysis.summary.warningCount > 0) {
      const ok = window.confirm(`警告がありますが、このCSVを取り込みますか？\n人物: ${analysis.summary.personCount}件\nUnion: ${analysis.summary.unionCount}件\n親子関係: ${analysis.summary.relationCount}件\n警告: ${analysis.summary.warningCount}件`);
      if (!ok) return;
    }
    const applied = await onImported(analysis.result);
    setStep(4);
    setMessage(`${analysis.summary.personCount}人 / Union ${analysis.summary.unionCount}件 / 親子 ${analysis.summary.relationCount}件 / 警告 ${analysis.summary.warningCount}件 / エラー ${analysis.summary.errorCount}件${applied ? '（反映済み）' : '（未反映）'}`);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(CHATGPT_CSV_PROMPT);
    setCopyMessage('コピーしました');
  };

  return <section className="panel import-panel"><h2>CSVインポート</h2>
    <ol className="import-steps">{steps.map((label, index)=><li key={label} className={index===step?'active':index<step?'done':''}>{index+1} {label}</li>)}</ol>
    <input ref={fileRef} className="hidden-file" type="file" accept=".csv,text/csv" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setText(await readCsvFileAsText(file)); setSourceName(file.name); setStep(0); setMessage(`${file.name} を読み込みました。列マッピングへ進んでください。`); }} />
    <div className="button-row"><button onClick={() => fileRef.current?.click()}>CSVファイルを選択</button><button onClick={() => { setText(SAMPLE_CSV); setSourceName('sample_family.csv'); setStep(0); }}>サンプルCSVを読み込む</button><button onClick={() => download('kakeizu_sample_family.csv', SAMPLE_CSV, 'text/csv')}>サンプルCSVをダウンロード</button><button onClick={copyPrompt}>ChatGPT用プロンプトをコピー</button></div>
    {copyMessage && <p className="notice compact">{copyMessage}</p>}
    <textarea value={text} onChange={(e)=>{ setText(e.target.value); setStep(0); }} placeholder="family_simple.csvの内容を貼り付け、またはCSVファイルを選択"/>
    <button className="primary" onClick={prepareMapping}>列マッピングへ進む</button>

    {step >= 1 && <div className="mapping-block"><h3>列マッピング</h3><table className="mapping-table"><thead><tr><th>CSV列</th><th>アプリ項目</th></tr></thead><tbody>{headers.map((header)=><tr key={header}><td>{header}</td><td><select value={mapping[header] ?? ''} onChange={(e)=>setMapping({...mapping, [header]: e.target.value as AppColumn | ''})}><option value="">取り込まない</option>{APP_COLUMNS.map((column)=><option key={column} value={column}>{column}</option>)}</select></td></tr>)}</tbody></table>
      {mappingValidation.errors.map((error)=><p className="error" key={error}>{error}</p>)}{mappingValidation.warnings.map((warning)=><p className="warning" key={warning}>{warning}</p>)}
      <button disabled={!mappingValidation.canImport} onClick={()=>setStep(2)}>マッピング確定</button></div>}

    {step >= 2 && analysis && <div><h3>プレビュー</h3><div className="preview-scroll"><table className="preview-table"><thead><tr><th>行番号</th>{previewColumns.map((c)=><th key={c}>{c}</th>)}<th>判定結果</th></tr></thead><tbody>{analysis.parsedRows.map((row, index)=>{ const rowIssues = analysis.result.issues.filter((issue)=>issue.row===index+2 || issue.external_id===row.person_id); const hasError = rowIssues.some((issue)=>issue.severity==='error'); const hasWarning = rowIssues.some((issue)=>issue.severity==='warning'); return <tr key={`${row.person_id}-${index}`} className={hasError?'error-row':hasWarning?'warning-row':''}><td>{index+2}</td>{previewColumns.map((c)=><td key={c}>{String(row[c] ?? '')}</td>)}<td>{hasError?'エラーあり':hasWarning?'警告あり':'正常'}</td></tr>; })}</tbody></table></div><button onClick={()=>setStep(3)}>検証結果へ進む</button></div>}

    {step >= 3 && analysis && <div className="validation-summary"><h3>検証結果確認</h3><p>{analysis.summary.personCount}人 / Union {analysis.summary.unionCount}件 / 親子 {analysis.summary.relationCount}件 / warning {analysis.summary.warningCount}件 / error {analysis.summary.errorCount}件</p><p>仮人物作成予定 {analysis.summary.placeholderPersonCount}件 / 自動補完された配偶者関係 {analysis.summary.autoCompletedSpouseCount}件</p>{analysis.summary.errorCount>0 ? <p className="error">エラーがあるため取り込めません。 <button onClick={()=>issueRef.current?.scrollIntoView({behavior:'smooth'})}>エラー一覧へ</button></p> : analysis.summary.warningCount>0 ? <p className="warning">警告がありますが取り込み可能です。</p> : <p>エラー・警告なし。取り込み可能です。</p>}<div ref={issueRef} className="issue-box">{analysis.result.issues.length===0 ? <p>問題はありません。</p> : <ul className="issue-list">{analysis.result.issues.map((i,idx)=><li key={idx} className={i.severity}>{i.severity}: {i.code}: {i.message}</li>)}</ul>}</div><button className="primary" disabled={!analysis.summary.canImport} onClick={runImport}>インポート実行</button></div>}
    {message && <p className="notice">{message}</p>}
  </section>;
}
export const sampleCsv = SAMPLE_CSV;
