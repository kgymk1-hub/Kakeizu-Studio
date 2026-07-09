import { describe, expect, it } from 'vitest';
import { buildSimpleCsvImportPreview, buildStandardCsvSetImportPreview, canImportWithPolicy, getImportPolicyStatus, importPolicyOptions, type ImportPolicy } from '../services/importPreviewService';
import { parseStandardCsvSetFiles, buildStandardCsvSetFiles } from '../services/standardCsvSetService';
import type { NormalizedFamilyData } from '../services/normalizationService';

const emptyData: NormalizedFamilyData = { persons: [], unions: [], parentChildRelations: [], importBatch: { id: 'b1', imported_at: '', import_type: 'csv_simple', source_name: 'test.csv', imported_count: 0, warning_count: 0, error_count: 0 }, issues: [], externalIdMap: new Map() };

describe('importPreviewService', () => {
  it('かんたんCSVのsummaryと取り込み可否を集計できる', () => {
    const preview = buildSimpleCsvImportPreview({ ...emptyData, persons: [{ id: 'p1', display_name: 'A', created_at: '', updated_at: '' }], issues: [
      { severity: 'warning', code: 'unknown_parent_id', message: '父ID不明', row: 2, field: 'father_id', external_id: 'p1' },
    ] }, 1);
    expect(preview.summary).toMatchObject({ mode: 'simple_csv', importPolicy: 'replace_all', importPolicyStatus: 'available', totalRows: 1, warningRows: 1, errorRows: 0, warningIssues: 1, errorIssues: 0 });
    expect(preview.summary.plannedCreate.persons).toBe(1);
    expect(preview.canImport).toBe(true);
    expect(preview.hasWarnings).toBe(true);
  });

  it('errorありのかんたんCSVは取込不可として集計できる', () => {
    const preview = buildSimpleCsvImportPreview({ ...emptyData, issues: [{ severity: 'error', code: 'required', message: 'name必須', row: 3, field: 'name' }] }, 2);
    expect(preview.summary.errorRows).toBe(1);
    expect(preview.canImport).toBe(false);
  });



  it('取込方式の既定値とstatusを定義できる', () => {
    const statuses = Object.fromEntries(importPolicyOptions.map((option) => [option.value, option.status])) as Record<ImportPolicy, string>;
    expect(statuses.replace_all).toBe('available');
    expect(statuses.append_new).toBe('preview_only');
    expect(statuses.update_by_external_id).toBe('preview_only');
    expect(statuses.skip_existing).toBe('preview_only');
    expect(statuses.add_as_new_ids).toBe('preview_only');
    expect(getImportPolicyStatus('replace_all')).toBe('available');
  });

  it('取込方式とerror有無から取込可否を判定できる', () => {
    expect(canImportWithPolicy(0, 'replace_all')).toBe(true);
    expect(canImportWithPolicy(1, 'replace_all')).toBe(false);
    expect(canImportWithPolicy(0, 'append_new')).toBe(false);
    expect(canImportWithPolicy(0, 'update_by_external_id')).toBe(false);
    expect(canImportWithPolicy(0, 'skip_existing')).toBe(false);
    expect(canImportWithPolicy(0, 'add_as_new_ids')).toBe(false);
  });

  it('選択中の取込方式をかんたんCSV preview summaryへ反映できる', () => {
    const preview = buildSimpleCsvImportPreview(emptyData, 0, { importPolicy: 'append_new' });
    expect(preview.summary.importPolicy).toBe('append_new');
    expect(preview.summary.importPolicyStatus).toBe('preview_only');
    expect(preview.canImport).toBe(false);
  });

  it('標準CSVセットのファイル別件数とmanifest有無を集計できる', () => {
    const files = buildStandardCsvSetFiles({ persons: [{ id: 'p1', display_name: 'A', created_at: '', updated_at: '' }], unions: [], parentChildRelations: [], sources: [], citations: [] });
    const parsed = parseStandardCsvSetFiles(files);
    const preview = buildStandardCsvSetImportPreview(parsed, files, { importPolicy: 'update_by_external_id' });
    expect(preview.manifestPresent).toBe(true);
    expect(preview.files?.find((file) => file.fileName === 'persons.csv')).toMatchObject({ rows: 1, present: true });
    expect(preview.summary.plannedCreate.persons).toBe(1);
    expect(preview.summary.importPolicy).toBe('update_by_external_id');
    expect(preview.summary.importPolicyStatus).toBe('preview_only');
    expect(preview.canImport).toBe(false);
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

describe('external_id import matching', () => {
  const person = (id: string, external_id?: string, display_name = id) => ({ id, external_id, display_name, created_at: '', updated_at: '' });

  it('かんたんCSV person_idを既存Person.external_idと照合し、重複と空欄も集計できる', () => {
    const preview = buildSimpleCsvImportPreview({ ...emptyData, persons: [person('imp1', 'P001', '山田太郎'), person('imp2', 'P002'), person('imp3', 'P002'), person('imp4', undefined)] }, 4, { existingData: { persons: [person('existing-person', 'P001', '既存太郎')] }, importPolicy: 'update_by_external_id' });
    expect(preview.matches.map((m) => m.status)).toEqual(['matched_existing', 'duplicate_in_import', 'duplicate_in_import', 'missing_external_id']);
    expect(preview.matches[0].existingId).toBe('existing-person');
    expect(preview.summary.matchSummary).toMatchObject({ matchedExisting: 1, duplicateInImport: 2, missingExternalId: 1 });
    expect(preview.summary.policyPlan).toMatchObject({ update: 1, blocked: 3 });
    expect(preview.canImport).toBe(false);
  });

  it('標準CSVセットはexternal_idで照合し、内部id一致だけでは既存一致にしない', () => {
    const files = buildStandardCsvSetFiles({ persons: [person('same-internal-id', 'EXT001', '外部ID一致'), person('existing-internal-only', undefined, '内部IDのみ一致')], unions: [], parentChildRelations: [], sources: [], citations: [] });
    const parsed = parseStandardCsvSetFiles(files, { existingData: { persons: [person('same-internal-id', 'OTHER'), person('existing-person', 'EXT001')] }, importPolicy: 'skip_existing' });
    expect(parsed.preview.matches.find((m) => m.importId === 'same-internal-id')?.status).toBe('matched_existing');
    expect(parsed.preview.matches.find((m) => m.importId === 'same-internal-id')?.existingId).toBe('existing-person');
    expect(parsed.preview.matches.find((m) => m.importId === 'existing-internal-only')?.status).toBe('missing_external_id');
    expect(parsed.preview.summary.policyPlan).toMatchObject({ skip: 1, blocked: 1 });
  });

  it('Source/Event/Citationもexternal_idで照合できる', () => {
    const files = buildStandardCsvSetFiles({ persons: [person('p1', 'P1')], unions: [], parentChildRelations: [], sources: [{ id: 's1', external_id: 'SRC1', source_type: 'book', title: '資料', created_at: '', updated_at: '' }], citations: [{ id: 'c1', external_id: 'CIT1', source_id: 's1', target_type: 'person', target_id: 'p1', created_at: '', updated_at: '' }], events: [{ id: 'e1', external_id: 'EV1', event_type: 'birth', target_type: 'person', target_id: 'p1', created_at: '', updated_at: '' }] });
    const parsed = parseStandardCsvSetFiles(files, { existingData: { persons: [], sources: [{ id: 'source-existing', external_id: 'SRC1', source_type: 'book', title: '既存資料', created_at: '', updated_at: '' }], citations: [{ id: 'citation-existing', external_id: 'CIT1', source_id: 'source-existing', target_type: 'person', target_id: 'p1', created_at: '', updated_at: '' }], events: [{ id: 'event-existing', external_id: 'EV1', event_type: 'birth', target_type: 'person', target_id: 'p1', created_at: '', updated_at: '' }] }, importPolicy: 'add_as_new_ids' });
    expect(parsed.preview.matches.filter((m) => m.status === 'matched_existing').map((m) => m.entityType).sort()).toEqual(['citation', 'event', 'source']);
    expect(parsed.preview.summary.policyPlan.addAsNew).toBe(3);
  });

  it('replace_allでは照合結果に関わらずreplace件数を集計する', () => {
    const preview = buildSimpleCsvImportPreview({ ...emptyData, persons: [person('p1', 'P1'), person('p2', 'P2')] }, 2, { importPolicy: 'replace_all' });
    expect(preview.summary.policyPlan).toMatchObject({ replace: 2, create: 0, update: 0, skip: 0, addAsNew: 0, blocked: 0 });
  });
});
