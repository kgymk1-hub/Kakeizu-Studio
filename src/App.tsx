import { useEffect, useMemo, useRef, useState } from 'react';
import { CsvImport, sampleCsv } from './components/CsvImport/CsvImport';
import { FamilyTreeView } from './components/FamilyTreeView/FamilyTreeView';
import { SourceManager } from './components/SourceManager/SourceManager';
import { PersonDetailPanel } from './components/PersonDetailPanel/PersonDetailPanel';
import { KosekiEntryPanel } from './components/KosekiEntryPanel';
import { ValidationPanel } from './components/ValidationPanel/ValidationPanel';
import type { Citation, Event, ImportBatch, ParentChildRelation, Person, SelectableTarget, Source, Union, ValidationIssue } from './models';
import { importSimpleCsv } from './services/csvImportService';
import { exportSimpleCsv } from './services/csvExportService';
import { buildFamilyLayout, sanitizeSelectedPersonId } from './services/layoutService';
import { createJsonBackup, parseJsonBackup } from './services/backupService';
import { createStandardCsvSetZip, parseStandardCsvSetFileList, parseStandardCsvSetZip, type StandardCsvSetPreview } from './services/standardCsvSetService';
import { downloadElementAsPdf, downloadElementAsPng, downloadSvgFromElement } from './services/exportImageService';
import { validateFamilyData } from './services/validationService';
import { resolveSelectableTargetToPersonId } from './services/selectionService';
import { download } from './utils/download';
import { clearFamilyData, deleteParentChildRelationWithCitations, deleteUnionWithCitations, loadFamilyData, saveBackupData, saveFamilyData, saveKosekiEntryData, updateParentChildRelation, updatePerson, updateUnion } from './db/repositories/familyRepository';
import { addEvent, deleteEvent, updateEvent } from './db/repositories/eventRepository';
import { addCitation, addSource, deleteCitation, deleteSource, updateCitation, updateSource } from './db/repositories/sourceRepository';
import type { NormalizedFamilyData } from './services/normalizationService';
import type { KosekiEntryResult } from './services/kosekiEntryService';
import './styles/app.css';

const hasErrors = (issues: ValidationIssue[]) => issues.some((i) => i.severity === 'error');

