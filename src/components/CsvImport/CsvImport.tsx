import { useMemo, useRef, useState } from 'react';
import type { NormalizedFamilyData } from '../../services/normalizationService';
import { analyzeMappedCsv, APP_COLUMNS, CHATGPT_CSV_PROMPT, getCsvHeaders, isImportAllowed, SAMPLE_CSV, suggestColumnMapping, validateColumnMapping, type AppColumn, type ColumnMapping } from '../../services/csvMappingService';
import { getImportPolicyOption, importPolicyOptions, type ImportPolicy } from '../../services/importPreviewService';
import { download } from '../../utils/download';

export async function readCsvFileAsText(file: File) {
  return file.text();
}

export async function copyTextToClipboard(text: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error('このブラウザではクリップボードAPIを利用できません。');
  }
  await navigator.clipboard.writeText(text);
}

const steps = ['CSV入力', '列マッピング', 'プレビュー', '検証', '取込'];
const previewColumns = ['person_id','name','gender','birth_date','death_date','father_id','mother_id','spouse_ids','note'] as const;

export function ImportPolicySelector({ importPolicy, onChange }: { importPolicy: ImportPolicy; onChange: (importPolicy: ImportPolicy) => void }) {
  const selected = getImportPolicyOption(importPolicy);
  return <div className="import-policy"><fieldset><legend>取込方式</legend>{importPolicyOptions.map((option)=><label key={option.value} className="import-policy-option"><input type="radio" name="import-policy" value={option.value} checked={importPolicy===option.value} onChange={()=>onChange(option.value)} /><span><strong>{option.label}</strong> <small>{option.status === 'available' ? '実行可能' : 'プレビューのみ'}</small><br/><span>{option.description}</span></span></label>)}</fieldset><p><strong>取込方式：{selected.label}</strong></p><p>{selected.status === 'available' ? selected.description : 'この方式は後続フェーズで実装予定です。現在はプレビューのみ確認できます。'}</p></div>;
}

function IssueList({ issues }: { issues: { severity: string; code: string; message: string; rowNumber?: number; fileName?: string; field?: string; targetType?: string; targetId?: string }[] }) {
  if (issues.length === 0) return <p>問題はありません。</p>;
  return <ul className="issue-list">{issues.map((i,idx)=><li key={idx} className={i.severity}><strong>{i.severity}</strong> [{i.code}] {i.fileName && <span>file: {i.fileName} / </span>}{i.rowNumber && <span>行: {i.rowNumber} / </span>}{i.field && <span>列: {i.field} / </span>}{i.targetType && <span>対象: {i.targetType} </span>}{i.targetId && <span>ID: {i.targetId} / </span>}{i.message}</li>)}</ul>;
}

