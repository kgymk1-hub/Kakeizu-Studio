import type { NormalizedFamilyData } from './normalizationService';
import type { StandardCsvSetTextFiles } from './standardCsvSetService';
import type { Citation, Event, ParentChildRelation, Person, Source, Union, ValidationIssue } from '../models';

export type ImportPreviewIssueSeverity = 'error' | 'warning' | 'info';
export type ImportPreviewTargetType = 'person' | 'union' | 'relation' | 'event' | 'source' | 'citation' | 'manifest' | 'unknown';
export type ImportReferenceEntityType = ImportPreviewTargetType;
export type ImportReferenceKind = 'father' | 'mother' | 'spouse' | 'union_partner' | 'relation_parent' | 'relation_child' | 'event_target' | 'citation_source' | 'citation_target' | 'unknown';
export type PlaceholderPersonPolicy = 'warn_and_skip' | 'block_import' | 'create_placeholder_preview';
export type PlaceholderPersonPolicyStatus = 'available' | 'preview_only' | 'unsupported';
export type ImportUnresolvedReference = { sourceEntityType: ImportReferenceEntityType; sourceImportId?: string; sourceDisplayName?: string; targetEntityType: ImportReferenceEntityType; referenceKind: ImportReferenceKind; referenceId: string; fileName?: string; rowNumber?: number; field?: string; message: string; };
export type PlaceholderPersonCandidate = { referenceId: string; displayName: string; references: ImportUnresolvedReference[] };
export type UnresolvedReferenceSummary = { total: number; personReferences: number; sourceReferences: number; eventReferences: number; unionReferences: number; relationReferences: number; placeholderPersonCandidates: number; blockedByPolicy: number; pendingReview: number };

export const placeholderPersonPolicyOptions: { value: PlaceholderPersonPolicy; label: string; description: string; status: PlaceholderPersonPolicyStatus }[] = [
  { value: 'warn_and_skip', label: '警告して関係を作らない', description: '参照先不明を警告として表示し、該当する親子・配偶者関係は作成しません。', status: 'available' },
  { value: 'block_import', label: '反映を止める', description: '参照先不明がある場合は反映不可にします。後続フェーズで本格対応予定です。', status: 'preview_only' },
  { value: 'create_placeholder_preview', label: '仮人物作成候補にする', description: '参照先不明IDから仮人物を作る候補として表示します。現時点ではプレビューのみで、保存はしません。', status: 'preview_only' },
];

export function getPlaceholderPersonPolicyOption(policy: PlaceholderPersonPolicy) { return placeholderPersonPolicyOptions.find((option) => option.value === policy) ?? placeholderPersonPolicyOptions[0]; }
export function getPlaceholderPersonPolicyStatus(policy: PlaceholderPersonPolicy): PlaceholderPersonPolicyStatus { return getPlaceholderPersonPolicyOption(policy).status; }

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

export function canImportWithPolicy(errorIssues: number, importPolicy: ImportPolicy, placeholderPersonPolicy: PlaceholderPersonPolicy = 'warn_and_skip', unresolvedReferenceCount = 0) {
  return errorIssues === 0 && importPolicy === 'replace_all' && placeholderPersonPolicy === 'warn_and_skip' && getImportPolicyStatus(importPolicy) === 'available';
}

export type ImportEntityType = 'person' | 'union' | 'relation' | 'event' | 'source' | 'citation';
export type ImportMatchStatus = 'new' | 'matched_existing' | 'duplicate_in_import' | 'missing_external_id' | 'unknown';
export type ImportEntityMatch = { entityType: ImportEntityType; importId?: string; externalId?: string; existingId?: string; displayName?: string; status: ImportMatchStatus; rowNumber?: number; fileName?: string; message?: string; };
export type ExistingImportContext = { persons?: Person[]; unions?: Union[]; parentChildRelations?: ParentChildRelation[]; events?: Event[]; sources?: Source[]; citations?: Citation[]; };
export type ImportMatchSummary = { newItems: number; matchedExisting: number; duplicateInImport: number; missingExternalId: number; unknown: number };
export type ImportPolicyPlan = { create: number; update: number; skip: number; addAsNew: number; replace: number; blocked: number };
export type ImportPreviewOptions = { importPolicy?: ImportPolicy; existingData?: ExistingImportContext; placeholderPersonPolicy?: PlaceholderPersonPolicy; simpleRows?: { person_id: string; name?: string; father_id?: string; mother_id?: string; spouse_ids?: string }[] };

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
  placeholderPersonPolicy: PlaceholderPersonPolicy;
  placeholderPersonPolicyStatus: PlaceholderPersonPolicyStatus;
  unresolvedReferenceSummary: UnresolvedReferenceSummary;
};

