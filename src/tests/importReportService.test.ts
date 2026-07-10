import { describe, expect, it } from 'vitest';
import { createImportBatchFromPreview } from '../services/importBatchService';
import { createImportReportFromPreview } from '../services/importReportService';
import { buildSimpleCsvImportPreview, buildStandardCsvSetImportPreview } from '../services/importPreviewService';
import type { NormalizedFamilyData } from '../services/normalizationService';

const normalized: NormalizedFamilyData = {
  persons: [{ id: 'p1', external_id: 'P1', display_name: '山田太郎', created_at: '', updated_at: '' }],
  unions: [],
  parentChildRelations: [],
  importBatch: { id: 'b0', imported_at: '', import_type: 'csv_simple', source_name: 'simple.csv', imported_count: 1, warning_count: 0, error_count: 0 },
  issues: [],
  externalIdMap: new Map(),
};

describe('importReportService', () => {
  it('simple_csvの成功レポートを作れる', () => {
    const preview = buildSimpleCsvImportPreview(normalized, 1, { importPolicy: 'replace_all', placeholderPersonPolicy: 'warn_and_skip', simpleRows: [{ person_id: 'P1', name: '山田太郎' }] });
    const batch = createImportBatchFromPreview({ id: 'b1', mode: 'simple_csv', preview, sourceLabel: 'かんたんCSV', fileNames: ['simple.csv'], createdAt: '2026-07-10T00:00:00.000Z' });
    const report = createImportReportFromPreview({ batch, preview });
    expect(report).toMatchObject({ batchId: 'b1', status: 'success', mode: 'simple_csv', importPolicy: 'replace_all', fileNames: ['simple.csv'] });
    expect(report.importedCounts.persons).toBe(1);
    expect(report.issueSummary).toEqual({ warningIssues: 0, errorIssues: 0, totalIssues: 0 });
    expect(report.matchSummary?.newItems).toBe(1);
    expect(report.policyPlan?.replace).toBe(1);
    expect(report.nextActions).toContain('家系図表示と人物詳細を確認してください。');
  });

  it('standard_csv_setの成功レポートを作れる', () => {
    const preview = buildStandardCsvSetImportPreview({ issues: [], counts: { persons: 2, unions: 1, parent_child_relations: 1, sources: 1, citations: 1, events: 1, warnings: 0, errors: 0 } }, { 'persons.csv': 'id\nP1\nP2', 'unions.csv': 'id\nu1', 'parent_child_relations.csv': 'id\nr1', 'sources.csv': 'id\ns1', 'citations.csv': 'id\nc1', 'events.csv': 'id\ne1', 'manifest.json': '{}' }, { importPolicy: 'replace_all', placeholderPersonPolicy: 'warn_and_skip' });
    const batch = createImportBatchFromPreview({ id: 'b2', mode: 'standard_csv_set', preview, sourceLabel: '標準CSVセット', fileNames: ['manifest.json', 'persons.csv'] });
    const report = createImportReportFromPreview({ batch, preview });
    expect(report.status).toBe('success');
    expect(report.mode).toBe('standard_csv_set');
    expect(report.importedCounts).toMatchObject({ persons: 2, unions: 1, relations: 1, sources: 1, citations: 1, events: 1 });
  });

  it('warningありならsuccess_with_warningsになり参照先不明とnextActionsを反映する', () => {
    const preview = buildSimpleCsvImportPreview(normalized, 1, { importPolicy: 'replace_all', placeholderPersonPolicy: 'warn_and_skip', simpleRows: [{ person_id: 'P1', name: '山田太郎', father_id: 'PX' }] });
    const batch = createImportBatchFromPreview({ mode: 'simple_csv', preview });
    const report = createImportReportFromPreview({ batch, preview });
    expect(report.status).toBe('success_with_warnings');
    expect(report.issueSummary.warningIssues).toBeGreaterThan(0);
    expect(report.unresolvedReferenceSummary?.total).toBe(1);
    expect(report.placeholderPersonCandidateCount).toBe(0);
    expect(report.unresolvedReferencePreview).toHaveLength(1);
    expect(report.nextActions).toContain('参照先不明があるため、CSV内のID参照を確認してください。');
  });

  it('issueと候補プレビューを最大件数で制限する', () => {
    const issues = Array.from({ length: 8 }, (_, idx) => ({ severity: 'warning' as const, code: `w${idx}`, message: `warning ${idx}`, row: idx + 2 }));
    const preview = buildSimpleCsvImportPreview({ ...normalized, issues }, 8, { importPolicy: 'replace_all', placeholderPersonPolicy: 'warn_and_skip', simpleRows: [{ person_id: 'P1' }] });
    const report = createImportReportFromPreview({ preview, mode: 'simple_csv', previewLimit: 5 });
    expect(report.issuePreview).toHaveLength(5);
    expect(report.status).toBe('success_with_warnings');
  });
});
