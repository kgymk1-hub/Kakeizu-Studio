import { useEffect, useMemo, useRef, useState } from 'react';
import { CsvImport, sampleCsv } from './components/CsvImport/CsvImport';
import { FamilyTreeView } from './components/FamilyTreeView/FamilyTreeView';
import { SourceManager } from './components/SourceManager/SourceManager';
import { PersonDetailPanel } from './components/PersonDetailPanel/PersonDetailPanel';
import type { Citation, ImportBatch, ParentChildRelation, Person, Source, Union, ValidationIssue } from './models';
import { importSimpleCsv } from './services/csvImportService';
import { exportSimpleCsv } from './services/csvExportService';
import { buildFamilyLayout, sanitizeSelectedPersonId } from './services/layoutService';
import { createJsonBackup, parseJsonBackup } from './services/backupService';
import { createStandardCsvSetZip, parseStandardCsvSetFileList, parseStandardCsvSetZip, type StandardCsvSetPreview } from './services/standardCsvSetService';
import { downloadElementAsPdf, downloadElementAsPng } from './services/exportImageService';
import { download } from './utils/download';
import { clearFamilyData, loadFamilyData, saveBackupData, saveFamilyData, updatePerson } from './db/repositories/familyRepository';
import { addCitation, addSource, deleteCitation, deleteSource, updateCitation, updateSource } from './db/repositories/sourceRepository';
import type { NormalizedFamilyData } from './services/normalizationService';
import './styles/app.css';

const hasErrors = (issues: ValidationIssue[]) => issues.some((i) => i.severity === 'error');

