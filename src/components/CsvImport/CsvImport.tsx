import { useRef, useState } from 'react';
import { importSimpleCsv } from '../../services/csvImportService';
import type { NormalizedFamilyData } from '../../services/normalizationService';

export async function readCsvFileAsText(file: File) {
  return file.text();
}

export function CsvImport({ onImported }: { onImported: (data: NormalizedFamilyData) => Promise<boolean> | boolean }) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const runImport = async () => {
    const result = importSimpleCsv(text || sampleCsv, 'family_simple.csv');
    const applied = await onImported(result);
    const warningCount = result.issues.filter((i) => i.severity === 'warning').length;
    const errorCount = result.issues.filter((i) => i.severity === 'error').length;
    setMessage(`${result.persons.length}人 / Union ${result.unions.length}件 / 親子 ${result.parentChildRelations.length}件 / 警告 ${warningCount}件 / エラー ${errorCount}件${applied ? '（反映済み）' : '（未反映）'}`);
  };

  return <section className="panel import-panel"><h2>CSVインポート</h2>
    <input ref={fileRef} className="hidden-file" type="file" accept=".csv,text/csv" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setText(await readCsvFileAsText(file)); setMessage(`${file.name} を読み込みました。内容を確認してインポートしてください。`); }} />
    <div className="button-row"><button onClick={() => fileRef.current?.click()}>CSVファイルを選択</button><button onClick={() => setText(sampleCsv)}>サンプルCSVを読み込む</button></div>
    <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="family_simple.csvの内容を貼り付け、またはCSVファイルを選択"/>
    <button className="primary" onClick={runImport}>CSVを検証して反映</button>{message && <p className="notice">{message}</p>}
  </section>;
}
export const sampleCsv = `person_id,name,gender,birth_date,death_date,father_id,mother_id,spouse_ids,generation_no,title,note,source,confidence
P001,山田太郎,male,1900,1970,,,,1,初代,,サンプル,confirmed
P002,佐藤花子,female,1905,1980,,,P001,1,,,サンプル,confirmed
P003,山田一郎,male,1930,2000,P001,P002,P004,2,,,サンプル,confirmed
P004,鈴木春子,female,1935,2010,,,P003,2,,,サンプル,confirmed
P005,山田次郎,male,1960,,P003,P004,,3,,,サンプル,confirmed
P006,山田三郎,male,1965,,P003,P004,,3,,,サンプル,confirmed
P007,田中夏子,female,1940,, , ,P003,2,再婚相手,,サンプル,likely
P008,山田四郎,male,1975,,P003,P007,,3,片親再婚後の子,,サンプル,likely
P009,母不明の子,male,1980,,P003,,,3,母不明,,サンプル,uncertain`;
