import Papa from 'papaparse';
import { rawCsvPersonSchema, type RawCsvPerson } from '../schemas/csvSchemas';
import type { ValidationIssue } from '../models';
import { normalizeCsvPersons } from './normalizationService';

export const standardColumnMap: Record<string, keyof RawCsvPerson> = { 'ID':'person_id','人物ID':'person_id','個人ID':'person_id','personId':'person_id','person_id':'person_id','名前':'name','氏名':'name','表示名':'name','人物名':'name','name':'name','性別':'gender','gender':'gender','sex':'gender','生年月日':'birth_date','生年':'birth_date','誕生日':'birth_date','出生日':'birth_date','birth':'birth_date','birth_date':'birth_date','没年月日':'death_date','没年':'death_date','死亡日':'death_date','death':'death_date','death_date':'death_date','父ID':'father_id','父':'father_id','父親':'father_id','父人物ID':'father_id','father':'father_id','father_id':'father_id','母ID':'mother_id','母':'mother_id','母親':'mother_id','母人物ID':'mother_id','mother':'mother_id','mother_id':'mother_id','配偶者ID':'spouse_ids','配偶者':'spouse_ids','夫婦':'spouse_ids','spouse':'spouse_ids','spouses':'spouse_ids','spouse_ids':'spouse_ids','世代':'generation_no','代数':'generation_no','generation':'generation_no','generation_no':'generation_no','称号':'title','肩書':'title','官位':'title','爵位':'title','title':'title','備考':'note','メモ':'note','note':'note','notes':'note','出典':'source','根拠':'source','source':'source','確度':'confidence','信頼度':'confidence','confidence':'confidence' };
export function applyColumnMapping(row: Record<string, unknown>, mapping: Record<string,string> = {}) { const out: Record<string, unknown> = {}; Object.entries(row).forEach(([k,v]) => { out[mapping[k] ?? standardColumnMap[k] ?? k] = v; }); return out; }
export function parseSimpleCsv(csvText: string, mapping: Record<string,string> = {}) {
  const parsed = Papa.parse<Record<string, unknown>>(csvText.replace(/^\uFEFF/, ''), { header:true, skipEmptyLines:true, transformHeader:(h) => h.trim() });
  const issues: ValidationIssue[] = parsed.errors.map((e) => ({ severity:'error', code:'csv_parse_error', message:e.message, row:e.row }));
  const rows: RawCsvPerson[] = [];
  parsed.data.forEach((raw, index) => { const result = rawCsvPersonSchema.safeParse(applyColumnMapping(raw, mapping)); if (result.success) rows.push(result.data); else result.error.issues.forEach((e) => issues.push({ severity:'error', code:'csv_validation_error', message:e.message, row:index+2, field:e.path.join('.') })); });
  return { rows, issues };
}
export function importSimpleCsv(csvText: string, sourceName?: string, mapping?: Record<string,string>) { const parsed = parseSimpleCsv(csvText, mapping); const normalized = normalizeCsvPersons(parsed.rows, sourceName); return { ...normalized, issues:[...parsed.issues, ...normalized.issues] }; }