export default function App() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [relations, setRelations] = useState<ParentChildRelation[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [status, setStatus] = useState('起動中...');
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState<string | undefined>();
  const backupRef = useRef<HTMLInputElement>(null);
  const standardCsvSetZipRef = useRef<HTMLInputElement>(null);
  const standardCsvSetFilesRef = useRef<HTMLInputElement>(null);
  const [standardPreview, setStandardPreview] = useState<StandardCsvSetPreview | undefined>();
  const treeRef = useRef<HTMLDivElement>(null);

  const applyData = (data: { persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatches?: ImportBatch[]; sources?: Source[]; citations?: Citation[]; issues?: ValidationIssue[] }) => {
    setPersons(data.persons); setUnions(data.unions); setRelations(data.parentChildRelations); setImportBatches(data.importBatches ?? []); setSources(data.sources ?? []); setCitations(data.citations ?? []); setIssues(data.issues ?? []); setSelectedId(data.persons[0]?.id);
  };

  useEffect(() => { void (async () => {
    try {
      const stored = await loadFamilyData();
      if (stored.persons.length > 0) { applyData(stored); setStatus('保存済みデータを読み込みました。'); return; }
      const sample = importSimpleCsv(sampleCsv, 'sample_family.csv');
      applyData({ ...sample, importBatches: [sample.importBatch] });
      setStatus('保存データがないためサンプルを表示しています。');
    } catch (error) {
      console.error('Dexieデータの読み込みに失敗しました。', error);
      setStatus('保存データの読み込みに失敗しました。サンプルを表示します。');
      const sample = importSimpleCsv(sampleCsv, 'sample_family.csv');
      applyData({ ...sample, importBatches: [sample.importBatch], issues: [] });
    } finally {
      setIsLoading(false);
    }
  })(); }, []);

  const layout = useMemo(() => buildFamilyLayout(persons, unions, relations), [persons, unions, relations]);
  const safeSelectedId = sanitizeSelectedPersonId(selectedId, persons);
  const selected = persons.find((p) => p.id === safeSelectedId);
  const citedPersonIds = useMemo(() => new Set(citations.filter((c) => c.target_type === 'person').map((c) => c.target_id)), [citations]);

  useEffect(() => { if (selectedId && !safeSelectedId) setSelectedId(undefined); }, [selectedId, safeSelectedId]);

  const handleImported = async (data: NormalizedFamilyData) => {
    setIssues(data.issues);
    if (hasErrors(data.issues)) { setStatus('エラーがあるため反映しませんでした。'); return false; }
    await saveFamilyData(data);
    applyData({ ...data, importBatches: [data.importBatch] });
    setStatus('CSVインポート結果を保存しました。');
    return true;
  };

  const handlePersonChange = async (next: Person) => {
    setPersons((ps) => ps.map((p) => p.id === next.id ? next : p));
    await updatePerson(next);
    setStatus(`${next.display_name} を保存しました。`);
  };

  const handleSaveSource = async (source: Source) => {
    const exists = sources.some((s) => s.id === source.id);
    if (exists) await updateSource(source); else await addSource(source);
    setSources((prev) => exists ? prev.map((s) => s.id === source.id ? source : s) : [...prev, source]);
    setStatus(`資料「${source.title}」を保存しました。`);
  };

  const handleDeleteSource = async (sourceId: string) => {
    await deleteSource(sourceId);
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
    setCitations((prev) => prev.filter((c) => c.source_id !== sourceId));
    setStatus('資料と関連出典を削除しました。');
  };

  const handleSaveCitation = async (citation: Citation, newSource?: Source) => {
    if (newSource) await handleSaveSource(newSource);
    const exists = citations.some((c) => c.id === citation.id);
    if (exists) await updateCitation(citation); else await addCitation(citation);
    setCitations((prev) => exists ? prev.map((c) => c.id === citation.id ? citation : c) : [...prev, citation]);
    setStatus('人物の出典を保存しました。');
  };

  const handleDeleteCitation = async (citationId: string) => {
    await deleteCitation(citationId);
    setCitations((prev) => prev.filter((c) => c.id !== citationId));
    setStatus('出典紐づけを削除しました。');
  };

  const handleClear = async () => {
    if (!confirm('Dexie上の全データを削除します。よろしいですか？')) return;
    await clearFamilyData();
    const sample = importSimpleCsv(sampleCsv, 'sample_family.csv');
    applyData({ ...sample, importBatches: [sample.importBatch] });
    setStatus('全データを削除し、サンプル表示に戻しました。');
  };


  const runExport = async (label: string, task: () => Promise<void> | void) => {
    setExporting(label);
    setStatus(`${label}を出力中...`);
    try {
      await task();
      setStatus(`${label}を出力しました。`);
    } catch (error) {
      console.error(`${label}出力に失敗しました。`, error);
      setStatus(error instanceof Error ? `${label}出力に失敗しました: ${error.message}` : `${label}出力に失敗しました。`);
    } finally {
      setExporting(undefined);
    }
  };

  const exportPng = () => runExport('PNG', async () => {
    if (!treeRef.current) throw new Error('出力対象の家系図が見つかりません。');
    await downloadElementAsPng(treeRef.current);
  });

  const exportPdf = () => runExport('PDF', async () => {
    if (!treeRef.current) throw new Error('出力対象の家系図が見つかりません。');
    await downloadElementAsPdf(treeRef.current);
  });

  const exportCsv = () => runExport('CSV', () => download('family_simple.csv', exportSimpleCsv(persons, unions, relations), 'text/csv'));

  const exportJson = () => runExport('JSON', () => download('kakeizu_backup.json', createJsonBackup({ persons, unions, parent_child_relations: relations, import_batches: importBatches, sources, citations }), 'application/json'));

  const exportStandardCsvSet = () => runExport('標準CSVセット', async () => {
    const zip = await createStandardCsvSetZip({ persons, unions, parentChildRelations: relations, sources, citations });
    download('kakeizu_standard_csv_set.zip', zip, 'application/zip');
  });

  const showStandardCsvSetPreview = (preview: StandardCsvSetPreview, sourceLabel: string) => {
    setStandardPreview(preview);
    setIssues(preview.issues);
    setStatus(`${sourceLabel}を読み込みました。error ${preview.counts.errors}件 / warning ${preview.counts.warnings}件`);
  };

  const loadStandardCsvSetZipPreview = async (file: File) => {
    try {
      const preview = await parseStandardCsvSetZip(file);
      showStandardCsvSetPreview(preview, '標準CSVセットZIP');
    } catch (error) {
      console.error('標準CSVセットの読み込みに失敗しました。', error);
      setStandardPreview(undefined);
      setStatus(error instanceof Error ? `標準CSVセットZIPの読み込みに失敗しました: ${error.message}` : '標準CSVセットZIPの読み込みに失敗しました。');
    }
  };

  const loadStandardCsvSetFilesPreview = async (files: FileList) => {
    try {
      const preview = await parseStandardCsvSetFileList(files);
      showStandardCsvSetPreview(preview, '標準CSVセットの複数ファイル');
    } catch (error) {
      console.error('標準CSVセットの複数ファイル読み込みに失敗しました。', error);
      setStandardPreview(undefined);
      setStatus(error instanceof Error ? `標準CSVセットの複数ファイル読み込みに失敗しました: ${error.message}` : '標準CSVセットの複数ファイル読み込みに失敗しました。');
    }
  };

  const applyStandardCsvSet = async () => {
    if (!standardPreview) return;
    if (standardPreview.counts.errors > 0) { setStatus('エラーがあるため標準CSVセットを反映できません。'); return; }
    if (standardPreview.counts.warnings > 0 && !confirm(`warningが${standardPreview.counts.warnings}件あります。現在の全データを置き換えて反映しますか？`)) return;
    await saveBackupData(standardPreview);
    applyData({ ...standardPreview, issues: standardPreview.issues });
    setStandardPreview(undefined);
    setStatus('標準CSVセットを反映しました。');
  };

  const restoreBackup = async (file: File) => {
    if (!confirm('現在のデータを置き換えます。よろしいですか？')) return;
    try {
      const backup = parseJsonBackup(await file.text());
      await saveBackupData({ persons: backup.persons, unions: backup.unions, parentChildRelations: backup.parent_child_relations, importBatches: backup.import_batches, sources: backup.sources, citations: backup.citations });
      applyData({ persons: backup.persons, unions: backup.unions, parentChildRelations: backup.parent_child_relations, importBatches: backup.import_batches, sources: backup.sources, citations: backup.citations, issues: [] });
      setStatus('JSONバックアップを復元しました。');
    } catch (error) {
      console.error('JSONバックアップの復元に失敗しました。', error);
      setStatus(error instanceof Error ? error.message : 'JSONバックアップの復元に失敗しました。');
    }
  };

  return <div className="app"><header><div><h1>Kakeizu Studio</h1><p>Version 0.1.0 MVP / CSVから家系図を作るローカルファーストMVP</p></div><nav><button disabled={!!exporting} onClick={exportCsv}>CSV出力</button><button disabled={!!exporting} onClick={exportJson}>JSONバックアップ</button><button disabled={!!exporting} onClick={exportStandardCsvSet}>標準CSVセットをエクスポート</button><input ref={backupRef} className="hidden-file" type="file" accept="application/json,.json" onChange={(e)=>{ const file=e.target.files?.[0]; if(file) void restoreBackup(file); }} /><button onClick={()=>backupRef.current?.click()}>JSON復元</button><input ref={standardCsvSetZipRef} className="hidden-file" type="file" accept="application/zip,.zip" onChange={(e)=>{ const file=e.target.files?.[0]; if(file) void loadStandardCsvSetZipPreview(file); e.currentTarget.value=''; }} /><button onClick={()=>standardCsvSetZipRef.current?.click()}>標準CSVセットZIPをインポート</button><input ref={standardCsvSetFilesRef} className="hidden-file" type="file" multiple accept="application/json,.json,text/csv,.csv" onChange={(e)=>{ const files=e.target.files; if(files?.length) void loadStandardCsvSetFilesPreview(files); e.currentTarget.value=''; }} /><button onClick={()=>standardCsvSetFilesRef.current?.click()}>標準CSVセットの複数ファイルをインポート</button><button onClick={handleClear}>データ全削除</button><button disabled={!!exporting} onClick={exportPng}>PNG出力</button><button disabled={!!exporting} onClick={exportPdf}>PDF出力</button></nav></header><main><aside className="left"><CsvImport onImported={handleImported}/><section className="panel"><h2>標準CSVセット</h2><p>標準CSVセットは、人物・夫婦関係・親子関係・資料・出典をまとめて出し入れする形式です。Excelや外部ツールで編集したい場合、または資料・出典を保持したまま移行したい場合に使います。既存の単一CSVインポートは手軽な人物投入用です。</p><p className="notice">標準CSVセットZIPはKakeizu Studioで再インポート可能です。Excel等で編集する場合はZIPを展開してCSVを編集し、再ZIP化せず複数ファイル選択で取り込めます。</p><p className="notice">ZIPインポートは、Kakeizu Studioが出力した標準CSVセットZIPを想定しています。現時点のZIP読込は無圧縮ZIP前提です。外部ツールで再圧縮したZIPが読めない場合は、複数ファイル直接インポートを使用してください。</p>{standardPreview && <div><h3>インポート前プレビュー</h3><p>persons {standardPreview.counts.persons}件 / unions {standardPreview.counts.unions}件 / parent_child_relations {standardPreview.counts.parent_child_relations}件 / sources {standardPreview.counts.sources}件 / citations {standardPreview.counts.citations}件 / warning {standardPreview.counts.warnings}件 / error {standardPreview.counts.errors}件</p><button disabled={standardPreview.counts.errors > 0} onClick={applyStandardCsvSet}>標準CSVセットを反映</button>{standardPreview.issues.length > 0 && <ul className="issue-list">{standardPreview.issues.map((i,idx)=><li key={idx} className={i.severity}>{i.severity}: {i.code}: {i.message}</li>)}</ul>}</div>}</section><section className="panel"><h2>検証結果</h2><p className="notice">{status}</p>{exporting && <p className="notice">{exporting}を出力中...</p>}{isLoading && <p className="notice">保存データを読み込み中...</p>}<p>{persons.length}人 / Union {unions.length}件 / 親子 {relations.length}件 / 警告 {issues.filter(i=>i.severity==='warning').length}件</p>{[...issues, ...layout.issues].length===0 ? <p>エラー・警告なし</p> : <ul className="issue-list">{[...issues, ...layout.issues].map((i,idx)=><li key={idx} className={i.severity}>{i.severity}: {i.code}: {i.message}</li>)}</ul>}</section><SourceManager sources={sources} onSave={handleSaveSource} onDelete={handleDeleteSource}/><section className="panel"><h2>人物一覧</h2>{persons.length===0 && !isLoading ? <p>人物データがありません。CSVをインポートすると一覧に表示されます。</p> : <ul className="person-list">{persons.map((p)=><li key={p.id}><button className={p.id===safeSelectedId?'selected-list':''} onClick={()=>setSelectedId(p.id)}>{p.external_id} {p.display_name} {citedPersonIds.has(p.id) ? '📎' : ''}</button></li>)}</ul>}</section></aside><section className="canvas" ref={treeRef}><FamilyTreeView nodes={layout.layoutNodes} edges={layout.layoutEdges} viewBox={layout.viewBox} issues={layout.issues} citedPersonIds={citedPersonIds} selectedPersonId={safeSelectedId} onSelectPerson={(p)=>setSelectedId(p.id)}/></section><PersonDetailPanel person={selected} sources={sources} citations={citations} onChange={handlePersonChange} onSaveCitation={handleSaveCitation} onDeleteCitation={handleDeleteCitation}/></main></div>;
}
