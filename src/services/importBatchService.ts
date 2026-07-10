import type { ImportBatch } from '../models';
import type { ImportPreviewResult, ImportPolicy, PlaceholderPersonPolicy } from './importPreviewService';

export type ImportBatchMode = 'simple_csv' | 'standard_csv_set';

export function createImportBatchFromPreview(options: {
  id?: string;
  mode: ImportBatchMode;
  preview: ImportPreviewResult;
  sourceLabel?: string;
  fileNames?: string[];
  createdAt?: string;
}): ImportBatch {
  const createdAt = options.createdAt ?? new Date().toISOString();
  const planned = options.preview.summary.plannedCreate;
  const warningCount = options.preview.summary.warningIssues;
  const errorCount = options.preview.summary.errorIssues;
  const totalRows = options.preview.summary.totalRows;
  return {
    id: options.id ?? `import-${options.mode}-${Date.now()}`,
    imported_at: createdAt,
    import_type: options.mode === 'simple_csv' ? 'csv_simple' : 'csv_standard',
    source_name: options.sourceLabel,
    imported_count: planned.persons,
    warning_count: warningCount,
    error_count: errorCount,
    mode: options.mode,
    import_policy: options.preview.summary.importPolicy,
    placeholder_person_policy: options.preview.summary.placeholderPersonPolicy,
    status: warningCount > 0 ? 'completed_with_warnings' : 'completed',
    source_label: options.sourceLabel,
    file_names: options.fileNames ?? [],
    total_rows: totalRows,
    imported_counts: {
      persons: planned.persons,
      unions: planned.unions,
      relations: planned.relations,
      events: planned.events,
      sources: planned.sources,
      citations: planned.citations,
    },
    unresolved_reference_count: options.preview.summary.unresolvedReferenceSummary.total,
    placeholder_person_candidate_count: options.preview.summary.unresolvedReferenceSummary.placeholderPersonCandidates,
    created_at: createdAt,
  };
}

export function isImportBatchSaveTarget(preview: ImportPreviewResult, importPolicy: ImportPolicy, placeholderPersonPolicy: PlaceholderPersonPolicy) {
  return preview.canImport && importPolicy === 'replace_all' && placeholderPersonPolicy === 'warn_and_skip' && preview.summary.errorIssues === 0;
}

export function recentImportBatches(batches: ImportBatch[], limit = 5) {
  return [...batches].sort((a, b) => (b.created_at ?? b.imported_at).localeCompare(a.created_at ?? a.imported_at)).slice(0, limit);
}
