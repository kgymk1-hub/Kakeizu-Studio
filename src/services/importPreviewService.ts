import type { NormalizedFamilyData } from './normalizationService';
import type { StandardCsvSetTextFiles } from './standardCsvSetService';
import type { Citation, Event, ParentChildRelation, Person, Source, Union, ValidationIssue } from '../models';

export type ImportPreviewIssueSeverity = 'error' | 'warning' | 'info';
export type ImportPreviewTargetType = 'person' | 'union' | 'relation' | 'event' | 'source' | 'citation' | 'manifest' | 'unknown';

export type ImportPolicy =
  | 'replace_all'
  | 'append_new'
  | 'update_by_external_id'
  | 'skip_existing'
  | 'add_as_new_ids';

export type ImportPolicyStatus = 'available' | 'preview_only' | 'unsupported';

export const importPolicyOptions: { value: ImportPolicy; label: string; description: string; status: ImportPolicyStatus }[] = [
  { value: 'replace_all', label: '全置換', description: '現在のデータを全て置き換えます。', status: 'available' },
  { value: 'append_new', label: '追加', description: '既存データを残して新規データを追加します。後続フェーズで実装予定です。', status: 'preview_only' },
  { value: 'update_by_external_id', label: 'external_idで更新', description: 'external_idが一致する既存データを更新し、存在しないものは追加します。後続フェーズで実装予定です。', status: 'preview_only' },
  { value: 'skip_existing', label: '既存スキップ', description: 'external_idが既に存在するものはスキップし、新規のみ追加します。後続フェーズで実装予定です。', status: 'preview_only' },
  { value: 'add_as_new_ids', label: '別IDとして追加', description: 'external_idが重複しても別IDとして追加します。後続フェーズで実装予定です。', status: 'preview_only' },
];

export function getImportPolicyOption(importPolicy: ImportPolicy) {
  return importPolicyOptions.find((option) => option.value === importPolicy) ?? importPolicyOptions[0];
}

export function getImportPolicyStatus(importPolicy: ImportPolicy): ImportPolicyStatus {
  return getImportPolicyOption(importPolicy).status;
}

export function canImportWithPolicy(errorIssues: number, importPolicy: ImportPolicy) {
  return errorIssues === 0 && getImportPolicyStatus(importPolicy) === 'available';
}

export type ImportEntityType = 'person' | 'union' | 'relation' | 'event' | 'source' | 'citation';
export type ImportMatchStatus = 'new' | 'matched_existing' | 'duplicate_in_import' | 'missing_external_id' | 'unknown';
export type ImportEntityMatch = { entityType: ImportEntityType; importId?: string; externalId?: string; existingId?: string; displayName?: string; status: ImportMatchStatus; rowNumber?: number; fileName?: string; message?: string; };
export type ExistingImportContext = { persons?: Person[]; unions?: Union[]; parentChildRelations?: ParentChildRelation[]; events?: Event[]; sources?: Source[]; citations?: Citation[]; };
export type ImportMatchSummary = { newItems: number; matchedExisting: number; duplicateInImport: number; missingExternalId: number; unknown: number };
export type ImportPolicyPlan = { create: number; update: number; skip: number; addAsNew: number; replace: number; blocked: number };
export type ImportPreviewOptions = { importPolicy?: ImportPolicy; existingData?: ExistingImportContext };

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
  importPolicy: ImportPolicy;
  importPolicyStatus: ImportPolicyStatus;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  totalIssues: number;
  warningIssues: number;
  errorIssues: number;
  plannedCreate: { persons: number; unions: number; relations: number; events: number; sources: number; citations: number; };
  matchSummary: ImportMatchSummary;
  policyPlan: ImportPolicyPlan;
};

export type ImportPreviewFileSummary = { fileName: string; rows: number; present: boolean };
export type ImportPreviewResult = { summary: ImportPreviewSummary; issues: ImportPreviewIssue[]; matches: ImportEntityMatch[]; files?: ImportPreviewFileSummary[]; manifestPresent?: boolean; canImport: boolean; hasWarnings: boolean; };


function trimId(value: unknown) { return value == null ? undefined : String(value).trim() || undefined; }

export function buildExternalIdIndex(existing: ExistingImportContext = {}) {
  const add = <T extends { id: string; external_id?: string }>(rows: T[] | undefined) => new Map((rows ?? []).map((row) => [trimId(row.external_id), row.id]).filter((entry): entry is [string, string] => Boolean(entry[0])));
  return { person: add(existing.persons), union: add(existing.unions), relation: add(existing.parentChildRelations), event: add(existing.events), source: add(existing.sources), citation: add(existing.citations) };
}

type ImportCandidate = { entityType: ImportEntityType; importId?: string; externalId?: string; displayName?: string; rowNumber?: number; fileName?: string };

