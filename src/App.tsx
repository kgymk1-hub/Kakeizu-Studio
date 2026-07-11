import { useEffect, useMemo, useRef, useState } from 'react';
import { CsvImport, ImportPolicySelector, PlaceholderPersonPolicySelector, UnresolvedReferencePreview, sampleCsv } from './components/CsvImport/CsvImport';
import { FamilyTreeView } from './components/FamilyTreeView/FamilyTreeView';
import { SourceManager } from './components/SourceManager/SourceManager';
import { PersonDetailPanel } from './components/PersonDetailPanel/PersonDetailPanel';
import { KosekiEntryPanel } from './components/KosekiEntryPanel';
import { ValidationPanel } from './components/ValidationPanel/ValidationPanel';
import { EventListPanel } from './components/EventListPanel/EventListPanel';
import { PersonListPanel } from './components/PersonListPanel/PersonListPanel';
import { SourceCitationPanel } from './components/SourceCitationPanel/SourceCitationPanel';
import { NamePlacePanel } from './components/NamePlacePanel';
import { ImportReportPanel } from './components/ImportReportPanel';
import { ImportStatusPanel } from './components/ImportStatusPanel';
import { ImportHistoryPanel } from './components/ImportHistoryPanel';
import { ProjectSettingsSummaryPanel } from './components/ProjectSettingsSummaryPanel';
import type { Citation, Event, ExportSetting, ImportBatch, Name, ParentChildRelation, Person, Place, PrivacySetting, Project, SelectableTarget, Source, Union, ValidationIssue, ViewSetting } from './models';
import { importSimpleCsv } from './services/csvImportService';
import { exportSimpleCsv } from './services/csvExportService';
import { buildFamilyLayout, sanitizeSelectedPersonId } from './services/layoutService';
import { createJsonBackup, parseJsonBackup } from './services/backupService';
import { createDefaultExportSetting, createDefaultPrivacySetting, createDefaultProject, createDefaultViewSetting, loadProjectSettings, saveExportSetting, savePrivacySetting, saveProject, saveViewSetting } from './services/projectSettingsService';
import { createStandardCsvSetZip, parseStandardCsvSetFileList, parseStandardCsvSetZip, type StandardCsvSetPreview } from './services/standardCsvSetService';
import { downloadElementAsPdf, downloadElementAsPng, downloadSvgFromElement } from './services/exportImageService';
import { validateFamilyData } from './services/validationService';
import { resolveSelectableTargetToPersonId } from './services/selectionService';
import { download } from './utils/download';
import { clearFamilyData, deleteParentChildRelationWithCitations, deleteUnionWithCitations, loadFamilyData, saveBackupData, saveFamilyData, saveKosekiEntryData, updateParentChildRelation, updatePerson, updateUnion } from './db/repositories/familyRepository';
import { addEvent, deleteEvent, updateEvent } from './db/repositories/eventRepository';
import { addCitation, addSource, deleteCitation, deleteSource, updateCitation, updateSource } from './db/repositories/sourceRepository';
import { addOrUpdateName, addOrUpdatePlace, deleteName, deletePlace } from './db/repositories/namePlaceRepository';
import type { NormalizedFamilyData } from './services/normalizationService';
import { buildStandardCsvSetImportPreview, getImportPolicyOption, type ImportPolicy, type ImportPreviewResult, type PlaceholderPersonPolicy } from './services/importPreviewService';
import { createImportBatchFromPreview, recentImportBatches } from './services/importBatchService';
import { createImportReportFromPreview, type ImportReport } from './services/importReportService';
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
  const [names, setNames] = useState<Name[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [status, setStatus] = useState('起動中...');
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState<string | undefined>();
  const backupRef = useRef<HTMLInputElement>(null);
  const standardCsvSetZipRef = useRef<HTMLInputElement>(null);
  const standardCsvSetFilesRef = useRef<HTMLInputElement>(null);
  const [standardPreview, setStandardPreview] = useState<StandardCsvSetPreview | undefined>();
  const [standardImportPolicy, setStandardImportPolicy] = useState<ImportPolicy>('replace_all');
  const [standardPlaceholderPersonPolicy, setStandardPlaceholderPersonPolicy] = useState<PlaceholderPersonPolicy>('warn_and_skip');
  const [lastImportReport, setLastImportReport] = useState<ImportReport | undefined>();
  const [project, setProject] = useState<Project>(createDefaultProject());
  const [viewSetting, setViewSetting] = useState<ViewSetting>(createDefaultViewSetting());
  const [exportSetting, setExportSetting] = useState<ExportSetting>(createDefaultExportSetting());
  const [privacySetting, setPrivacySetting] = useState<PrivacySetting>(createDefaultPrivacySetting());
  const treeRef = useRef<HTMLDivElement>(null);

  const applyData = (data: { persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatches?: ImportBatch[]; sources?: Source[]; citations?: Citation[]; events?: Event[]; names?: Name[]; places?: Place[]; issues?: ValidationIssue[] }) => {
    setPersons(data.persons); setUnions(data.unions); setRelations(data.parentChildRelations); setImportBatches(data.importBatches ?? []); setSources(data.sources ?? []); setCitations(data.citations ?? []); setEvents(data.events ?? []); setNames(data.names ?? []); setPlaces(data.places ?? []); setIssues(data.issues ?? []); setSelectedId(data.persons[0]?.id);
  };

  useEffect(() => { void (async () => {
    try {
      const settings = await loadProjectSettings();
      setProject(settings.project); setViewSetting(settings.viewSetting); setExportSetting(settings.exportSetting); setPrivacySetting(settings.privacySetting);
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
  const validationIssues = useMemo(() => validateFamilyData({ persons, unions, parentChildRelations: relations, events, sources, citations, names, places }), [persons, unions, relations, events, sources, citations, names, places]);

  useEffect(() => { if (selectedId && !safeSelectedId) setSelectedId(undefined); }, [selectedId, safeSelectedId]);

  const selectTarget = (target: SelectableTarget) => {
    const nextPersonId = target.target_type === 'name' ? names.find((n) => n.id === target.target_id)?.person_id : resolveSelectableTargetToPersonId(target, { persons, events, unions, relations });
    if (nextPersonId) {
      setSelectedId(nextPersonId);
      return true;
    }
    // Source / Citation targets are accepted here and will be routed to dedicated lists in later v0.6 phases.
    return false;
  };

  const selectPersonTarget = (personId: string) => selectTarget({ target_type: 'person', target_id: personId });

  const rebuildStandardPreview = (current: StandardCsvSetPreview | undefined, nextPolicy = standardImportPolicy, nextPlaceholderPolicy = standardPlaceholderPersonPolicy) => current ? { ...current, preview: buildStandardCsvSetImportPreview(current, undefined, { importPolicy: nextPolicy, placeholderPersonPolicy: nextPlaceholderPolicy, existingData: { persons, unions, parentChildRelations: relations, sources, citations, events } }) } : current;
  const handleStandardImportPolicyChange = (nextPolicy: ImportPolicy) => { setStandardImportPolicy(nextPolicy); setStandardPreview((current) => rebuildStandardPreview(current, nextPolicy, standardPlaceholderPersonPolicy)); };
  const handleStandardPlaceholderPersonPolicyChange = (nextPolicy: PlaceholderPersonPolicy) => { setStandardPlaceholderPersonPolicy(nextPolicy); setStandardPreview((current) => rebuildStandardPreview(current, standardImportPolicy, nextPolicy)); };

  const handleImported = async (data: NormalizedFamilyData, preview: ImportPreviewResult) => {
    setIssues(data.issues);
    if (hasErrors(data.issues) || !preview.canImport) { setStatus('エラーがあるため反映しませんでした。'); return false; }
    const fileNames = data.importBatch.source_name ? [data.importBatch.source_name] : [];
    const importBatch = createImportBatchFromPreview({ mode: 'simple_csv', preview, sourceLabel: 'かんたんCSV', fileNames });
    const report = createImportReportFromPreview({ batch: importBatch, preview, mode: 'simple_csv', sourceLabel: 'かんたんCSV', fileNames });
    await saveFamilyData({ ...data, importBatch });
    applyData({ ...data, importBatches: [importBatch] });
    setLastImportReport(report);
    setStatus('CSVインポート結果を保存しました。');
    return report;
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
    setStatus('出来事を保存しました。');
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setCitations((prev) => prev.filter((c) => !(c.target_type === 'event' && c.target_id === eventId)));
    setStatus('出来事と関連出典を削除しました。');
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


  const handleSavePlace = async (place: Place) => {
    await addOrUpdatePlace(place);
    setPlaces((prev) => prev.some((p) => p.id === place.id) ? prev.map((p) => p.id === place.id ? place : p) : [...prev, place]);
    setStatus('場所候補を保存しました。');
  };

  const handleDeletePlace = async (placeId: string) => {
    const nextEvents = events.map((event) => event.place_id === placeId ? { ...event, place_id: undefined, updated_at: new Date().toISOString() } : event);
    const nextSources = sources.map((source) => source.place_id === placeId ? { ...source, place_id: undefined, updated_at: new Date().toISOString() } : source);
    await Promise.all([
      deletePlace(placeId),
      ...nextEvents.filter((event, index) => event !== events[index]).map(updateEvent),
      ...nextSources.filter((source, index) => source !== sources[index]).map(updateSource),
      ...citations.filter((citation) => citation.target_type === 'place' && citation.target_id === placeId).map((citation) => deleteCitation(citation.id)),
    ]);
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    setEvents(nextEvents);
    setSources(nextSources);
    setCitations((prev) => prev.filter((c) => !(c.target_type === 'place' && c.target_id === placeId)));
    setStatus('場所候補を削除し、関連する出来事・資料からPlace参照を解除しました。');
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

  const exportJson = () => runExport('JSON', () => download('kakeizu_backup.json', createJsonBackup({ persons, unions, parent_child_relations: relations, import_batches: importBatches, sources, citations, events, names, places, projects: [project], view_settings: [viewSetting], export_settings: [exportSetting], privacy_settings: [privacySetting] }), 'application/json'));

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
      const preview = await parseStandardCsvSetZip(file, { importPolicy: standardImportPolicy, placeholderPersonPolicy: standardPlaceholderPersonPolicy, existingData: { persons, unions, parentChildRelations: relations, sources, citations, events } });
      showStandardCsvSetPreview(preview, '標準CSVセットZIP');
    } catch (error) {
      console.error('標準CSVセットの読み込みに失敗しました。', error);
      setStandardPreview(undefined);
      setStatus(error instanceof Error ? `標準CSVセットZIPの読み込みに失敗しました: ${error.message}` : '標準CSVセットZIPの読み込みに失敗しました。');
    }
  };

  const loadStandardCsvSetFilesPreview = async (files: FileList) => {
    try {
      const preview = await parseStandardCsvSetFileList(files, { importPolicy: standardImportPolicy, placeholderPersonPolicy: standardPlaceholderPersonPolicy, existingData: { persons, unions, parentChildRelations: relations, sources, citations, events } });
      showStandardCsvSetPreview(preview, '標準CSVセットの複数ファイル');
    } catch (error) {
      console.error('標準CSVセットの複数ファイル読み込みに失敗しました。', error);
      setStandardPreview(undefined);
      setStatus(error instanceof Error ? `標準CSVセットの複数ファイル読み込みに失敗しました: ${error.message}` : '標準CSVセットの複数ファイル読み込みに失敗しました。');
    }
  };

  const applyStandardCsvSet = async () => {
    if (!standardPreview) return;
    if (!standardPreview.preview.canImport) { setStatus(standardPreview.preview.summary.importPolicyStatus === 'preview_only' ? 'このインポート方式は現在プレビューのみ対応です。実行はできません。' : 'エラーがあるため標準CSVセットを反映できません。'); return; }
    if (standardPreview.counts.warnings > 0 && !confirm(`warningが${standardPreview.counts.warnings}件あります。現在の全データを置き換えて反映しますか？`)) return;
    const fileNames = ['manifest.json', ...(standardPreview.preview.files?.filter((file) => file.present).map((file) => file.fileName) ?? [])];
    const importBatch = createImportBatchFromPreview({ mode: 'standard_csv_set', preview: standardPreview.preview, sourceLabel: '標準CSVセット', fileNames });
    const report = createImportReportFromPreview({ batch: importBatch, preview: standardPreview.preview, mode: 'standard_csv_set', sourceLabel: '標準CSVセット', fileNames });
    const nextData = { ...standardPreview, importBatches: [importBatch] };
    await saveBackupData({ ...nextData, names, places });
    applyData({ ...nextData, issues: standardPreview.issues });
    setStandardPreview(undefined);
    setLastImportReport(report);
    setStatus('標準CSVセットを反映しました。');
  };


  const handlePublicOutputModeChange = async (checked: boolean) => {
    const next = { ...privacySetting, public_output_mode: checked };
    setPrivacySetting(next);
    try { setPrivacySetting(await savePrivacySetting(next)); } catch (error) { console.error('PrivacySetting保存に失敗しました。', error); }
  };

  const handleMaskLivingDatesChange = async (checked: boolean) => {
    const next = { ...privacySetting, mask_living_dates: checked };
    setPrivacySetting(next);
    try { setPrivacySetting(await savePrivacySetting(next)); } catch (error) { console.error('PrivacySetting保存に失敗しました。', error); }
  };

  const handleHidePrivatePersonsChange = async (checked: boolean) => {
    const next = { ...privacySetting, hide_private_persons: checked };
    setPrivacySetting(next);
    try { setPrivacySetting(await savePrivacySetting(next)); } catch (error) { console.error('PrivacySetting保存に失敗しました。', error); }
  };

  const handleHideHiddenPersonsChange = async (checked: boolean) => {
    const next = { ...privacySetting, hide_hidden_persons: checked };
    setPrivacySetting(next);
    try { setPrivacySetting(await savePrivacySetting(next)); } catch (error) { console.error('PrivacySetting保存に失敗しました。', error); }
  };

  const restoreBackup = async (file: File) => {
    if (!confirm('現在のデータを置き換えます。よろしいですか？')) return;
    try {
      const backup = parseJsonBackup(await file.text());
      await saveBackupData({ persons: backup.persons, unions: backup.unions, parentChildRelations: backup.parent_child_relations, importBatches: backup.import_batches, sources: backup.sources, citations: backup.citations, events: backup.events, names: backup.names, places: backup.places });
      const nextProject = backup.projects[0] ?? createDefaultProject(); const nextView = backup.view_settings[0] ?? createDefaultViewSetting(nextProject.id); const nextExport = backup.export_settings[0] ?? createDefaultExportSetting(nextProject.id); const nextPrivacy = backup.privacy_settings[0] ?? createDefaultPrivacySetting(nextProject.id);
      await Promise.all([saveProject(nextProject), saveViewSetting(nextView), saveExportSetting(nextExport), savePrivacySetting(nextPrivacy)]); setProject(nextProject); setViewSetting(nextView); setExportSetting(nextExport); setPrivacySetting(nextPrivacy);
      applyData({ persons: backup.persons, unions: backup.unions, parentChildRelations: backup.parent_child_relations, importBatches: backup.import_batches, sources: backup.sources, citations: backup.citations, events: backup.events, names: backup.names, places: backup.places, issues: [] });
      setStatus('JSONバックアップを復元しました。');
    } catch (error) {
      console.error('JSONバックアップの復元に失敗しました。', error);
      setStatus(error instanceof Error ? error.message : 'JSONバックアップの復元に失敗しました。');
    }
  };

  return <div className="app"><header><div><h1>Kakeizu Studio</h1><p>Version 0.9.0 / 戸籍資料・出典・出来事（Event）・関係根拠・データ検証・検索一覧・修正導線・家系図表示出力を管理できるローカルファースト家系図アプリ</p></div><nav><button disabled={!!exporting} onClick={exportCsv}>CSV出力</button><button disabled={!!exporting} onClick={exportJson}>JSONバックアップ</button><button disabled={!!exporting} onClick={exportStandardCsvSet}>標準CSVセットをエクスポート</button><input ref={backupRef} className="hidden-file" type="file" accept="application/json,.json" onChange={(e)=>{ const file=e.target.files?.[0]; if(file) void restoreBackup(file); }} /><button onClick={()=>backupRef.current?.click()}>JSONバックアップ復元</button><input ref={standardCsvSetZipRef} className="hidden-file" type="file" accept="application/zip,.zip" onChange={(e)=>{ const file=e.target.files?.[0]; if(file) void loadStandardCsvSetZipPreview(file); e.currentTarget.value=''; }} /><button onClick={()=>standardCsvSetZipRef.current?.click()}>標準CSVセットZIPを読み込む</button><input ref={standardCsvSetFilesRef} className="hidden-file" type="file" multiple accept="application/json,.json,text/csv,.csv" onChange={(e)=>{ const files=e.target.files; if(files?.length) void loadStandardCsvSetFilesPreview(files); e.currentTarget.value=''; }} /><button onClick={()=>standardCsvSetFilesRef.current?.click()}>標準CSVセットの複数ファイルを読み込む</button><button onClick={handleClear}>データ全削除</button><button disabled={!!exporting} onClick={exportPng}>PNG出力</button><button disabled={!!exporting} onClick={exportPdf}>PDF出力</button><button disabled={!!exporting} onClick={exportSvg}>SVG出力</button></nav></header><main><aside className="left"><ProjectSettingsSummaryPanel projectName={project.name} privacySetting={privacySetting} onPublicOutputModeChange={(checked)=>{ void handlePublicOutputModeChange(checked); }} onMaskLivingDatesChange={(checked)=>{ void handleMaskLivingDatesChange(checked); }} onHidePrivatePersonsChange={(checked)=>{ void handleHidePrivatePersonsChange(checked); }} onHideHiddenPersonsChange={(checked)=>{ void handleHideHiddenPersonsChange(checked); }}/><CsvImport onImported={handleImported} existingData={{ persons, unions, parentChildRelations: relations, sources, citations, events }}/><section className="panel"><h2>標準CSVセット</h2><p>標準CSVセットは、人物・夫婦関係・親子関係・資料・出典・出来事（Event）をまとめて出し入れする形式です。Excelや外部ツールで編集したい場合、または資料・出典を保持したまま移行したい場合に使います。既存の単一CSVインポートは手軽な人物投入用です。</p><p className="notice">標準CSVセットZIPはKakeizu Studioで再インポート可能です。Excel等で編集する場合はZIPを展開してCSVを編集し、再ZIP化せず複数ファイル選択で読み込めます。</p><p className="notice">ZIP読み込みは、Kakeizu Studioが出力した標準CSVセットZIPを想定しています。現時点のZIP読込は無圧縮ZIP前提です。外部ツールで再圧縮したZIPが読めない場合は、複数ファイル直接読み込みを使用してください。</p>{standardPreview && <div><h3>インポート前プレビュー</h3><ImportPolicySelector name="standard-import-policy" importPolicy={standardImportPolicy} onChange={handleStandardImportPolicyChange} /><PlaceholderPersonPolicySelector name="standard-placeholder-policy" policy={standardPlaceholderPersonPolicy} onChange={handleStandardPlaceholderPersonPolicyChange} /><p className="warning"><strong>インポート方式：{getImportPolicyOption(standardPreview.preview.summary.importPolicy).label}</strong>。{standardPreview.preview.summary.importPolicy === 'replace_all' ? '反映すると、現在の人物・関係・資料・出典・出来事は標準CSVセットの内容で置き換えられます。' : 'このインポート方式は現在プレビューのみ対応です。実行はできません。'}</p><div className="preview-metrics"><span>総行数: {standardPreview.preview.summary.totalRows}</span><span>正常行: {standardPreview.preview.summary.validRows}</span><span>警告行: {standardPreview.preview.summary.warningRows}</span><span>エラー行: {standardPreview.preview.summary.errorRows}</span><span>warning: {standardPreview.preview.summary.warningIssues}</span><span>error: {standardPreview.preview.summary.errorIssues}</span></div><h4>読み込まれたファイル</h4><ul className="compact-list">{standardPreview.preview.files?.map((file)=><li key={file.fileName}>{file.fileName}: {file.present ? `${file.rows}件` : 'なし'}</li>)}<li>manifest.json: {standardPreview.preview.manifestPresent ? 'あり' : 'なし'}</li></ul><div className="match-preview"><h4>external_id / id 照合結果</h4><div className="preview-metrics"><span>新規候補: {standardPreview.preview.summary.matchSummary.newItems}件</span><span>既存一致候補: {standardPreview.preview.summary.matchSummary.matchedExisting}件</span><span>CSV内重複: {standardPreview.preview.summary.matchSummary.duplicateInImport}件</span><span>external_idなし: {standardPreview.preview.summary.matchSummary.missingExternalId}件</span></div><h4>このインポート方式での予定処理</h4><div className="preview-metrics"><span>作成候補: {standardPreview.preview.summary.policyPlan.create}件</span><span>更新候補: {standardPreview.preview.summary.policyPlan.update}件</span><span>スキップ候補: {standardPreview.preview.summary.policyPlan.skip}件</span><span>別ID追加候補: {standardPreview.preview.summary.policyPlan.addAsNew}件</span><span>全置換対象: {standardPreview.preview.summary.policyPlan.replace}件</span><span>保留/要確認: {standardPreview.preview.summary.policyPlan.blocked}件</span></div><h4>照合詳細</h4><ul className="compact-list">{standardPreview.preview.matches.slice(0,10).map((m,idx)=><li key={`${m.entityType}-${m.importId ?? m.externalId ?? idx}`}>{m.fileName}: {m.externalId ?? m.importId ?? '(external_idなし)'} / {m.displayName ?? '-'} / {m.status}{m.existingId ? `: ${m.existingId}` : ''}</li>)}</ul></div><UnresolvedReferencePreview preview={standardPreview.preview} /><h4>反映予定</h4><p>Person {standardPreview.preview.summary.plannedCreate.persons}件 / Union {standardPreview.preview.summary.plannedCreate.unions}件 / ParentChildRelation {standardPreview.preview.summary.plannedCreate.relations}件 / Source {standardPreview.preview.summary.plannedCreate.sources}件 / Citation {standardPreview.preview.summary.plannedCreate.citations}件 / Event {standardPreview.preview.summary.plannedCreate.events}件</p>{!standardPreview.preview.canImport ? <p className="error">{standardPreview.preview.summary.importPolicyStatus === 'preview_only' ? 'このインポート方式は現在プレビューのみ対応です。実行はできません。' : 'エラーがあるため反映不可です。'}</p> : standardPreview.preview.hasWarnings ? <p className="warning">警告があります。内容を確認すれば反映可能です。</p> : <p className="success">エラー・警告なし。反映可能です。</p>}<button disabled={!standardPreview.preview.canImport} onClick={applyStandardCsvSet}>標準CSVセットを反映</button><div className="issue-box">{standardPreview.preview.issues.length === 0 ? <p>問題はありません。</p> : <ul className="issue-list">{standardPreview.preview.issues.map((i,idx)=><li key={idx} className={i.severity}><strong>{i.severity}</strong> [{i.code}] {i.fileName && <span>file: {i.fileName} / </span>}{i.rowNumber && <span>行: {i.rowNumber} / </span>}{i.field && <span>列: {i.field} / </span>}{i.targetType && <span>対象: {i.targetType} </span>}{i.targetId && <span>ID: {i.targetId} / </span>}{i.message}</li>)}</ul>}</div></div>}</section><ImportStatusPanel status={status} exporting={exporting} isLoading={isLoading} personCount={persons.length} unionCount={unions.length} relationCount={relations.length} eventCount={events.length} warningCount={issues.filter((issue) => issue.severity === 'warning').length} issues={[...issues, ...layout.issues]}/><ImportReportPanel report={lastImportReport}/><ImportHistoryPanel batches={recentImportBatches(importBatches)}/><ValidationPanel issues={validationIssues} persons={persons} onSelectTarget={selectTarget}/><SourceManager sources={sources} onSave={handleSaveSource} onDelete={handleDeleteSource}/><KosekiEntryPanel persons={persons} sources={sources} citations={citations} relations={relations} unions={unions} events={events} onCreateSource={handleSaveSource} onApply={handleApplyKosekiEntry}/><PersonListPanel persons={persons} citations={citations} selectedPersonId={safeSelectedId} onSelectTarget={selectTarget}/><EventListPanel events={events} persons={persons} unions={unions} relations={relations} onSelectTarget={selectTarget}/><SourceCitationPanel sources={sources} citations={citations} persons={persons} events={events} unions={unions} relations={relations} names={names} places={places} onSelectTarget={selectTarget}/><NamePlacePanel names={names} places={places} persons={persons} onSelectTarget={selectTarget} onSavePlace={handleSavePlace} onDeletePlace={handleDeletePlace}/></aside><section className="canvas" ref={treeRef}><FamilyTreeView nodes={layout.layoutNodes} edges={layout.layoutEdges} viewBox={layout.viewBox} issues={layout.issues} citations={citations} citedPersonIds={citedPersonIds} selectedPersonId={safeSelectedId} displayMode={viewSetting.tree_display_mode} onDisplayModeChange={async (mode)=>{ const next={...viewSetting, tree_display_mode: mode}; setViewSetting(next); try{ setViewSetting(await saveViewSetting(next)); }catch(error){ console.error('ViewSetting保存に失敗しました。', error); } }} showRelationLegend={viewSetting.show_relation_legend} onShowRelationLegendChange={async (show)=>{ const nextView={...viewSetting, show_relation_legend: show}; const nextExport={...exportSetting, show_legend: show}; setViewSetting(nextView); setExportSetting(nextExport); try{ const [savedView, savedExport]=await Promise.all([saveViewSetting(nextView), saveExportSetting(nextExport)]); setViewSetting(savedView); setExportSetting(savedExport); }catch(error){ console.error('凡例設定保存に失敗しました。', error); } }} exportAppearance={{ showTitle: exportSetting.show_title, title: exportSetting.title, showLegend: exportSetting.show_legend, background: exportSetting.background }} onExportAppearanceChange={async (appearance)=>{ const next={...exportSetting, show_title: appearance.showTitle, title: appearance.title, show_legend: appearance.showLegend, background: appearance.background}; const nextView={...viewSetting, show_relation_legend: appearance.showLegend}; setExportSetting(next); setViewSetting(nextView); try{ const [savedExport, savedView]=await Promise.all([saveExportSetting(next), saveViewSetting(nextView)]); setExportSetting(savedExport); setViewSetting(savedView); }catch(error){ console.error('ExportSetting保存に失敗しました。', error); } }} privacySetting={privacySetting} onSelectPerson={(p)=>selectPersonTarget(p.id)}/></section><PersonDetailPanel person={selected} persons={persons} relations={relations} unions={unions} sources={sources} citations={citations} events={events} onChange={handlePersonChange} onSaveCitation={handleSaveCitation} onDeleteCitation={handleDeleteCitation} onSaveEvent={handleSaveEvent} onDeleteEvent={handleDeleteEvent} onDeleteParentChildRelation={handleDeleteParentChildRelation} onDeleteUnion={handleDeleteUnion} onSaveParentChildRelation={handleSaveParentChildRelation} names={names} places={places} onSaveName={async (name)=>{ await addOrUpdateName(name); setNames((prev)=>prev.some((n)=>n.id===name.id)?prev.map((n)=>n.id===name.id?name:n):[...prev,name]); setStatus('名前・別名を保存しました。'); }} onDeleteName={async (nameId)=>{ await deleteName(nameId); setNames((prev)=>prev.filter((n)=>n.id!==nameId)); setCitations((prev)=>prev.filter((c)=>!(c.target_type==='name'&&c.target_id===nameId))); setStatus('名前・別名を削除しました。'); }} onSavePlace={handleSavePlace} onSaveUnion={handleSaveUnion}/></main></div>;
}
