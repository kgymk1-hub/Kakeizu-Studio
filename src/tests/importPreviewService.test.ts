import { describe, expect, it } from 'vitest';
import { buildSimpleCsvImportPreview, buildStandardCsvSetImportPreview } from '../services/importPreviewService';
import { parseStandardCsvSetFiles, buildStandardCsvSetFiles } from '../services/standardCsvSetService';
import type { NormalizedFamilyData } from '../services/normalizationService';

const emptyData: NormalizedFamilyData = { persons: [], unions: [], parentChildRelations: [], importBatch: { id: 'b1', imported_at: '', import_type: 'csv_simple', source_name: 'test.csv', imported_count: 0, warning_count: 0, error_count: 0 }, issues: [], externalIdMap: new Map() };

describe('importPreviewService', () => {
  it('かんたんCSVのsummaryと取り込み可否を集計できる', () => {
    const preview = buildSimpleCsvImportPreview({ ...emptyData, persons: [{ id: 'p1', display_name: 'A', created_at: '', updated_at: '' }], issues: [
      { severity: 'warning', code: 'unknown_parent_id', message: '父ID不明', row: 2, field: 'father_id', external_id: 'p1' },
    ] }, 1);
    expect(preview.summary).toMatchObject({ mode: 'simple_csv', importPolicy: 'replace_all', totalRows: 1, warningRows: 1, errorRows: 0, warningIssues: 1, errorIssues: 0 });
    expect(preview.summary.plannedCreate.persons).toBe(1);
    expect(preview.canImport).toBe(true);
    expect(preview.hasWarnings).toBe(true);
  });

  it('errorありのかんたんCSVは取込不可として集計できる', () => {
    const preview = buildSimpleCsvImportPreview({ ...emptyData, issues: [{ severity: 'error', code: 'required', message: 'name必須', row: 3, field: 'name' }] }, 2);
    expect(preview.summary.errorRows).toBe(1);
    expect(preview.canImport).toBe(false);
  });

  it('標準CSVセットのファイル別件数とmanifest有無を集計できる', () => {
    const files = buildStandardCsvSetFiles({ persons: [{ id: 'p1', display_name: 'A', created_at: '', updated_at: '' }], unions: [], parentChildRelations: [], sources: [], citations: [] });
    const parsed = parseStandardCsvSetFiles(files);
    const preview = buildStandardCsvSetImportPreview(parsed, files);
    expect(preview.manifestPresent).toBe(true);
    expect(preview.files?.find((file) => file.fileName === 'persons.csv')).toMatchObject({ rows: 1, present: true });
    expect(preview.summary.plannedCreate.persons).toBe(1);
    expect(preview.canImport).toBe(true);
  });

  it('標準CSVセットのissueをseverity別に集計できる', () => {
    const files = buildStandardCsvSetFiles({ persons: [], unions: [], parentChildRelations: [], sources: [], citations: [] });
    delete files['manifest.json'];
    const parsed = parseStandardCsvSetFiles(files);
    expect(parsed.preview.manifestPresent).toBe(false);
    expect(parsed.preview.summary.errorIssues).toBeGreaterThan(0);
    expect(parsed.preview.canImport).toBe(false);
  });
});
