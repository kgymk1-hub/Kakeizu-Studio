import { useMemo, useRef, useState } from 'react';
import type { NormalizedFamilyData } from '../../services/normalizationService';
import { analyzeMappedCsv, APP_COLUMNS, CHATGPT_CSV_PROMPT, getCsvHeaders, isImportAllowed, SAMPLE_CSV, suggestColumnMapping, validateColumnMapping, type AppColumn, type ColumnMapping } from '../../services/csvMappingService';
import { getImportPolicyOption, getPlaceholderPersonPolicyOption, importPolicyOptions, placeholderPersonPolicyOptions, type ExistingImportContext, type ImportPolicy, type ImportPreviewResult, type PlaceholderPersonPolicy } from '../../services/importPreviewService';
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

export function PlaceholderPersonPolicySelector({ policy, onChange, name = 'placeholder-person-policy' }: { policy: PlaceholderPersonPolicy; onChange: (policy: PlaceholderPersonPolicy) => void; name?: string }) {
  const selected = getPlaceholderPersonPolicyOption(policy);
  return <div className="import-policy"><fieldset><legend>参照先不明・仮人物作成方針</legend>{placeholderPersonPolicyOptions.map((option)=><label key={option.value} className="import-policy-option"><input type="radio" name={name} value={option.value} checked={policy===option.value} onChange={()=>onChange(option.value)} /><span><strong>{option.label}</strong> <small>{option.status === 'available' ? '実行可能' : 'プレビューのみ'}</small><br/><span>{option.description}</span></span></label>)}</fieldset><p><strong>方針：{selected.label}</strong></p><p>{selected.description}</p>{selected.status !== 'available' && <p className="warning">この方針は現時点ではプレビューのみです。保存処理は変更されず、取込実行はできません。</p>}</div>;
}

export function UnresolvedReferencePreview({ preview }: { preview: ImportPreviewResult }) {
  const summary = preview.summary.unresolvedReferenceSummary;
  return <div className="match-preview"><h4>参照先不明</h4><div className="preview-metrics"><span>総数: {summary.total}件</span><span>人物: {summary.personReferences}件</span><span>Source: {summary.sourceReferences}件</span><span>Event: {summary.eventReferences}件</span><span>Union: {summary.unionReferences}件</span><span>Relation: {summary.relationReferences}件</span><span>仮人物候補: {summary.placeholderPersonCandidates}件</span><span>保留/要確認: {summary.pendingReview + summary.blockedByPolicy}件</span></div>{preview.unresolvedReferences.length === 0 ? <p>参照先不明はありません。</p> : <ul className="compact-list">{preview.unresolvedReferences.slice(0, 20).map((ref, idx)=><li key={`${ref.fileName}-${ref.rowNumber}-${ref.field}-${ref.referenceId}-${idx}`}>{ref.fileName && `${ref.fileName} `}{ref.rowNumber ? `${ref.rowNumber}行目 ` : ''}{ref.field}: {ref.referenceId} / 参照元: {ref.sourceDisplayName ?? ref.sourceImportId ?? ref.sourceEntityType} / 参照先: {ref.targetEntityType} / {ref.message}</li>)}</ul>}{preview.unresolvedReferences.length > 20 && <p className="help-text">参照先不明は先頭20件のみ表示しています。</p>}{preview.placeholderPersonCandidates.length > 0 && <><h4>仮人物作成候補</h4><ul className="compact-list">{preview.placeholderPersonCandidates.map((candidate)=><li key={candidate.referenceId}>{candidate.referenceId} / {candidate.displayName} / 参照元: {candidate.references.map((ref)=>`${ref.fileName ?? ''}${ref.rowNumber ? ` ${ref.rowNumber}行目` : ''} ${ref.field ?? ''}`).join(', ')}</li>)}</ul><p className="warning">仮人物は今回保存しません。候補表示のみです。</p></>}</div>;
}

export function ImportPolicySelector({ importPolicy, onChange, name = 'import-policy' }: { importPolicy: ImportPolicy; onChange: (importPolicy: ImportPolicy) => void; name?: string }) {
  const selected = getImportPolicyOption(importPolicy);
  return <div className="import-policy"><fieldset><legend>取込方式</legend>{importPolicyOptions.map((option)=><label key={option.value} className="import-policy-option"><input type="radio" name={name} value={option.value} checked={importPolicy===option.value} onChange={()=>onChange(option.value)} /><span><strong>{option.label}</strong> <small>{option.status === 'available' ? '実行可能' : 'プレビューのみ'}</small><br/><span>{option.description}</span></span></label>)}</fieldset><p><strong>取込方式：{selected.label}</strong></p><p>{selected.status === 'available' ? selected.description : 'この方式は後続フェーズで実装予定です。現在はプレビューのみ確認できます。'}</p></div>;
}