export function matchImportEntitiesByExternalId(candidates: ImportCandidate[], existing: ExistingImportContext = {}): ImportEntityMatch[] {
  const index = buildExternalIdIndex(existing);
  const counts = new Map<string, number>();
  candidates.forEach((candidate) => {
    const externalId = trimId(candidate.externalId);
    if (externalId) counts.set(`${candidate.entityType}:${externalId}`, (counts.get(`${candidate.entityType}:${externalId}`) ?? 0) + 1);
  });
  return candidates.map((candidate) => {
    const externalId = trimId(candidate.externalId);
    const importId = trimId(candidate.importId);
    if (!externalId) return { ...candidate, importId, externalId, status: 'missing_external_id', message: 'external_idが空欄のため既存データと照合できません。' };
    if ((counts.get(`${candidate.entityType}:${externalId}`) ?? 0) > 1) return { ...candidate, importId, externalId, status: 'duplicate_in_import', message: 'CSV内でexternal_idが重複しています。' };
    const existingId = index[candidate.entityType].get(externalId);
    return { ...candidate, importId, externalId, existingId, status: existingId ? 'matched_existing' : 'new', message: existingId ? `既存データ ${existingId} と一致しました。` : '新規候補です。' };
  });
}

export function summarizeImportMatches(matches: ImportEntityMatch[]): ImportMatchSummary {
  return {
    newItems: matches.filter((m) => m.status === 'new').length,
    matchedExisting: matches.filter((m) => m.status === 'matched_existing').length,
    duplicateInImport: matches.filter((m) => m.status === 'duplicate_in_import').length,
    missingExternalId: matches.filter((m) => m.status === 'missing_external_id').length,
    unknown: matches.filter((m) => m.status === 'unknown').length,
  };
}

export function buildPolicyPlan(matches: ImportEntityMatch[], importPolicy: ImportPolicy): ImportPolicyPlan {
  const plan: ImportPolicyPlan = { create: 0, update: 0, skip: 0, addAsNew: 0, replace: 0, blocked: 0 };
  if (importPolicy === 'replace_all') { plan.replace = matches.length; return plan; }
  for (const match of matches) {
    if (match.status === 'duplicate_in_import' || match.status === 'missing_external_id' || match.status === 'unknown') { plan.blocked += 1; continue; }
    if (match.status === 'new') plan.create += 1;
    else if (importPolicy === 'update_by_external_id') plan.update += 1;
    else if (importPolicy === 'skip_existing') plan.skip += 1;
    else if (importPolicy === 'add_as_new_ids') plan.addAsNew += 1;
    else plan.blocked += 1;
  }
  return plan;
}

function matchIssues(matches: ImportEntityMatch[]): ImportPreviewIssue[] {
  return matches.flatMap<ImportPreviewIssue>((match) => {
    if (match.status === 'duplicate_in_import') return [{ severity: 'warning' as const, code: 'duplicate_external_id_in_import', message: match.message ?? 'CSV内でexternal_idが重複しています。', rowNumber: match.rowNumber, fileName: match.fileName, field: 'external_id', targetType: match.entityType, targetId: match.importId ?? match.externalId }];
    if (match.status === 'missing_external_id') return [{ severity: 'info' as const, code: 'missing_external_id_for_policy', message: match.message ?? 'external_idが空欄です。', rowNumber: match.rowNumber, fileName: match.fileName, field: 'external_id', targetType: match.entityType, targetId: match.importId }];
    return [];
  });
}

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

export function buildSimpleCsvImportPreview(data: NormalizedFamilyData, totalRows: number, options: ImportPreviewOptions = {}): ImportPreviewResult {
  const importPolicy = options.importPolicy ?? 'replace_all';
  const importPolicyStatus = getImportPolicyStatus(importPolicy);
  const matches = matchImportEntitiesByExternalId(data.persons.map((person, index) => ({ entityType: 'person' as const, importId: person.id, externalId: person.external_id, displayName: person.display_name, rowNumber: index + 2, fileName: 'simple_csv' })), options.existingData);
  const issues = [...data.issues.map((issue) => mapIssue(issue)), ...matchIssues(matches)];
  const errorRows = countRowsWithSeverity(issues, 'error');
  const warningRows = countRowsWithSeverity(issues, 'warning');
  const errorIssues = issues.filter((issue) => issue.severity === 'error').length;
  const warningIssues = issues.filter((issue) => issue.severity === 'warning').length;
  return {
    summary: {
      mode: 'simple_csv', importPolicy, importPolicyStatus, totalRows,
      validRows: Math.max(0, totalRows - new Set(issues.filter((i) => i.rowNumber != null && (i.severity === 'error' || i.severity === 'warning')).map((i) => i.rowNumber)).size),
      warningRows, errorRows, totalIssues: issues.length, warningIssues, errorIssues,
      plannedCreate: { persons: data.persons.length, unions: data.unions.length, relations: data.parentChildRelations.length, events: (data as unknown as { events?: unknown[] }).events?.length ?? 0, sources: (data as unknown as { sources?: unknown[] }).sources?.length ?? 0, citations: (data as unknown as { citations?: unknown[] }).citations?.length ?? 0 },
      matchSummary: summarizeImportMatches(matches),
      policyPlan: buildPolicyPlan(matches, importPolicy),
    },
    issues, matches, canImport: canImportWithPolicy(errorIssues, importPolicy), hasWarnings: warningIssues > 0,
  };
}