export function CsvImport({ onImported }: { onImported: (data: NormalizedFamilyData) => Promise<boolean> | boolean }) {
  const [text, setText] = useState('');
  const [sourceName, setSourceName] = useState('family_simple.csv');
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [importPolicy, setImportPolicy] = useState<ImportPolicy>('replace_all');
  const fileRef = useRef<HTMLInputElement>(null);
  const issueRef = useRef<HTMLDivElement>(null);

  const headers = useMemo(() => getCsvHeaders(text || SAMPLE_CSV), [text]);
  const mappingValidation = useMemo(() => validateColumnMapping(mapping), [mapping]);
  const analysis = useMemo(() => mappingValidation.canImport ? analyzeMappedCsv(text || SAMPLE_CSV, mapping, sourceName, { importPolicy }) : undefined, [importPolicy, mapping, mappingValidation.canImport, sourceName, text]);

  const resetAnalysisState = () => {
    setMapping({});
    setStep(0);
  };

  const prepareMapping = () => {
    const csv = text || SAMPLE_CSV;
    const nextHeaders = getCsvHeaders(csv);
    setMapping(suggestColumnMapping(nextHeaders));
    setStep(1);
    setMessage(`${nextHeaders.length}列を読み込みました。列マッピングを確認してください。`);
  };

  const runImport = async () => {
    if (!analysis) return;
    if (!isImportAllowed(analysis.result, importPolicy)) { setMessage(importPolicy === 'replace_all' ? 'エラーがあるため取り込めません。' : 'この取込方式は現在プレビューのみ対応です。実行はできません。'); return; }
    if (analysis.summary.warningCount > 0) {
      const ok = window.confirm(`警告がありますが、このCSVを取り込みますか？\n人物: ${analysis.summary.personCount}件\nUnion: ${analysis.summary.unionCount}件\n親子関係: ${analysis.summary.relationCount}件\n警告: ${analysis.summary.warningCount}件`);
      if (!ok) return;
    }
    const applied = await onImported(analysis.result);
    setStep(4);
    setMessage(`${analysis.summary.personCount}人 / Union ${analysis.summary.unionCount}件 / 親子 ${analysis.summary.relationCount}件 / 警告 ${analysis.summary.warningCount}件 / エラー ${analysis.summary.errorCount}件${applied ? '（反映済み）' : '（未反映）'}`);
  };

  const copyPrompt = async () => {
    try {
      await copyTextToClipboard(CHATGPT_CSV_PROMPT);
      setCopyMessage('コピーしました');
    } catch (error) {
      setCopyMessage(error instanceof Error ? `コピーに失敗しました: ${error.message}` : 'コピーに失敗しました。手動でプロンプトを選択してコピーしてください。');
    }
  };

  return <section className="panel import-panel"><h2>CSVインポート</h2>
    <ol className="import-steps">{steps.map((label, index)=><li key={label} className={index===step?'active':index<step?'done':''}>{index+1} {label}</li>)}</ol>
    <input ref={fileRef} className="hidden-file" type="file" accept=".csv,text/csv" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setText(await readCsvFileAsText(file)); setSourceName(file.name); resetAnalysisState(); setMessage(`${file.name} を読み込みました。列マッピングへ進んでください。`); }} />
    <div className="button-row"><button onClick={() => fileRef.current?.click()}>CSVファイルを選択</button><button onClick={() => { setText(SAMPLE_CSV); setSourceName('sample_family.csv'); resetAnalysisState(); setMessage('サンプルCSVを読み込みました。列マッピングへ進んでください。'); }}>サンプルCSVを読み込む</button><button onClick={() => download('kakeizu_sample_family.csv', SAMPLE_CSV, 'text/csv')}>サンプルCSVをダウンロード</button><button onClick={copyPrompt}>ChatGPT用プロンプトをコピー</button></div>
    {copyMessage && <p className="notice compact">{copyMessage}</p>}
    <textarea value={text} onChange={(e)=>{ setText(e.target.value); resetAnalysisState(); setMessage('CSV内容を更新しました。列マッピングへ進んでください。'); }} placeholder="family_simple.csvの内容を貼り付け、またはCSVファイルを選択"/>
    <button className="primary" onClick={prepareMapping}>列マッピングへ進む</button>

    {step >= 1 && <div className="mapping-block"><h3>列マッピング</h3><p className="help-text">CSV列をKakeizu Studioの項目に対応させます。不要な列は「取り込まない（無視）」を選んでください。</p><table className="mapping-table"><thead><tr><th>CSV列</th><th>アプリ項目</th></tr></thead><tbody>{headers.map((header)=><tr key={header}><td>{header}</td><td><select value={mapping[header] ?? ''} onChange={(e)=>setMapping({...mapping, [header]: e.target.value as AppColumn | ''})}><option value="">取り込まない（無視）</option>{APP_COLUMNS.map((column)=><option key={column} value={column}>{column}</option>)}</select></td></tr>)}</tbody></table>
      {mappingValidation.errors.map((error)=><p className="error" key={error}>{error}</p>)}{mappingValidation.warnings.map((warning)=><p className="warning" key={warning}>{warning}</p>)}
      <button disabled={!mappingValidation.canImport} onClick={()=>setStep(2)}>マッピング確定</button></div>}

    {step >= 2 && analysis && <div><h3>プレビュー</h3><ImportPolicySelector importPolicy={importPolicy} onChange={setImportPolicy} /><div className="preview-metrics"><span>総行数: {analysis.preview.summary.totalRows}</span><span>正常行: {analysis.preview.summary.validRows}</span><span>警告行: {analysis.preview.summary.warningRows}</span><span>エラー行: {analysis.preview.summary.errorRows}</span><span>warning: {analysis.preview.summary.warningIssues}</span><span>error: {analysis.preview.summary.errorIssues}</span></div><div className="preview-metrics"><span>Person: {analysis.preview.summary.plannedCreate.persons}件</span><span>Union: {analysis.preview.summary.plannedCreate.unions}件</span><span>ParentChildRelation: {analysis.preview.summary.plannedCreate.relations}件</span><span>Event: {analysis.preview.summary.plannedCreate.events}件</span><span>Source: {analysis.preview.summary.plannedCreate.sources}件</span><span>Citation: {analysis.preview.summary.plannedCreate.citations}件</span></div>{!analysis.preview.canImport ? <p className="error">{analysis.preview.summary.importPolicyStatus === 'preview_only' ? 'この取込方式は現在プレビューのみ対応です。実行はできません。' : 'エラーがあるため取り込み不可です。'}</p> : analysis.preview.hasWarnings ? <p className="warning">警告があります。内容を確認すれば取り込み可能です。</p> : <p className="success">エラー・警告なし。取り込み可能です。</p>}<div className="preview-scroll"><table className="preview-table"><thead><tr><th>行番号</th>{previewColumns.map((c)=><th key={c}>{c}</th>)}<th>判定結果</th></tr></thead><tbody>{analysis.parsedRows.map((row, index)=>{ const rowIssues = analysis.result.issues.filter((issue)=>issue.row===index+2 || issue.external_id===row.person_id); const hasError = rowIssues.some((issue)=>issue.severity==='error'); const hasWarning = rowIssues.some((issue)=>issue.severity==='warning'); return <tr key={`${row.person_id}-${index}`} className={hasError?'error-row':hasWarning?'warning-row':''}><td>{index+2}</td>{previewColumns.map((c)=><td key={c}>{String(row[c] ?? '')}</td>)}<td>{hasError?'エラーあり':hasWarning?'警告あり':'正常'}</td></tr>; })}</tbody></table></div><button onClick={()=>setStep(3)}>検証結果へ進む</button></div>}

    {step >= 3 && analysis && <div className="validation-summary"><h3>検証結果確認</h3><p className="help-text">errorは修正が必要な問題で、取り込みをブロックします。warningは未登録ID参照などの確認事項で、確認後に取り込めます。</p><p>総行数 {analysis.preview.summary.totalRows}件 / 正常行 {analysis.preview.summary.validRows}件 / 警告行 {analysis.preview.summary.warningRows}件 / エラー行 {analysis.preview.summary.errorRows}件 / warning {analysis.preview.summary.warningIssues}件 / error {analysis.preview.summary.errorIssues}件</p><p>取り込み予定: Person {analysis.preview.summary.plannedCreate.persons}件 / Union {analysis.preview.summary.plannedCreate.unions}件 / ParentChildRelation {analysis.preview.summary.plannedCreate.relations}件 / Event {analysis.preview.summary.plannedCreate.events}件 / Source {analysis.preview.summary.plannedCreate.sources}件 / Citation {analysis.preview.summary.plannedCreate.citations}件</p><p>未登録人物IDの参照件数 {analysis.summary.placeholderPersonCount}件 / 自動補完された配偶者関係 {analysis.summary.autoCompletedSpouseCount}件</p><ImportPolicySelector importPolicy={importPolicy} onChange={setImportPolicy} /><p className="warning"><strong>取込方式：{getImportPolicyOption(importPolicy).label}</strong>。{importPolicy === 'replace_all' ? 'インポートを実行すると、現在の家系図データと資料・出典は、このCSVの内容で置き換えられます（CSVには資料・出典を含めないため既存の資料・出典は削除されます）。' : 'この取込方式は現在プレビューのみ対応です。実行はできません。'}</p>{!analysis.preview.canImport ? <p className="error">{analysis.preview.summary.importPolicyStatus === 'preview_only' ? 'この取込方式は現在プレビューのみ対応です。実行はできません。' : 'エラーがあるため取り込めません。'} <button onClick={()=>issueRef.current?.scrollIntoView({behavior:'smooth'})}>エラー一覧へ</button></p> : analysis.summary.warningCount>0 ? <p className="warning">警告がありますが取り込み可能です。</p> : <p>エラー・警告なし。取り込み可能です。</p>}<div ref={issueRef} className="issue-box"><IssueList issues={analysis.preview.issues} /></div><button className="primary" disabled={!analysis.preview.canImport} onClick={runImport}>家系図・資料・出典を置き換えてインポート実行</button></div>}
    {message && <p className="notice">{message}</p>}
  </section>;
}
export const sampleCsv = SAMPLE_CSV;
