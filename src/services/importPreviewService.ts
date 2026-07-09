import type { NormalizedFamilyData } from './normalizationService';
import type { StandardCsvSetTextFiles } from './standardCsvSetService';
import type { ValidationIssue } from '../models';

export type ImportPreviewIssueSeverity = 'error' | 'warning' | 'info';
export type ImportPreviewTargetType = 'person' | 'union' | 'relation' | 'event' | 'source' | 'citation' | 'manifest' | 'unknown';

export type ImportPreviewIssue = {
  severity: ImportPreviewIssueSeverity;
  code: string;
  message: string;
  rowNumber?: number;
  fileName?: string;
  field?: string;
  targetType?: ImportPreviewTargetType;
  targetId?: string;
};

export type ImportPreviewSummary = {
  mode: 'simple_csv' | 'standard_csv_set';
  importPolicy: 'replace_all';
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  totalIssues: number;
  warningIssues: number;
  errorIssues: number;
  plannedCreate: { persons: number; unions: number; relations: number; events: number; sources: number; citations: number; };
};

export type ImportPreviewFileSummary = { fileName: string; rows: number; present: boolean };
export type ImportPreviewResult = { summary: ImportPreviewSummary; issues: ImportPreviewIssue[]; files?: ImportPreviewFileSummary[]; manifestPresent?: boolean; canImport: boolean; hasWarnings: boolean; };

const targetTypeMap: Record<string, ImportPreviewTargetType> = { person: 'person', union: 'union', relation: 'relation', event: 'event', source: 'source', citation: 'citation', manifest: 'manifest' };

function mapIssue(issue: ValidationIssue, fileName?: string): ImportPreviewIssue {
  return {
    severity: issue.severity,
    code: issue.code ?? issue.category ?? 'issue',
    message: issue.message,
    rowNumber: issue.row,
    fileName,
    field: issue.field,
    targetType: issue.target_type ? targetTypeMap[issue.target_type] ?? 'unknown' : undefined,
    targetId: issue.target_id ?? issue.external_id,
  };
}

function countRowsWithSeverity(issues: ImportPreviewIssue[], severity: ImportPreviewIssueSeverity) {
  return new Set(issues.filter((issue) => issue.severity === severity && issue.rowNumber != null).map((issue) => issue.rowNumber)).size;
}

export function buildSimpleCsvImportPreview(data: NormalizedFamilyData, totalRows: number): ImportPreviewResult {
  const issues = data.issues.map((issue) => mapIssue(issue));
  const errorRows = countRowsWithSeverity(issues, 'error');
  const warningRows = countRowsWithSeverity(issues, 'warning');
  const errorIssues = issues.filter((issue) => issue.severity === 'error').length;
  const warningIssues = issues.filter((issue) => issue.severity === 'warning').length;
  return {
    summary: {
      mode: 'simple_csv', importPolicy: 'replace_all', totalRows,
      validRows: Math.max(0, totalRows - new Set(issues.filter((i) => i.rowNumber != null && (i.severity === 'error' || i.severity === 'warning')).map((i) => i.rowNumber)).size),
      warningRows, errorRows, totalIssues: issues.length, warningIssues, errorIssues,
      plannedCreate: { persons: data.persons.length, unions: data.unions.length, relations: data.parentChildRelations.length, events: (data as unknown as { events?: unknown[] }).events?.length ?? 0, sources: (data as unknown as { sources?: unknown[] }).sources?.length ?? 0, citations: (data as unknown as { citations?: unknown[] }).citations?.length ?? 0 },
    },
    issues, canImport: errorIssues === 0, hasWarnings: warningIssues > 0,
  };
}

const standardFileKeys = [
  ['persons.csv', 'persons'], ['unions.csv', 'unions'], ['parent_child_relations.csv', 'parent_child_relations'], ['sources.csv', 'sources'], ['citations.csv', 'citations'], ['events.csv', 'events'],
] as const;

export function buildStandardCsvSetImportPreview(preview: { issues: ValidationIssue[]; counts: { persons:number; unions:number; parent_child_relations:number; sources:number; citations:number; events:number; warnings:number; errors:number } }, files?: StandardCsvSetTextFiles): ImportPreviewResult {
  const issueFile = (issue: ValidationIssue) => {
    if (issue.code === 'missing_manifest' || issue.code === 'invalid_manifest' || issue.code === 'invalid_format') return 'manifest.json';
    if (issue.code === 'missing_csv') return issue.message.match(/^(\S+\.csv)/)?.[1];
    if (issue.message.startsWith('persons.csv')) return 'persons.csv';
    if (issue.message.startsWith('unions.') || issue.message.startsWith('unions.csv')) return 'unions.csv';
    if (issue.message.startsWith('parent_id') || issue.message.startsWith('child_id') || issue.message.startsWith('parent_child_relations.csv')) return 'parent_child_relations.csv';
    if (issue.message.startsWith('citation.') || issue.message.startsWith('citations.csv')) return 'citations.csv';
    if (issue.message.startsWith('event.') || issue.message.startsWith('events.csv')) return 'events.csv';
    if (issue.message.startsWith('sources.csv')) return 'sources.csv';
    return undefined;
  };
  const issues = preview.issues.map((issue) => mapIssue(issue, issueFile(issue)));
  const errorIssues = issues.filter((issue) => issue.severity === 'error').length;
  const warningIssues = issues.filter((issue) => issue.severity === 'warning').length;
  const totalRows = preview.counts.persons + preview.counts.unions + preview.counts.parent_child_relations + preview.counts.sources + preview.counts.citations + preview.counts.events;
  const filesSummary = standardFileKeys.map(([fileName, key]) => ({ fileName, rows: preview.counts[key], present: files ? files[fileName] != null : true }));
  return {
    summary: {
      mode: 'standard_csv_set', importPolicy: 'replace_all', totalRows,
      validRows: Math.max(0, totalRows - countRowsWithSeverity(issues, 'error') - countRowsWithSeverity(issues, 'warning')),
      warningRows: countRowsWithSeverity(issues, 'warning'), errorRows: countRowsWithSeverity(issues, 'error'),
      totalIssues: issues.length, warningIssues, errorIssues,
      plannedCreate: { persons: preview.counts.persons, unions: preview.counts.unions, relations: preview.counts.parent_child_relations, events: preview.counts.events, sources: preview.counts.sources, citations: preview.counts.citations },
    },
    issues, files: filesSummary, manifestPresent: files ? files['manifest.json'] != null : true, canImport: errorIssues === 0, hasWarnings: warningIssues > 0,
  };
}