function MatchPreview({ preview }: { preview: ImportPreviewResult }) {
  const { matchSummary, policyPlan } = preview.summary;
  const label: Record<string, string> = { new: '新規候補', matched_existing: '既存一致', duplicate_in_import: 'CSV内重複', missing_external_id: 'external_idなし', unknown: '不明' };
  return <div className="match-preview"><h4>external_id照合結果</h4><div className="preview-metrics"><span>新規候補: {matchSummary.newItems}件</span><span>既存一致候補: {matchSummary.matchedExisting}件</span><span>CSV内重複: {matchSummary.duplicateInImport}件</span><span>external_idなし: {matchSummary.missingExternalId}件</span><span>不明: {matchSummary.unknown}件</span></div><h4>この取込方式での予定処理</h4><div className="preview-metrics"><span>作成候補: {policyPlan.create}件</span><span>更新候補: {policyPlan.update}件</span><span>スキップ候補: {policyPlan.skip}件</span><span>別ID追加候補: {policyPlan.addAsNew}件</span><span>全置換対象: {policyPlan.replace}件</span><span>保留/要確認: {policyPlan.blocked}件</span></div><h4>照合詳細</h4><ul className="compact-list">{preview.matches.slice(0, 10).map((m, idx)=><li key={`${m.entityType}-${m.importId ?? m.externalId ?? idx}`}>{m.fileName && `${m.fileName}: `}{m.externalId ?? m.importId ?? '(external_idなし)'} / {m.displayName ?? m.importId ?? '-'} / {label[m.status]}{m.existingId ? `: ${m.existingId}` : ''}</li>)}</ul>{preview.matches.length > 10 && <p className="help-text">照合詳細は先頭10件のみ表示しています。</p>}</div>;
}

function IssueList({ issues }: { issues: { severity: string; code: string; message: string; rowNumber?: number; fileName?: string; field?: string; targetType?: string; targetId?: string }[] }) {
  if (issues.length === 0) return <p>問題はありません。</p>;
  return <ul className="issue-list">{issues.map((i,idx)=><li key={idx} className={i.severity}><strong>{i.severity}</strong> [{i.code}] {i.fileName && <span>file: {i.fileName} / </span>}{i.rowNumber && <span>行: {i.rowNumber} / </span>}{i.field && <span>列: {i.field} / </span>}{i.targetType && <span>対象: {i.targetType} </span>}{i.targetId && <span>ID: {i.targetId} / </span>}{i.message}</li>)}</ul>;
}