const standardFileKeys = [
  ['persons.csv', 'persons'], ['unions.csv', 'unions'], ['parent_child_relations.csv', 'parent_child_relations'], ['sources.csv', 'sources'], ['citations.csv', 'citations'], ['events.csv', 'events'],
] as const;

export function buildStandardCsvSetImportPreview(preview: { issues: ValidationIssue[]; counts: { persons:number; unions:number; parent_child_relations:number; sources:number; citations:number; events:number; warnings:number; errors:number } }, files?: StandardCsvSetTextFiles, options: ImportPreviewOptions = {}): ImportPreviewResult {
  const importPolicy = options.importPolicy ?? 'replace_all';
  const importPolicyStatus = getImportPolicyStatus(importPolicy);
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
  const candidates: ImportCandidate[] = [
    ...('persons' in preview ? (preview as { persons: Person[] }).persons.map((p, i) => ({ entityType: 'person' as const, importId: p.id, externalId: p.external_id, displayName: p.display_name, rowNumber: i + 2, fileName: 'persons.csv' })) : []),
    ...('unions' in preview ? (preview as { unions: Union[] }).unions.map((u, i) => ({ entityType: 'union' as const, importId: u.id, externalId: u.external_id, displayName: u.id, rowNumber: i + 2, fileName: 'unions.csv' })) : []),
    ...('parentChildRelations' in preview ? (preview as { parentChildRelations: ParentChildRelation[] }).parentChildRelations.map((r, i) => ({ entityType: 'relation' as const, importId: r.id, externalId: r.external_id, displayName: r.id, rowNumber: i + 2, fileName: 'parent_child_relations.csv' })) : []),
    ...('sources' in preview ? (preview as { sources: Source[] }).sources.map((src, i) => ({ entityType: 'source' as const, importId: src.id, externalId: src.external_id, displayName: src.title, rowNumber: i + 2, fileName: 'sources.csv' })) : []),
    ...('citations' in preview ? (preview as { citations: Citation[] }).citations.map((c, i) => ({ entityType: 'citation' as const, importId: c.id, externalId: c.external_id, displayName: c.id, rowNumber: i + 2, fileName: 'citations.csv' })) : []),
    ...('events' in preview ? (preview as { events: Event[] }).events.map((e, i) => ({ entityType: 'event' as const, importId: e.id, externalId: e.external_id, displayName: e.description ?? e.id, rowNumber: i + 2, fileName: 'events.csv' })) : []),
  ];
  const matches = matchImportEntitiesByExternalId(candidates, options.existingData);
  const issues = [...preview.issues.map((issue) => mapIssue(issue, issueFile(issue))), ...matchIssues(matches)];
  const errorIssues = issues.filter((issue) => issue.severity === 'error').length;
  const warningIssues = issues.filter((issue) => issue.severity === 'warning').length;
  const totalRows = preview.counts.persons + preview.counts.unions + preview.counts.parent_child_relations + preview.counts.sources + preview.counts.citations + preview.counts.events;
  const filesSummary = standardFileKeys.map(([fileName, key]) => ({ fileName, rows: preview.counts[key], present: files ? files[fileName] != null : true }));
  return {
    summary: {
      mode: 'standard_csv_set', importPolicy, importPolicyStatus, totalRows,
      validRows: Math.max(0, totalRows - countRowsWithSeverity(issues, 'error') - countRowsWithSeverity(issues, 'warning')),
      warningRows: countRowsWithSeverity(issues, 'warning'), errorRows: countRowsWithSeverity(issues, 'error'),
      totalIssues: issues.length, warningIssues, errorIssues,
      plannedCreate: { persons: preview.counts.persons, unions: preview.counts.unions, relations: preview.counts.parent_child_relations, events: preview.counts.events, sources: preview.counts.sources, citations: preview.counts.citations },
      matchSummary: summarizeImportMatches(matches),
      policyPlan: buildPolicyPlan(matches, importPolicy),
    },
    issues, matches, files: filesSummary, manifestPresent: files ? files['manifest.json'] != null : true, canImport: canImportWithPolicy(errorIssues, importPolicy), hasWarnings: warningIssues > 0,
  };
}
