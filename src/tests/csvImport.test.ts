import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseSimpleCsv } from '../services/csvImportService';
describe('parseSimpleCsv', () => { it('正常CSVを読み込める', () => { const csv=readFileSync('src/tests/sample_family.csv','utf8'); const result=parseSimpleCsv(csv); expect(result.issues).toHaveLength(0); expect(result.rows).toHaveLength(9); }); it('列名マッピングが機能する', () => { const result=parseSimpleCsv('人物ID,名前\nP001,人物A'); expect(result.rows[0].person_id).toBe('P001'); }); it('必須列欠落を検出できる', () => { const result=parseSimpleCsv('person_id\nP001'); expect(result.issues.some(i=>i.code==='csv_validation_error')).toBe(true); }); });
