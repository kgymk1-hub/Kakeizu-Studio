import { describe, expect, it } from 'vitest';
import { analyzeMappedCsv, convertCsvToStandardRows, SAMPLE_CSV, suggestColumnMapping, validateColumnMapping } from '../services/csvMappingService';

describe('csvMappingService', () => {
  it('日本語列名が自動マッピングされる', () => {
    const mapping = suggestColumnMapping(['人物ID', '氏名', '父', '母', '配偶者', '生年']);
    expect(mapping).toMatchObject({ 人物ID: 'person_id', 氏名: 'name', 父: 'father_id', 母: 'mother_id', 配偶者: 'spouse_ids', 生年: 'birth_date' });
  });

  it('必須列未マッピング時にエラーになる', () => {
    const result = validateColumnMapping({ 氏名: 'name', 備考: 'note' });
    expect(result.canImport).toBe(false);
    expect(result.errors.some((error) => error.includes('person_id'))).toBe(true);
  });

  it('同一アプリ項目への重複マッピングを検出できる', () => {
    const result = validateColumnMapping({ ID: 'person_id', 人物ID: 'person_id', 名前: 'name' });
    expect(result.canImport).toBe(false);
    expect(result.errors.some((error) => error.includes('person_id'))).toBe(true);
  });

  it('マッピング後のCSVが正しく標準形式へ変換される', () => {
    const rows = convertCsvToStandardRows('人物ID,氏名,性別\nP001,山田太郎,male', { 人物ID: 'person_id', 氏名: 'name', 性別: 'gender' });
    expect(rows[0]).toMatchObject({ person_id: 'P001', name: '山田太郎', gender: 'male' });
  });

  it('warningのみの場合はインポート可能', () => {
    const analysis = analyzeMappedCsv('person_id,name,father_id\nP001,子,P999', { person_id: 'person_id', name: 'name', father_id: 'father_id' });
    expect(analysis.summary.warningCount).toBeGreaterThan(0);
    expect(analysis.summary.errorCount).toBe(0);
    expect(analysis.summary.canImport).toBe(true);
  });

  it('errorありの場合はインポート不可', () => {
    const analysis = analyzeMappedCsv('person_id,name,spouse_ids\nP001,人物,P001', { person_id: 'person_id', name: 'name', spouse_ids: 'spouse_ids' });
    expect(analysis.summary.errorCount).toBeGreaterThan(0);
    expect(analysis.summary.canImport).toBe(false);
  });

  it('サンプルCSV出力文字列に必須ヘッダーが含まれる', () => {
    expect(SAMPLE_CSV.split('\n')[0]).toContain('person_id,name,gender,birth_date,death_date,father_id,mother_id,spouse_ids,generation_no,title,note,source,confidence');
  });
});
