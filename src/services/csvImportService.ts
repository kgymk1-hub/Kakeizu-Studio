import Papa from 'papaparse';
import { rawCsvPersonSchema, type RawCsvPerson } from '../schemas/csvSchemas';
import type { ValidationIssue } from '../models';
import { normalizeCsvPersons } from './normalizationService';

export const standardColumnMap: Record<string, keyof RawCsvPerson> = { '人物ID':'person_id','ID':'person_id','名前':'name','氏名':'name','父':'father_id','母':'mother_id','配偶者':'spouse_ids','生年':'birth_date','没年':'death_date','性別':'gender','備考':'note','出典':'source','確度':'confidence' };
export function applyColumnMapping(row: Record<string, unknown>, mapping: Record<string,string> = {}) { const out: Record<string, unknown> = {}; Object.entries(row).forEach(([k,v]) => { out[mapping[k] ?? standardColumnMap[k] ?? k] = v; }); return out; }
export function parseSimpleCsv(csvText: string, mapping: Record<string,string> = {}) {
  const parsed = Papa.parse<Record<string, unknown>>(csvText.replace(/^\uFEFF/, ''), { header:true, skipEmptyLines:true, transformHeader:(h) => h.trim() });
  const issues: ValidationIssue[] = parsed.errors.map((e) => ({ severity:'error', code:'csv_parse_error', message:e.message, row:e.row }));
  const rows: RawCsvPerson[] = [];
  parsed.data.forEach((raw, index) => { const result = rawCsvPersonSchema.safeParse(applyColumnMapping(raw, mapping)); if (result.success) rows.push(result.data); else result.error.issues.forEach((e) => issues.push({ severity:'error', code:'csv_validation_error', message:e.message, row:index+2, field:e.path.join('.') })); });
  return { rows, issues };
}
export function importSimpleCsv(csvText: string, sourceName?: string, mapping?: Record<string,string>) { const parsed = parseSimpleCsv(csvText, mapping); const normalized = normalizeCsvPersons(parsed.rows, sourceName); return { ...normalized, issues:[...parsed.issues, ...normalized.issues] }; }