export function CsvImport({ onImported, existingData }: { onImported: (data: NormalizedFamilyData, preview: ImportPreviewResult) => Promise<boolean> | boolean; existingData?: ExistingImportContext }) {
  const [text, setText] = useState('');
  const [sourceName, setSourceName] = useState('family_simple.csv');
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [importPolicy, setImportPolicy] = useState<ImportPolicy>('replace_all');
  const [placeholderPersonPolicy, setPlaceholderPersonPolicy] = useState<PlaceholderPersonPolicy>('warn_and_skip');
  const fileRef = useRef<HTMLInputElement>(null);
  const issueRef = useRef<HTMLDivElement>(null);

  const headers = useMemo(() => getCsvHeaders(text || SAMPLE_CSV), [text]);
  const mappingValidation = useMemo(() => validateColumnMapping(mapping), [mapping]);
  const analysis = useMemo(() => mappingValidation.canImport ? analyzeMappedCsv(text || SAMPLE_CSV, mapping, sourceName, { importPolicy, existingData, placeholderPersonPolicy }) : undefined, [existingData, importPolicy, placeholderPersonPolicy, mapping, mappingValidation.canImport, sourceName, text]);

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
    if (!isImportAllowed(analysis.result, importPolicy, placeholderPersonPolicy)) { setMessage(analysis.preview.canImport ? '' : '現在実行可能なのは replace_all + warn_and_skip のみです。参照先不明を止める/仮人物候補にする方針はプレビューのみです。'); return; }
    if (analysis.summary.warningCount > 0) {
      const ok = window.confirm(`警告がありますが、このCSVを取り込みますか？\n人物: ${analysis.summary.personCount}件\nUnion: ${analysis.summary.unionCount}件\n親子関係: ${analysis.summary.relationCount}件\n警告: ${analysis.summary.warningCount}件`);
      if (!ok) return;
    }
    const applied = await onImported(analysis.result, analysis.preview);
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

    {step >= 2 && analysis && <div><h3>プレビュー</h3><ImportPolicySelector name="simple-import-policy" importPolicy={importPolicy} onChange={setImportPolicy} /><PlaceholderPersonPolicySelector name="simple-placeholder-policy-preview" policy={placeholderPersonPolicy} onChange={setPlaceholderPersonPolicy} /><div className="preview-metrics"><span>総行数: {analysis.preview.summary.totalRows}</span><span>正常行: {analysis.preview.summary.validRows}</span><span>警告行: {analysis.preview.summary.warningRows}</span><span>エラー行: {analysis.preview.summary.errorRows}</span><span>warning: {analysis.preview.summary.warningIssues}</span><span>error: {analysis.preview.summary.errorIssues}</span></div><div className="preview-metrics"><span>Person: {analysis.preview.summary.plannedCreate.persons}件</span><span>Union: {analysis.preview.summary.plannedCreate.unions}件</span><span>ParentChildRelation: {analysis.preview.summary.plannedCreate.relations}件</span><span>Event: {analysis.preview.summary.plannedCreate.events}件</span><span>Source: {analysis.preview.summary.plannedCreate.sources}件</span><span>Citation: {analysis.preview.summary.plannedCreate.citations}件</span></div><MatchPreview preview={analysis.preview} /><UnresolvedReferencePreview preview={analysis.preview} />{!analysis.preview.canImport ? <p className="error">{analysis.preview.summary.importPolicyStatus === 'preview_only' ? 'この取込方式は現在プレビューのみ対応です。実行はできません。' : 'エラーがあるため取り込み不可です。'}</p> : analysis.preview.hasWarnings ? <p className="warning">警告があります。内容を確認すれば取り込み可能です。</p> : <p className="success">エラー・警告なし。取り込み可能です。</p>}<div className="preview-scroll"><table className="preview-table"><thead><tr><th>行番号</th>{previewColumns.map((c)=><th key={c}>{c}</th>)}<th>判定結果</th></tr></thead><tbody>{analysis.parsedRows.map((row, index)=>{ const rowIssues = analysis.result.issues.filter((issue)=>issue.row===index+2 || issue.external_id===row.person_id); const hasError = rowIssues.some((issue)=>issue.severity==='error'); const hasWarning = rowIssues.some((issue)=>issue.severity==='warning'); return <tr key={`${row.person_id}-${index}`} className={hasError?'error-row':hasWarning?'warning-row':''}><td>{index+2}</td>{previewColumns.map((c)=><td key={c}>{String(row[c] ?? '')}</td>)}<td>{hasError?'エラーあり':hasWarning?'警告あり':'正常'}</td></tr>; })}</tbody></table></div><button onClick={()=>setStep(3)}>検証結果へ進む</button></div>}

    {step >= 3 && analysis && <div className="validation-summary"><h3>検証結果確認</h3><p className="help-text">errorは修正が必要な問題で、取り込みをブロックします。warningは未登録ID参照などの確認事項で、確認後に取り込めます。</p><p>総行数 {analysis.preview.summary.totalRows}件 / 正常行 {analysis.preview.summary.validRows}件 / 警告行 {analysis.preview.summary.warningRows}件 / エラー行 {analysis.preview.summary.errorRows}件 / warning {analysis.preview.summary.warningIssues}件 / error {analysis.preview.summary.errorIssues}件</p><p>取り込み予定: Person {analysis.preview.summary.plannedCreate.persons}件 / Union {analysis.preview.summary.plannedCreate.unions}件 / ParentChildRelation {analysis.preview.summary.plannedCreate.relations}件 / Event {analysis.preview.summary.plannedCreate.events}件 / Source {analysis.preview.summary.plannedCreate.sources}件 / Citation {analysis.preview.summary.plannedCreate.citations}件</p><MatchPreview preview={analysis.preview} /><UnresolvedReferencePreview preview={analysis.preview} /><p>未登録人物IDの参照件数 {analysis.summary.placeholderPersonCount}件 / 自動補完された配偶者関係 {analysis.summary.autoCompletedSpouseCount}件</p><ImportPolicySelector name="simple-import-policy" importPolicy={importPolicy} onChange={setImportPolicy} /><PlaceholderPersonPolicySelector name="simple-placeholder-policy-validation" policy={placeholderPersonPolicy} onChange={setPlaceholderPersonPolicy} /><p className="warning"><strong>取込方式：{getImportPolicyOption(importPolicy).label}</strong>。{importPolicy === 'replace_all' ? 'インポートを実行すると、現在の家系図データと資料・出典は、このCSVの内容で置き換えられます（CSVには資料・出典を含めないため既存の資料・出典は削除されます）。' : 'この取込方式は現在プレビューのみ対応です。実行はできません。'}</p>{!analysis.preview.canImport ? <p className="error">{analysis.preview.summary.importPolicyStatus === 'preview_only' ? 'この取込方式は現在プレビューのみ対応です。実行はできません。' : 'エラーがあるため取り込めません。'} <button onClick={()=>issueRef.current?.scrollIntoView({behavior:'smooth'})}>エラー一覧へ</button></p> : analysis.summary.warningCount>0 ? <p className="warning">警告がありますが取り込み可能です。</p> : <p>エラー・警告なし。取り込み可能です。</p>}<div ref={issueRef} className="issue-box"><IssueList issues={analysis.preview.issues} /></div><button className="primary" disabled={!analysis.preview.canImport} onClick={runImport}>家系図・資料・出典を置き換えてインポート実行</button></div>}
    {message && <p className="notice">{message}</p>}
  </section>;
}
export const sampleCsv = SAMPLE_CSV;
