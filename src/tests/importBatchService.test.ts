import { describe, expect, it } from 'vitest';
import { buildSimpleCsvImportPreview, buildStandardCsvSetImportPreview } from '../services/importPreviewService';
import { createImportBatchFromPreview, isImportBatchSaveTarget, recentImportBatches } from '../services/importBatchService';
import type { NormalizedFamilyData } from '../services/normalizationService';

const normalized: NormalizedFamilyData = {
  persons: [{ id: 'p1', external_id: 'P1', display_name: '山田太郎', created_at: 'now', updated_at: 'now' }],
  unions: [],
  parentChildRelations: [],
  importBatch: { id: 'old', imported_at: 'now', import_type: 'csv_simple', imported_count: 1, warning_count: 0, error_count: 0 },
  issues: [],
  externalIdMap: new Map([['P1', 'p1']]),
};

describe('importBatchService', () => {
  it('simple_csvのImportBatchをプレビューから作成できる', () => {
    const preview = buildSimpleCsvImportPreview(normalized, 1, { importPolicy: 'replace_all', placeholderPersonPolicy: 'warn_and_skip', simpleRows: [{ person_id: 'P1', name: '山田太郎' }] });
    const batch = createImportBatchFromPreview({ id: 'b1', mode: 'simple_csv', preview, sourceLabel: 'かんたんCSV', fileNames: ['sample.csv'], createdAt: '2026-07-10T00:00:00.000Z' });
    expect(batch).toMatchObject({ id: 'b1', mode: 'simple_csv', import_policy: 'replace_all', placeholder_person_policy: 'warn_and_skip', status: 'completed', source_label: 'かんたんCSV', file_names: ['sample.csv'], total_rows: 1, warning_count: 0, error_count: 0, unresolved_reference_count: 0, placeholder_person_candidate_count: 0 });
    expect(batch.imported_counts).toMatchObject({ persons: 1, unions: 0, relations: 0, events: 0, sources: 0, citations: 0 });
    expect(isImportBatchSaveTarget(preview, 'replace_all', 'warn_and_skip')).toBe(true);
  });

  it('warningありならcompleted_with_warningsになり参照先不明件数を記録する', () => {
    const preview = buildSimpleCsvImportPreview(normalized, 1, { importPolicy: 'replace_all', placeholderPersonPolicy: 'warn_and_skip', simpleRows: [{ person_id: 'P1', name: '山田太郎', father_id: 'PX' }] });
    const batch = createImportBatchFromPreview({ mode: 'simple_csv', preview });
    expect(batch.status).toBe('completed_with_warnings');
    expect(batch.warning_count).toBeGreaterThan(0);
    expect(batch.unresolved_reference_count).toBe(1);
  });

  it('standard_csv_setのImportBatchを作成できる', () => {
    const preview = buildStandardCsvSetImportPreview({ issues: [], counts: { persons: 2, unions: 1, parent_child_relations: 1, sources: 1, citations: 1, events: 1, warnings: 0, errors: 0 } }, { 'persons.csv': 'id\nP1', 'unions.csv': '', 'parent_child_relations.csv': '', 'sources.csv': '', 'citations.csv': '', 'events.csv': '', 'manifest.json': '{}' }, { importPolicy: 'replace_all', placeholderPersonPolicy: 'warn_and_skip' });
    const batch = createImportBatchFromPreview({ mode: 'standard_csv_set', preview, sourceLabel: '標準CSVセット', fileNames: ['manifest.json', 'persons.csv'] });
    expect(batch.mode).toBe('standard_csv_set');
    expect(batch.imported_counts).toMatchObject({ persons: 2, unions: 1, relations: 1, sources: 1, citations: 1, events: 1 });
    expect(batch.file_names).toEqual(['manifest.json', 'persons.csv']);
  });

  it('preview_only方式では保存対象にしない', () => {
    const preview = buildSimpleCsvImportPreview(normalized, 1, { importPolicy: 'append_new', placeholderPersonPolicy: 'warn_and_skip', simpleRows: [{ person_id: 'P1' }] });
    expect(isImportBatchSaveTarget(preview, 'append_new', 'warn_and_skip')).toBe(false);
  });

  it('直近ImportBatchを新しい順に返す', () => {
    expect(recentImportBatches([
      { id: 'old', imported_at: '2026-01-01T00:00:00Z', import_type: 'csv_simple', imported_count: 1, warning_count: 0, error_count: 0 },
      { id: 'new', imported_at: '2026-07-10T00:00:00Z', import_type: 'csv_standard', imported_count: 1, warning_count: 0, error_count: 0 },
    ])[0].id).toBe('new');
  });
});
