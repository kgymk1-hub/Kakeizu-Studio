import { useState } from 'react';
import { importSimpleCsv } from '../../services/csvImportService';
import type { NormalizedFamilyData } from '../../services/normalizationService';
export function CsvImport({ onImported }: { onImported: (data: NormalizedFamilyData) => void }) { const [text,setText]=useState(''); const [message,setMessage]=useState(''); return <section className="panel"><h2>CSVインポート</h2><textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="family_simple.csvの内容を貼り付け"/><button onClick={()=>{ const result=importSimpleCsv(text || sampleCsv, 'pasted_family.csv'); onImported(result); setMessage(`${result.persons.length}人 / Union ${result.unions.length}件 / 警告・エラー ${result.issues.length}件`); }}>CSVを正規化して表示</button><button onClick={()=>setText(sampleCsv)}>サンプルCSVを読み込む</button>{message && <p className="notice">{message}</p>}</section>; }
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