export type ImportPreviewFileSummary = { fileName: string; rows: number; present: boolean };
export type ImportPreviewResult = { summary: ImportPreviewSummary; issues: ImportPreviewIssue[]; matches: ImportEntityMatch[]; unresolvedReferences: ImportUnresolvedReference[]; placeholderPersonCandidates: PlaceholderPersonCandidate[]; files?: ImportPreviewFileSummary[]; manifestPresent?: boolean; canImport: boolean; hasWarnings: boolean; };


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


function splitReferenceIds(value?: string) { return [...new Set((value ?? '').split(';').map((x) => x.trim()).filter(Boolean))]; }
function unresolvedIssueCode(target: ImportReferenceEntityType) { return `unresolved_${target}_reference`; }
function summarizeUnresolvedReferences(refs: ImportUnresolvedReference[], policy: PlaceholderPersonPolicy): UnresolvedReferenceSummary {
  const personIds = new Set(refs.filter((r) => r.targetEntityType === 'person').map((r) => r.referenceId));
  return {
    total: refs.length,
    personReferences: refs.filter((r) => r.targetEntityType === 'person').length,
    sourceReferences: refs.filter((r) => r.targetEntityType === 'source').length,
    eventReferences: refs.filter((r) => r.targetEntityType === 'event').length,
    unionReferences: refs.filter((r) => r.targetEntityType === 'union').length,
    relationReferences: refs.filter((r) => r.targetEntityType === 'relation').length,
    placeholderPersonCandidates: policy === 'create_placeholder_preview' ? personIds.size : 0,
    blockedByPolicy: policy === 'block_import' ? refs.length : 0,
    pendingReview: policy === 'warn_and_skip' ? refs.length : 0,
  };
}
function buildPlaceholderPersonCandidates(refs: ImportUnresolvedReference[], policy: PlaceholderPersonPolicy): PlaceholderPersonCandidate[] {
  if (policy !== 'create_placeholder_preview') return [];
  const grouped = new Map<string, ImportUnresolvedReference[]>();
  refs.filter((r) => r.targetEntityType === 'person').forEach((ref) => grouped.set(ref.referenceId, [...(grouped.get(ref.referenceId) ?? []), ref]));
  return [...grouped.entries()].map(([referenceId, references]) => ({ referenceId, displayName: `仮人物 ${referenceId}`, references }));
}
function unresolvedReferenceIssues(refs: ImportUnresolvedReference[], policy: PlaceholderPersonPolicy): ImportPreviewIssue[] {
  const base = refs.map((ref): ImportPreviewIssue => ({ severity: 'warning', code: unresolvedIssueCode(ref.targetEntityType), message: ref.message, rowNumber: ref.rowNumber, fileName: ref.fileName, field: ref.field, targetType: ref.targetEntityType, targetId: ref.referenceId }));
  const placeholder = policy === 'create_placeholder_preview' ? buildPlaceholderPersonCandidates(refs, policy).map((c): ImportPreviewIssue => ({ severity: 'info', code: 'placeholder_person_candidate', message: `${c.displayName} は仮人物作成候補です。現時点では保存しません。`, targetType: 'person', targetId: c.referenceId })) : [];
  const blocked = policy === 'block_import' && refs.length > 0 ? [{ severity: 'error' as const, code: 'blocked_by_unresolved_reference_policy', message: '参照先不明があるため、選択中の方針では反映できません。', targetType: 'unknown' as const }] : [];
  return [...base, ...placeholder, ...blocked];
}
export function detectSimpleCsvUnresolvedReferences(rows: { person_id: string; name?: string; father_id?: string; mother_id?: string; spouse_ids?: string }[], fileName = 'simple_csv'): ImportUnresolvedReference[] {
  const ids = new Set(rows.map((row) => trimId(row.person_id)).filter(Boolean) as string[]);
  const refs: ImportUnresolvedReference[] = [];
  rows.forEach((row, index) => {
    const add = (field: 'father_id' | 'mother_id' | 'spouse_ids', id: string, kind: ImportReferenceKind) => { if (!ids.has(id)) refs.push({ sourceEntityType: 'person', sourceImportId: row.person_id, sourceDisplayName: row.name, targetEntityType: 'person', referenceKind: kind, referenceId: id, fileName, rowNumber: index + 2, field, message: `${index + 2}行目 ${field}: ${id} が見つかりません。` }); };
    if (row.father_id) add('father_id', row.father_id, 'father');
    if (row.mother_id) add('mother_id', row.mother_id, 'mother');
    splitReferenceIds(row.spouse_ids).forEach((id) => add('spouse_ids', id, 'spouse'));
  });
  return refs;
}
export function detectStandardCsvSetUnresolvedReferences(data: { persons?: Person[]; unions?: Union[]; parentChildRelations?: ParentChildRelation[]; events?: Event[]; sources?: Source[]; citations?: Citation[] }): ImportUnresolvedReference[] {
  const ids = { person: new Set((data.persons ?? []).map((p) => p.id)), union: new Set((data.unions ?? []).map((u) => u.id)), relation: new Set((data.parentChildRelations ?? []).map((r) => r.id)), event: new Set((data.events ?? []).map((e) => e.id)), source: new Set((data.sources ?? []).map((s) => s.id)) };
  const refs: ImportUnresolvedReference[] = [];
  const add = (ref: ImportUnresolvedReference) => refs.push(ref);
  (data.unions ?? []).forEach((u, i) => { ([['partner1_id', u.partner1_id], ['partner2_id', u.partner2_id]] as const).forEach(([field, id]) => { if (id && !ids.person.has(id)) add({ sourceEntityType: 'union', sourceImportId: u.id, targetEntityType: 'person', referenceKind: 'union_partner', referenceId: id, fileName: 'unions.csv', rowNumber: i + 2, field, message: `unions.csv ${i + 2}行目 ${field}: ${id} が見つかりません。` }); }); });
  (data.parentChildRelations ?? []).forEach((r, i) => { if (r.parent_id && !ids.person.has(r.parent_id)) add({ sourceEntityType: 'relation', sourceImportId: r.id, targetEntityType: 'person', referenceKind: 'relation_parent', referenceId: r.parent_id, fileName: 'parent_child_relations.csv', rowNumber: i + 2, field: 'parent_id', message: `parent_child_relations.csv ${i + 2}行目 parent_id: ${r.parent_id} が見つかりません。` }); if (r.child_id && !ids.person.has(r.child_id)) add({ sourceEntityType: 'relation', sourceImportId: r.id, targetEntityType: 'person', referenceKind: 'relation_child', referenceId: r.child_id, fileName: 'parent_child_relations.csv', rowNumber: i + 2, field: 'child_id', message: `parent_child_relations.csv ${i + 2}行目 child_id: ${r.child_id} が見つかりません。` }); if (r.union_id && !ids.union.has(r.union_id)) add({ sourceEntityType: 'relation', sourceImportId: r.id, targetEntityType: 'union', referenceKind: 'unknown', referenceId: r.union_id, fileName: 'parent_child_relations.csv', rowNumber: i + 2, field: 'union_id', message: `parent_child_relations.csv ${i + 2}行目 union_id: ${r.union_id} が見つかりません。` }); });
  (data.events ?? []).forEach((e, i) => { const target = e.target_type as ImportReferenceEntityType; if ((target === 'person' || target === 'union' || target === 'relation') && !(ids[target] as Set<string>).has(e.target_id)) add({ sourceEntityType: 'event', sourceImportId: e.id, targetEntityType: target, referenceKind: 'event_target', referenceId: e.target_id, fileName: 'events.csv', rowNumber: i + 2, field: 'target_id', message: `events.csv ${i + 2}行目 target_id: ${e.target_id} が見つかりません。` }); });
  (data.citations ?? []).forEach((c, i) => { if (c.source_id && !ids.source.has(c.source_id)) add({ sourceEntityType: 'citation', sourceImportId: c.id, targetEntityType: 'source', referenceKind: 'citation_source', referenceId: c.source_id, fileName: 'citations.csv', rowNumber: i + 2, field: 'source_id', message: `citations.csv ${i + 2}行目 source_id: ${c.source_id} が見つかりません。` }); const target = c.target_type as ImportReferenceEntityType; if ((target === 'person' || target === 'union' || target === 'relation' || target === 'event') && !(ids[target] as Set<string>).has(c.target_id)) add({ sourceEntityType: 'citation', sourceImportId: c.id, targetEntityType: target, referenceKind: 'citation_target', referenceId: c.target_id, fileName: 'citations.csv', rowNumber: i + 2, field: 'target_id', message: `citations.csv ${i + 2}行目 target_id: ${c.target_id} が見つかりません。` }); });
  return refs;
}