export default function App() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [relations, setRelations] = useState<ParentChildRelation[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
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

  const applyData = (data: { persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatches?: ImportBatch[]; sources?: Source[]; citations?: Citation[]; events?: Event[]; issues?: ValidationIssue[] }) => {
    setPersons(data.persons); setUnions(data.unions); setRelations(data.parentChildRelations); setImportBatches(data.importBatches ?? []); setSources(data.sources ?? []); setCitations(data.citations ?? []); setEvents(data.events ?? []); setIssues(data.issues ?? []); setSelectedId(data.persons[0]?.id);
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
  const validationIssues = useMemo(() => validateFamilyData({ persons, unions, parentChildRelations: relations, events, sources, citations }), [persons, unions, relations, events, sources, citations]);

  useEffect(() => { if (selectedId && !safeSelectedId) setSelectedId(undefined); }, [selectedId, safeSelectedId]);

  const selectTarget = (target: SelectableTarget) => {
    const nextPersonId = resolveSelectableTargetToPersonId(target, { persons, events, unions, relations });
    if (nextPersonId) {
      setSelectedId(nextPersonId);
      return true;
    }
    // Source / Citation targets are accepted here and will be routed to dedicated lists in later v0.6 phases.
    return false;
  };

  const selectPersonTarget = (personId: string) => selectTarget({ target_type: 'person', target_id: personId });

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
    const duplicate = citations.find((c) => c.source_id === citation.source_id && c.target_type === citation.target_type && c.target_id === citation.target_id);
    const exists = citations.some((c) => c.id === citation.id);
    const nextCitation = duplicate ? { ...citation, id: duplicate.id, created_at: duplicate.created_at } : citation;
    if (duplicate || exists) await updateCitation(nextCitation); else await addCitation(nextCitation);
    if (duplicate && duplicate.id !== citation.id && exists) await deleteCitation(citation.id);
    setCitations((prev) => {
      if (!duplicate && !exists) return [...prev, nextCitation];
      const withoutMergedOriginal = duplicate && duplicate.id !== citation.id ? prev.filter((c) => c.id !== citation.id) : prev;
      return withoutMergedOriginal.map((c) => c.id === nextCitation.id ? nextCitation : c);
    });
    setStatus('出典を保存しました。');
  };

  const handleDeleteCitation = async (citationId: string) => {
    await deleteCitation(citationId);
    setCitations((prev) => prev.filter((c) => c.id !== citationId));
    setStatus('出典紐づけを削除しました。');
  };

  const handleSaveEvent = async (event: Event, citation?: Citation) => {
    const exists = events.some((e) => e.id === event.id);
    if (exists) await updateEvent(event); else await addEvent(event);
    setEvents((prev) => exists ? prev.map((e) => e.id === event.id ? event : e) : [...prev, event]);
    if (citation) {
      const existingCitation = citations.find((c) => c.source_id === citation.source_id && c.target_type === 'event' && c.target_id === event.id);
      const nextCitation = existingCitation ? { ...citation, id: existingCitation.id, created_at: existingCitation.created_at } : citation;
      if (existingCitation) await updateCitation(nextCitation); else await addCitation(nextCitation);
      setCitations((prev) => existingCitation ? prev.map((c) => c.id === nextCitation.id ? nextCitation : c) : [...prev, nextCitation]);
    }
    setStatus('Eventを保存しました。');
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setCitations((prev) => prev.filter((c) => !(c.target_type === 'event' && c.target_id === eventId)));
    setStatus('Eventと関連出典を削除しました。');
  };


  const handleDeleteParentChildRelation = async (relationId: string) => {
    if (!confirm('この親子関係を削除します。関係に紐づく出典も削除されます。よろしいですか？')) return;
    try {
      await deleteParentChildRelationWithCitations(relationId);
      setRelations((prev) => prev.filter((r) => r.id !== relationId));
      setCitations((prev) => prev.filter((c) => !(c.target_type === 'relation' && c.target_id === relationId)));
      setStatus('親子関係と関連出典を削除しました。');
    } catch (error) {
      console.error('親子関係の削除に失敗しました。', error);
      setStatus(error instanceof Error ? `親子関係の削除に失敗しました: ${error.message}` : '親子関係の削除に失敗しました。');
    }
  };

  const handleDeleteUnion = async (unionId: string) => {
    if (!confirm('この夫婦関係を削除します。関係に紐づく出典も削除されます。よろしいですか？')) return;
    try {
      await deleteUnionWithCitations(unionId);
      setUnions((prev) => prev.filter((u) => u.id !== unionId));
      setCitations((prev) => prev.filter((c) => !(c.target_type === 'union' && c.target_id === unionId)));
      setStatus('夫婦関係と関連出典を削除しました。');
    } catch (error) {
      console.error('夫婦関係の削除に失敗しました。', error);
      setStatus(error instanceof Error ? `夫婦関係の削除に失敗しました: ${error.message}` : '夫婦関係の削除に失敗しました。');
    }
  };


  const handleSaveParentChildRelation = async (relationId: string, patch: Partial<Omit<ParentChildRelation, 'id' | 'parent_id' | 'child_id' | 'created_at'>>) => {
    try {
      const updated = await updateParentChildRelation(relationId, patch);
      if (!updated) { setStatus('親子関係が見つからないため保存できませんでした。'); return; }
      setRelations((prev) => prev.map((r) => r.id === updated.id ? updated : r));
      setStatus('親子関係を保存しました。');
    } catch (error) {
      console.error('親子関係の保存に失敗しました。', error);
      setStatus(error instanceof Error ? `親子関係の保存に失敗しました: ${error.message}` : '親子関係の保存に失敗しました。');
    }
  };

  const handleSaveUnion = async (unionId: string, patch: Partial<Omit<Union, 'id' | 'partner1_id' | 'partner2_id' | 'created_at'>>) => {
    try {
      const updated = await updateUnion(unionId, patch);
      if (!updated) { setStatus('夫婦関係が見つからないため保存できませんでした。'); return; }
      setUnions((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      setStatus('夫婦関係を保存しました。');
    } catch (error) {
      console.error('夫婦関係の保存に失敗しました。', error);
      setStatus(error instanceof Error ? `夫婦関係の保存に失敗しました: ${error.message}` : '夫婦関係の保存に失敗しました。');
    }
  };

  const handleApplyKosekiEntry = async (result: KosekiEntryResult) => {
    await saveKosekiEntryData(result);
    setPersons(result.persons);
    setCitations(result.citations);
    setRelations(result.parentChildRelations);
    setUnions(result.unions);
    setEvents(result.events ?? []);
    setSelectedId(result.person.id);
    setStatus(result.createdPerson ? '戸籍資料に基づいて人物を登録しました。' : '人物情報を更新し、出典を紐づけました。');
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

  const exportSvg = () => runExport('SVG', () => {
    if (!treeRef.current) throw new Error('出力対象の家系図が見つかりません。');
    downloadSvgFromElement(treeRef.current);
  });

  const exportCsv = () => runExport('CSV', () => download('family_simple.csv', exportSimpleCsv(persons, unions, relations), 'text/csv'));

  const exportJson = () => runExport('JSON', () => download('kakeizu_backup.json', createJsonBackup({ persons, unions, parent_child_relations: relations, import_batches: importBatches, sources, citations, events }), 'application/json'));

  const exportStandardCsvSet = () => runExport('標準CSVセット', async () => {
    const zip = await createStandardCsvSetZip({ persons, unions, parentChildRelations: relations, sources, citations, events });
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
      await saveBackupData({ persons: backup.persons, unions: backup.unions, parentChildRelations: backup.parent_child_relations, importBatches: backup.import_batches, sources: backup.sources, citations: backup.citations, events: backup.events });
      applyData({ persons: backup.persons, unions: backup.unions, parentChildRelations: backup.parent_child_relations, importBatches: backup.import_batches, sources: backup.sources, citations: backup.citations, events: backup.events, issues: [] });
      setStatus('JSONバックアップを復元しました。');
    } catch (error) {
      console.error('JSONバックアップの復元に失敗しました。', error);
      setStatus(error instanceof Error ? error.message : 'JSONバックアップの復元に失敗しました。');
    }
  };

  return <div className="app"><header><div><h1>Kakeizu Studio</h1><p>Version 0.5.0 / 戸籍資料・出典・Event・関係根拠・データ検証・家系図表示出力を管理できるローカルファースト家系図アプリ</p></div><nav><button disabled={!!exporting} onClick={exportCsv}>CSV出力</button><button disabled={!!exporting} onClick={exportJson}>JSONバックアップ</button><button disabled={!!exporting} onClick={exportStandardCsvSet}>標準CSVセットをエクスポート</button><input ref={backupRef} className="hidden-file" type="file" accept="application/json,.json" onChange={(e)=>{ const file=e.target.files?.[0]; if(file) void restoreBackup(file); }} /><button onClick={()=>backupRef.current?.click()}>JSON復元</button><input ref={standardCsvSetZipRef} className="hidden-file" type="file" accept="application/zip,.zip" onChange={(e)=>{ const file=e.target.files?.[0]; if(file) void loadStandardCsvSetZipPreview(file); e.currentTarget.value=''; }} /><button onClick={()=>standardCsvSetZipRef.current?.click()}>標準CSVセットZIPをインポート</button><input ref={standardCsvSetFilesRef} className="hidden-file" type="file" multiple accept="application/json,.json,text/csv,.csv" onChange={(e)=>{ const files=e.target.files; if(files?.length) void loadStandardCsvSetFilesPreview(files); e.currentTarget.value=''; }} /><button onClick={()=>standardCsvSetFilesRef.current?.click()}>標準CSVセットの複数ファイルをインポート</button><button onClick={handleClear}>データ全削除</button><button disabled={!!exporting} onClick={exportPng}>PNG出力</button><button disabled={!!exporting} onClick={exportPdf}>PDF出力</button><button disabled={!!exporting} onClick={exportSvg}>SVG出力</button></nav></header><main><aside className="left"><CsvImport onImported={handleImported}/><section className="panel"><h2>標準CSVセット</h2><p>標準CSVセットは、人物・夫婦関係・親子関係・資料・出典・Eventをまとめて出し入れする形式です。Excelや外部ツールで編集したい場合、または資料・出典を保持したまま移行したい場合に使います。既存の単一CSVインポートは手軽な人物投入用です。</p><p className="notice">標準CSVセットZIPはKakeizu Studioで再インポート可能です。Excel等で編集する場合はZIPを展開してCSVを編集し、再ZIP化せず複数ファイル選択で取り込めます。</p><p className="notice">ZIPインポートは、Kakeizu Studioが出力した標準CSVセットZIPを想定しています。現時点のZIP読込は無圧縮ZIP前提です。外部ツールで再圧縮したZIPが読めない場合は、複数ファイル直接インポートを使用してください。</p>{standardPreview && <div><h3>インポート前プレビュー</h3><p>persons {standardPreview.counts.persons}件 / unions {standardPreview.counts.unions}件 / parent_child_relations {standardPreview.counts.parent_child_relations}件 / sources {standardPreview.counts.sources}件 / citations {standardPreview.counts.citations}件 / events {standardPreview.counts.events}件 / warning {standardPreview.counts.warnings}件 / error {standardPreview.counts.errors}件</p><button disabled={standardPreview.counts.errors > 0} onClick={applyStandardCsvSet}>標準CSVセットを反映</button>{standardPreview.issues.length > 0 && <ul className="issue-list">{standardPreview.issues.map((i,idx)=><li key={idx} className={i.severity}>{i.severity}: {i.code}: {i.message}</li>)}</ul>}</div>}</section><section className="panel"><h2>取込・レイアウト状況</h2><p className="notice">{status}</p>{exporting && <p className="notice">{exporting}を出力中...</p>}{isLoading && <p className="notice">保存データを読み込み中...</p>}<p>{persons.length}人 / Union {unions.length}件 / 親子 {relations.length}件 / Event {events.length}件 / 警告 {issues.filter(i=>i.severity==='warning').length}件</p>{[...issues, ...layout.issues].length===0 ? <p>エラー・警告なし</p> : <ul className="issue-list">{[...issues, ...layout.issues].map((i,idx)=><li key={idx} className={i.severity}>{i.severity}: {i.code}: {i.message}</li>)}</ul>}</section><ValidationPanel issues={validationIssues} persons={persons}/><SourceManager sources={sources} onSave={handleSaveSource} onDelete={handleDeleteSource}/><KosekiEntryPanel persons={persons} sources={sources} citations={citations} relations={relations} unions={unions} events={events} onCreateSource={handleSaveSource} onApply={handleApplyKosekiEntry}/><section className="panel"><h2>人物一覧</h2>{persons.length===0 && !isLoading ? <p>人物データがありません。CSVをインポートすると一覧に表示されます。</p> : <ul className="person-list">{persons.map((p)=><li key={p.id}><button className={p.id===safeSelectedId?'selected-list':''} onClick={()=>selectPersonTarget(p.id)}>{p.external_id} {p.display_name} {citedPersonIds.has(p.id) ? '📎' : ''}</button></li>)}</ul>}</section></aside><section className="canvas" ref={treeRef}><FamilyTreeView nodes={layout.layoutNodes} edges={layout.layoutEdges} viewBox={layout.viewBox} issues={layout.issues} citations={citations} citedPersonIds={citedPersonIds} selectedPersonId={safeSelectedId} onSelectPerson={(p)=>selectPersonTarget(p.id)}/></section><PersonDetailPanel person={selected} persons={persons} relations={relations} unions={unions} sources={sources} citations={citations} events={events} onChange={handlePersonChange} onSaveCitation={handleSaveCitation} onDeleteCitation={handleDeleteCitation} onSaveEvent={handleSaveEvent} onDeleteEvent={handleDeleteEvent} onDeleteParentChildRelation={handleDeleteParentChildRelation} onDeleteUnion={handleDeleteUnion} onSaveParentChildRelation={handleSaveParentChildRelation} onSaveUnion={handleSaveUnion}/></main></div>;
}
