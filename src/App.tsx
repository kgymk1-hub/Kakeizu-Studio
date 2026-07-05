import { useEffect, useMemo, useRef, useState } from 'react';
import { CsvImport, sampleCsv } from './components/CsvImport/CsvImport';
import { FamilyTreeView } from './components/FamilyTreeView/FamilyTreeView';
import { PersonDetailPanel } from './components/PersonDetailPanel/PersonDetailPanel';
import type { ImportBatch, ParentChildRelation, Person, Union, ValidationIssue } from './models';
import { importSimpleCsv } from './services/csvImportService';
import { exportSimpleCsv } from './services/csvExportService';
import { buildFamilyLayout } from './services/layoutService';
import { createJsonBackup, parseJsonBackup } from './services/backupService';
import { downloadElementAsPdf, downloadElementAsPng } from './services/exportImageService';
import { download } from './utils/download';
import { clearFamilyData, loadFamilyData, saveBackupData, saveFamilyData, updatePerson } from './db/repositories/familyRepository';
import type { NormalizedFamilyData } from './services/normalizationService';
import './styles/app.css';

const hasErrors = (issues: ValidationIssue[]) => issues.some((i) => i.severity === 'error');

export default function App() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [relations, setRelations] = useState<ParentChildRelation[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [status, setStatus] = useState('起動中...');
  const backupRef = useRef<HTMLInputElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  const applyData = (data: { persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatches?: ImportBatch[]; issues?: ValidationIssue[] }) => {
    setPersons(data.persons); setUnions(data.unions); setRelations(data.parentChildRelations); setImportBatches(data.importBatches ?? []); setIssues(data.issues ?? []); setSelectedId(data.persons[0]?.id);
  };

  useEffect(() => { void (async () => {
    const stored = await loadFamilyData();
    if (stored.persons.length > 0) { applyData(stored); setStatus('保存済みデータを読み込みました。'); return; }
    const sample = importSimpleCsv(sampleCsv, 'sample_family.csv');
    applyData({ ...sample, importBatches: [sample.importBatch] });
    setStatus('保存データがないためサンプルを表示しています。');
  })(); }, []);

  const layout = useMemo(() => buildFamilyLayout(persons, unions, relations), [persons, unions, relations]);
  const selected = persons.find((p) => p.id === selectedId);

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

  const handleClear = async () => {
    if (!confirm('Dexie上の全データを削除します。よろしいですか？')) return;
    await clearFamilyData();
    const sample = importSimpleCsv(sampleCsv, 'sample_family.csv');
    applyData({ ...sample, importBatches: [sample.importBatch] });
    setStatus('全データを削除し、サンプル表示に戻しました。');
  };

  const restoreBackup = async (file: File) => {
    if (!confirm('現在のデータを置き換えます。よろしいですか？')) return;
    try {
      const backup = parseJsonBackup(await file.text());
      await saveBackupData({ persons: backup.persons, unions: backup.unions, parentChildRelations: backup.parent_child_relations, importBatches: backup.import_batches });
      applyData({ persons: backup.persons, unions: backup.unions, parentChildRelations: backup.parent_child_relations, importBatches: backup.import_batches, issues: [] });
      setStatus('JSONバックアップを復元しました。');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'JSONバックアップの復元に失敗しました。');
    }
  };

  return <div className="app"><header><div><h1>Kakeizu Studio</h1><p>CSVから家系図を作るローカルファーストMVP</p></div><nav><button onClick={()=>download('family_simple.csv', exportSimpleCsv(persons, unions, relations), 'text/csv')}>CSV出力</button><button onClick={()=>download('kakeizu_backup.json', createJsonBackup({ persons, unions, parent_child_relations:relations, import_batches:importBatches }), 'application/json')}>JSONバックアップ</button><input ref={backupRef} className="hidden-file" type="file" accept="application/json,.json" onChange={(e)=>{ const file=e.target.files?.[0]; if(file) void restoreBackup(file); }} /><button onClick={()=>backupRef.current?.click()}>JSON復元</button><button onClick={handleClear}>データ全削除</button><button onClick={()=>treeRef.current && downloadElementAsPng(treeRef.current)}>PNG出力</button><button onClick={()=>treeRef.current && downloadElementAsPdf(treeRef.current)}>PDF出力</button></nav></header><main><aside className="left"><CsvImport onImported={handleImported}/><section className="panel"><h2>検証結果</h2><p className="notice">{status}</p><p>{persons.length}人 / Union {unions.length}件 / 親子 {relations.length}件 / 警告 {issues.filter(i=>i.severity==='warning').length}件</p>{issues.length===0 ? <p>エラー・警告なし</p> : <ul className="issue-list">{issues.map((i,idx)=><li key={idx} className={i.severity}>{i.severity}: {i.code}: {i.message}</li>)}</ul>}</section><section className="panel"><h2>人物一覧</h2><ul className="person-list">{persons.map((p)=><li key={p.id}><button className={p.id===selectedId?'selected-list':''} onClick={()=>setSelectedId(p.id)}>{p.external_id} {p.display_name}</button></li>)}</ul></section></aside><section className="canvas" ref={treeRef}><FamilyTreeView nodes={layout.layoutNodes} edges={layout.layoutEdges} selectedPersonId={selectedId} onSelectPerson={(p)=>setSelectedId(p.id)}/></section><PersonDetailPanel person={selected} onChange={handlePersonChange}/></main></div>;
}
