import { useMemo, useRef, useState } from 'react';
import { CsvImport, sampleCsv } from './components/CsvImport/CsvImport';
import { FamilyTreeView } from './components/FamilyTreeView/FamilyTreeView';
import { PersonDetailPanel } from './components/PersonDetailPanel/PersonDetailPanel';
import type { ParentChildRelation, Person, Union, ValidationIssue } from './models';
import { createJsonBackup } from './services/backupService';
import { exportSimpleCsv } from './services/csvExportService';
import { importSimpleCsv } from './services/csvImportService';
import { downloadElementAsPdf, downloadElementAsPng } from './services/exportImageService';
import { addRelative, type RelativeKind } from './services/familyEditService';
import { buildFamilyLayout } from './services/layoutService';
import './styles/app.css';

export default function App() {
  const initial = useMemo(() => importSimpleCsv(sampleCsv, 'sample_family.csv'), []);
  const [persons, setPersons] = useState<Person[]>(initial.persons);
  const [unions, setUnions] = useState<Union[]>(initial.unions);
  const [relations, setRelations] = useState<ParentChildRelation[]>(initial.parentChildRelations);
  const [issues, setIssues] = useState<ValidationIssue[]>(initial.issues);
  const [selectedId, setSelectedId] = useState(initial.persons[0]?.id);
  const treeRef = useRef<HTMLDivElement>(null);

  const layout = useMemo(
    () => buildFamilyLayout(persons, unions, relations),
    [persons, unions, relations],
  );
  const selected = persons.find((person) => person.id === selectedId);

  const download = (name: string, content: string, type = 'text/plain') => {
    const anchor = document.createElement('a');
    anchor.download = name;
    anchor.href = URL.createObjectURL(new Blob([content], { type }));
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const handleAddRelative = (kind: RelativeKind) => {
    if (!selectedId) return;

    const next = addRelative(
      { persons, unions, parentChildRelations: relations },
      { basePersonId: selectedId, kind, displayName: '' },
    );
    const addedPerson = next.persons.at(-1);

    setPersons(next.persons);
    setUnions(next.unions);
    setRelations(next.parentChildRelations);
    if (addedPerson) setSelectedId(addedPerson.id);
  };

  return (
    <div className="app">
      <header>
        <div>
          <h1>Kakeizu Studio</h1>
          <p>CSV一括投入からPerson + Unionグラフを生成する、ローカルファースト家系図MVP</p>
        </div>
        <nav>
          <button onClick={() => download('family_simple.csv', exportSimpleCsv(persons, unions, relations), 'text/csv')}>
            CSV出力
          </button>
          <button
            onClick={() => download(
              'kakeizu_backup.json',
              createJsonBackup({
                persons,
                unions,
                parent_child_relations: relations,
                import_batches: [],
              }),
              'application/json',
            )}
          >
            JSONバックアップ
          </button>
          <button onClick={() => treeRef.current && downloadElementAsPng(treeRef.current)}>PNG出力</button>
          <button onClick={() => treeRef.current && downloadElementAsPdf(treeRef.current)}>PDF出力</button>
        </nav>
      </header>
      <main>
        <aside className="left">
          <CsvImport
            onImported={(data) => {
              setPersons(data.persons);
              setUnions(data.unions);
              setRelations(data.parentChildRelations);
              setIssues(data.issues);
              setSelectedId(data.persons[0]?.id);
            }}
          />
          <section className="panel">
            <h2>検証結果</h2>
            {issues.length === 0 ? (
              <p>エラー・警告なし</p>
            ) : (
              <ul>
                {issues.map((issue, index) => (
                  <li key={`${issue.code}-${index}`} className={issue.severity}>
                    {issue.code}: {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="panel">
            <h2>人物一覧</h2>
            <ul>
              {persons.map((person) => (
                <li key={person.id}>
                  <button onClick={() => setSelectedId(person.id)}>
                    {person.external_id} {person.display_name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
        <section className="canvas" ref={treeRef}>
          <FamilyTreeView
            nodes={layout.layoutNodes}
            edges={layout.layoutEdges}
            selectedPersonId={selectedId}
            onSelectPerson={(person) => setSelectedId(person.id)}
          />
        </section>
        <PersonDetailPanel
          person={selected}
          onChange={(nextPerson) => setPersons((current) => current.map((person) => (
            person.id === nextPerson.id ? nextPerson : person
          )))}
          onAddRelative={handleAddRelative}
        />
      </main>
    </div>
  );
}