function countRowsWithSeverity(issues: ImportPreviewIssue[], severity: ImportPreviewIssueSeverity) {
  return new Set(issues.filter((issue) => issue.severity === severity && issue.rowNumber != null).map((issue) => `${issue.fileName ?? 'unknown'}:${issue.rowNumber}`)).size;
}

function countRowsWithAnyIssue(issues: ImportPreviewIssue[]) {
  return new Set(issues.filter((issue) => issue.rowNumber != null && (issue.severity === 'error' || issue.severity === 'warning')).map((issue) => `${issue.fileName ?? 'unknown'}:${issue.rowNumber}`)).size;
}

export function buildSimpleCsvImportPreview(data: NormalizedFamilyData, totalRows: number, options: ImportPreviewOptions = {}): ImportPreviewResult {
  const importPolicy = options.importPolicy ?? 'replace_all';
  const importPolicyStatus = getImportPolicyStatus(importPolicy);
  const placeholderPersonPolicy = options.placeholderPersonPolicy ?? 'warn_and_skip';
  const placeholderPersonPolicyStatus = getPlaceholderPersonPolicyStatus(placeholderPersonPolicy);
  const matches = matchImportEntitiesByExternalId(data.persons.map((person, index) => ({ entityType: 'person' as const, importId: person.id, externalId: person.external_id, displayName: person.display_name, rowNumber: index + 2, fileName: 'simple_csv' })), options.existingData);
  const unresolvedReferences = detectSimpleCsvUnresolvedReferences(options.simpleRows ?? data.persons.map((p) => ({ person_id: p.external_id ?? p.id, name: p.display_name })));
  const placeholderPersonCandidates = buildPlaceholderPersonCandidates(unresolvedReferences, placeholderPersonPolicy);
  const issues = [...data.issues.map((issue) => mapIssue(issue)), ...matchIssues(matches), ...unresolvedReferenceIssues(unresolvedReferences, placeholderPersonPolicy)];
  const errorRows = countRowsWithSeverity(issues, 'error');
  const warningRows = countRowsWithSeverity(issues, 'warning');
  const errorIssues = issues.filter((issue) => issue.severity === 'error').length;
  const warningIssues = issues.filter((issue) => issue.severity === 'warning').length;
  return {
    summary: {
      mode: 'simple_csv', importPolicy, importPolicyStatus, totalRows,
      validRows: Math.max(0, totalRows - countRowsWithAnyIssue(issues)),
      warningRows, errorRows, totalIssues: issues.length, warningIssues, errorIssues,
      plannedCreate: { persons: data.persons.length, unions: data.unions.length, relations: data.parentChildRelations.length, events: (data as unknown as { events?: unknown[] }).events?.length ?? 0, sources: (data as unknown as { sources?: unknown[] }).sources?.length ?? 0, citations: (data as unknown as { citations?: unknown[] }).citations?.length ?? 0 },
      matchSummary: summarizeImportMatches(matches),
      policyPlan: buildPolicyPlan(matches, importPolicy),
      placeholderPersonPolicy, placeholderPersonPolicyStatus, unresolvedReferenceSummary: summarizeUnresolvedReferences(unresolvedReferences, placeholderPersonPolicy),
    },
    issues, matches, unresolvedReferences, placeholderPersonCandidates, canImport: canImportWithPolicy(errorIssues, importPolicy, placeholderPersonPolicy, unresolvedReferences.length), hasWarnings: warningIssues > 0,
  };
}

