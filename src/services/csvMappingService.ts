import Papa from 'papaparse';
import { importSimpleCsv, parseSimpleCsv } from './csvImportService';
import type { RawCsvPerson } from '../schemas/csvSchemas';
import type { NormalizedFamilyData } from './normalizationService';

export const APP_COLUMNS = ['person_id','name','gender','birth_date','death_date','father_id','mother_id','spouse_ids','generation_no','title','note','source','confidence'] as const;
export type AppColumn = typeof APP_COLUMNS[number];
export type ColumnMapping = Record<string, AppColumn | ''>;

const aliases: Record<AppColumn, string[]> = {
  person_id: ['ID','人物ID','個人ID','personId','person_id'],
  name: ['名前','氏名','表示名','人物名','name'],
  gender: ['性別','gender','sex'],
  birth_date: ['生年月日','生年','誕生日','出生日','birth','birth_date'],
  death_date: ['没年月日','没年','死亡日','death','death_date'],
  father_id: ['父ID','父','父親','父人物ID','father','father_id'],
  mother_id: ['母ID','母','母親','母人物ID','mother','mother_id'],
  spouse_ids: ['配偶者ID','配偶者','夫婦','spouse','spouses','spouse_ids'],
  generation_no: ['世代','代数','generation','generation_no'],
  title: ['称号','肩書','官位','爵位','title'],
  note: ['備考','メモ','note','notes'],
  source: ['出典','根拠','source'],
  confidence: ['確度','信頼度','confidence'],
};

const aliasLookup = new Map<string, AppColumn>();
Object.entries(aliases).forEach(([column, names]) => names.forEach((name) => aliasLookup.set(name.toLowerCase(), column as AppColumn)));

export const SAMPLE_CSV = `person_id,name,gender,birth_date,death_date,father_id,mother_id,spouse_ids,generation_no,title,note,source,confidence
P001,山田太郎,male,1900,1970,,,,1,初代,,サンプル,confirmed
P002,佐藤花子,female,1905,1980,,,P001,1,,,サンプル,confirmed
P003,山田一郎,male,1930,2000,P001,P002,P004,2,,,サンプル,confirmed
P004,鈴木春子,female,1935,2010,,,P003,2,,,サンプル,confirmed
P005,山田次郎,male,1960,,P003,P004,,3,,,サンプル,confirmed
P006,山田三郎,male,1965,,P003,P004,,3,,,サンプル,confirmed
P007,田中夏子,female,1940,, , ,P003,2,再婚相手,,サンプル,likely
P008,山田四郎,male,1975,,P003,P007,,3,片親再婚後の子,,サンプル,likely
P009,母不明の子,male,1980,,P003,,,3,母不明,,サンプル,uncertain`;

export const CHATGPT_CSV_PROMPT = `以下の家系について、Kakeizu StudioにインポートできるCSVを作成してください。

CSV列は必ず以下にしてください。

person_id,name,gender,birth_date,death_date,father_id,mother_id,spouse_ids,generation_no,title,note,source,confidence

条件：
- person_idは重複しない英数字IDにする
- nameは必須
- genderは male / female / unknown のいずれかにする
- father_id と mother_id には親の person_id を入れる
- spouse_ids には配偶者の person_id を入れる
- 配偶者が複数いる場合は ; 区切りにする
- 不明な項目は空欄にする
- 確実でない情報は confidence を uncertain にする
- source には根拠資料名またはURL概要を書く
- CSVとしてそのまま保存できる形式で出力する`;

export function getCsvHeaders(csvText: string) {
  const parsed = Papa.parse<Record<string, unknown>>(csvText.replace(/^\uFEFF/, ''), { header: true, preview: 1, transformHeader: (h) => h.trim() });
  return parsed.meta.fields?.filter(Boolean) ?? [];
}

export function suggestColumnMapping(headers: string[]): ColumnMapping {
  return Object.fromEntries(headers.map((header) => [header, aliasLookup.get(header.trim().toLowerCase()) ?? ''])) as ColumnMapping;
}

export function validateColumnMapping(mapping: ColumnMapping) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const mapped = Object.values(mapping).filter(Boolean) as AppColumn[];
  (['person_id', 'name'] as AppColumn[]).forEach((required) => { if (!mapped.includes(required)) errors.push(`必須項目 ${required} が未マッピングです。`); });
  APP_COLUMNS.forEach((column) => {
    const count = mapped.filter((value) => value === column).length;
    if (count > 1) errors.push(`${column} に複数のCSV列が割り当てられています。`);
  });
  if (Object.values(mapping).some((value) => value === '')) warnings.push('取り込まないCSV列があります。');
  return { errors, warnings, canImport: errors.length === 0 };
}

export function convertCsvToStandardRows(csvText: string, mapping: ColumnMapping) {
  const parsed = Papa.parse<Record<string, unknown>>(csvText.replace(/^\uFEFF/, ''), { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim() });
  return parsed.data.map((raw) => {
    const row: Record<string, unknown> = {};
    Object.entries(mapping).forEach(([csvColumn, appColumn]) => { if (appColumn) row[appColumn] = raw[csvColumn]; });
    return row;
  });
}

export function convertCsvToStandard(csvText: string, mapping: ColumnMapping) {
  return Papa.unparse(convertCsvToStandardRows(csvText, mapping), { columns: [...APP_COLUMNS] });
}

export function analyzeMappedCsv(csvText: string, mapping: ColumnMapping, sourceName?: string) {
  const standardCsv = convertCsvToStandard(csvText, mapping);
  const parsed = parseSimpleCsv(standardCsv);
  const result = importSimpleCsv(standardCsv, sourceName);
  const errorCount = result.issues.filter((i) => i.severity === 'error').length;
  const warningCount = result.issues.filter((i) => i.severity === 'warning').length;
  const spouseDeclarations = parsed.rows.reduce((sum, row) => sum + (row.spouse_ids?.split(';').map((x) => x.trim()).filter(Boolean).length ?? 0), 0);
  return {
    standardCsv,
    parsedRows: parsed.rows,
    result,
    summary: {
      personCount: result.persons.length,
      unionCount: result.unions.length,
      relationCount: result.parentChildRelations.length,
      warningCount,
      errorCount,
      placeholderPersonCount: result.issues.filter((i) => i.code === 'unknown_parent_id' || i.code === 'unknown_spouse_id').length,
      autoCompletedSpouseCount: Math.max(0, spouseDeclarations - result.unions.length),
      canImport: errorCount === 0,
    },
  };
}

export function isImportAllowed(data: NormalizedFamilyData) {
  return !data.issues.some((issue) => issue.severity === 'error');
}
