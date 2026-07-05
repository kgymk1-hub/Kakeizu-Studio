import { useMemo, useRef, useState } from 'react';
import { CsvImport, sampleCsv } from './components/CsvImport/CsvImport';
import { FamilyTreeView } from './components/FamilyTreeView/FamilyTreeView';
import { PersonDetailPanel } from './components/PersonDetailPanel/PersonDetailPanel';
import type { ParentChildRelation, Person, Union, ValidationIssue } from './models';
import { importSimpleCsv } from './services/csvImportService';
import { exportSimpleCsv } from './services/csvExportService';
import { buildFamilyLayout } from './services/layoutService';
import { createJsonBackup } from './services/backupService';
import { downloadElementAsPdf, downloadElementAsPng } from './services/exportImageService';
import './styles/app.css';

export default function App() {
  const initial = useMemo(() => importSimpleCsv(sampleCsv, 'sample_family.csv'), []);
  const [persons, setPersons] = useState<Person[]>(initial.persons); const [unions, setUnions] = useState<Union[]>(initial.unions); const [relations, setRelations] = useState<ParentChildRelation[]>(initial.parentChildRelations); const [issues, setIssues] = useState<ValidationIssue[]>(initial.issues); const [selectedId, setSelectedId] = useState(initial.persons[0]?.id); const treeRef = useRef<HTMLDivElement>(null);
  const layout = useMemo(() => buildFamilyLayout(persons, unions, relations), [persons, unions, relations]); const selected = persons.find((p) => p.id === selectedId);
  const download = (name: string, content: string, type='text/plain') => { const a=document.createElement('a'); a.download=name; a.href=URL.createObjectURL(new Blob([content],{type})); a.click(); URL.revokeObjectURL(a.href); };
  return <div className="app"><header><div><h1>Kakeizu Studio</h1><p>CSV一括投入からPerson + Unionグラフを生成する、ローカルファースト家系図MVP</p></div><nav><button onClick={()=>download('family_simple.csv', exportSimpleCsv(persons, unions, relations), 'text/csv')}>CSV出力</button><button onClick={()=>download('kakeizu_backup.json', createJsonBackup({ persons, unions, parent_child_relations:relations, import_batches:[] }), 'application/json')}>JSONバックアップ</button><button onClick={()=>treeRef.current && downloadElementAsPng(treeRef.current)}>PNG出力</button><button onClick={()=>treeRef.current && downloadElementAsPdf(treeRef.current)}>PDF出力</button></nav></header><main><aside className="left"><CsvImport onImported={(d)=>{ setPersons(d.persons); setUnions(d.unions); setRelations(d.parentChildRelations); setIssues(d.issues); setSelectedId(d.persons[0]?.id); }}/><section className="panel"><h2>検証結果</h2>{issues.length===0 ? <p>エラー・警告なし</p> : <ul>{issues.map((i,idx)=><li key={idx} className={i.severity}>{i.code}: {i.message}</li>)}</ul>}</section><section className="panel"><h2>人物一覧</h2><ul>{persons.map((p)=><li key={p.id}><button onClick={()=>setSelectedId(p.id)}>{p.external_id} {p.display_name}</button></li>)}</ul></section></aside><section className="canvas" ref={treeRef}><FamilyTreeView nodes={layout.layoutNodes} edges={layout.layoutEdges} selectedPersonId={selectedId} onSelectPerson={(p)=>setSelectedId(p.id)}/></section><PersonDetailPanel person={selected} onChange={(next)=>setPersons((ps)=>ps.map((p)=>p.id===next.id?next:p))}/></main></div>;
}