const standardFileKeys = [
  ['persons.csv', 'persons'], ['unions.csv', 'unions'], ['parent_child_relations.csv', 'parent_child_relations'], ['sources.csv', 'sources'], ['citations.csv', 'citations'], ['events.csv', 'events'],
] as const;

export function buildStandardCsvSetImportPreview(preview: { issues: ValidationIssue[]; counts: { persons:number; unions:number; parent_child_relations:number; sources:number; citations:number; events:number; warnings:number; errors:number } }, files?: StandardCsvSetTextFiles, options: ImportPreviewOptions = {}): ImportPreviewResult {
  const importPolicy = options.importPolicy ?? 'replace_all';
  const importPolicyStatus = getImportPolicyStatus(importPolicy);
  const placeholderPersonPolicy = options.placeholderPersonPolicy ?? 'warn_and_skip';
  const placeholderPersonPolicyStatus = getPlaceholderPersonPolicyStatus(placeholderPersonPolicy);
  const issueFile = (issue: ValidationIssue) => {
    if (issue.code === 'missing_manifest' || issue.code === 'invalid_manifest_json' || issue.code === 'invalid_manifest_format' || issue.code === 'unsupported_manifest_version' || issue.code === 'missing_manifest_file_entry') return 'manifest.json';
    if (issue.code === 'missing_required_file') return issue.message.match(/^(\S+\.csv)/)?.[1];
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
  const unresolvedReferences = detectStandardCsvSetUnresolvedReferences(preview as Parameters<typeof detectStandardCsvSetUnresolvedReferences>[0]);
  const placeholderPersonCandidates = buildPlaceholderPersonCandidates(unresolvedReferences, placeholderPersonPolicy);
  const issues = [...preview.issues.map((issue) => mapIssue(issue, issueFile(issue))), ...matchIssues(matches), ...unresolvedReferenceIssues(unresolvedReferences, placeholderPersonPolicy)];
  const errorIssues = issues.filter((issue) => issue.severity === 'error').length;
  const warningIssues = issues.filter((issue) => issue.severity === 'warning').length;
  const totalRows = preview.counts.persons + preview.counts.unions + preview.counts.parent_child_relations + preview.counts.sources + preview.counts.citations + preview.counts.events;
  const filesSummary = standardFileKeys.map(([fileName, key]) => ({ fileName, rows: preview.counts[key], present: files ? files[fileName] != null : true }));
  return {
    summary: {
      mode: 'standard_csv_set', importPolicy, importPolicyStatus, totalRows,
      validRows: Math.max(0, totalRows - countRowsWithAnyIssue(issues)),
      warningRows: countRowsWithSeverity(issues, 'warning'), errorRows: countRowsWithSeverity(issues, 'error'),
      totalIssues: issues.length, warningIssues, errorIssues,
      plannedCreate: { persons: preview.counts.persons, unions: preview.counts.unions, relations: preview.counts.parent_child_relations, events: preview.counts.events, sources: preview.counts.sources, citations: preview.counts.citations },
      matchSummary: summarizeImportMatches(matches),
      policyPlan: buildPolicyPlan(matches, importPolicy),
      placeholderPersonPolicy, placeholderPersonPolicyStatus, unresolvedReferenceSummary: summarizeUnresolvedReferences(unresolvedReferences, placeholderPersonPolicy),
    },
    issues, matches, unresolvedReferences, placeholderPersonCandidates, files: filesSummary, manifestPresent: files ? files['manifest.json'] != null : true, canImport: canImportWithPolicy(errorIssues, importPolicy, placeholderPersonPolicy, unresolvedReferences.length), hasWarnings: warningIssues > 0,
  };
}
