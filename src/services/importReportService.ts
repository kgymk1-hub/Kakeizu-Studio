import type { ImportBatch } from '../models';
import type { ImportMatchSummary, ImportPolicy, ImportPolicyPlan, ImportPreviewIssue, ImportPreviewResult, ImportUnresolvedReference, PlaceholderPersonCandidate, PlaceholderPersonPolicy, UnresolvedReferenceSummary } from './importPreviewService';
import type { ImportBatchMode } from './importBatchService';

export type ImportReportStatus = 'success' | 'success_with_warnings' | 'blocked' | 'preview_only';

export type ImportReport = {
  id: string;
  batchId?: string;
  status: ImportReportStatus;
  mode: ImportBatchMode;
  importPolicy: ImportPolicy;
  placeholderPersonPolicy?: PlaceholderPersonPolicy;
  sourceLabel?: string;
  fileNames: string[];
  createdAt: string;
  importedCounts: { persons: number; unions: number; relations: number; events: number; sources: number; citations: number; };
  issueSummary: { warningIssues: number; errorIssues: number; totalIssues: number; };
  matchSummary?: ImportMatchSummary;
  policyPlan?: ImportPolicyPlan;
  unresolvedReferenceSummary?: UnresolvedReferenceSummary;
  placeholderPersonCandidateCount: number;
  issuePreview: ImportPreviewIssue[];
  unresolvedReferencePreview: ImportUnresolvedReference[];
  placeholderPersonCandidatePreview: PlaceholderPersonCandidate[];
  nextActions: string[];
};

export const IMPORT_REPORT_PREVIEW_LIMIT = 5;

export function createImportReportFromPreview(options: { batch?: ImportBatch; preview: ImportPreviewResult; mode?: ImportBatchMode; sourceLabel?: string; fileNames?: string[]; createdAt?: string; previewLimit?: number; }): ImportReport {
  const { preview } = options;
  const limit = options.previewLimit ?? IMPORT_REPORT_PREVIEW_LIMIT;
  const createdAt = options.createdAt ?? options.batch?.created_at ?? options.batch?.imported_at ?? new Date().toISOString();
  const mode = options.mode ?? options.batch?.mode ?? preview.summary.mode;
  const fileNames = options.fileNames ?? options.batch?.file_names ?? preview.files?.filter((file) => file.present).map((file) => file.fileName) ?? [];
  const importedCounts = options.batch?.imported_counts ?? preview.summary.plannedCreate;
  const status: ImportReportStatus = preview.summary.importPolicyStatus === 'preview_only'
    ? 'preview_only'
    : preview.summary.errorIssues > 0 || !preview.canImport
      ? 'blocked'
      : preview.summary.warningIssues > 0
        ? 'success_with_warnings'
        : 'success';

  return {
    id: `report-${options.batch?.id ?? `${mode}-${createdAt}`}`,
    batchId: options.batch?.id,
    status,
    mode,
    importPolicy: preview.summary.importPolicy,
    placeholderPersonPolicy: preview.summary.placeholderPersonPolicy,
    sourceLabel: options.sourceLabel ?? options.batch?.source_label ?? options.batch?.source_name,
    fileNames,
    createdAt,
    importedCounts,
    issueSummary: {
      warningIssues: preview.summary.warningIssues,
      errorIssues: preview.summary.errorIssues,
      totalIssues: preview.summary.totalIssues,
    },
    matchSummary: preview.summary.matchSummary,
    policyPlan: preview.summary.policyPlan,
    unresolvedReferenceSummary: preview.summary.unresolvedReferenceSummary,
    placeholderPersonCandidateCount: preview.placeholderPersonCandidates.length,
    issuePreview: preview.issues.slice(0, limit),
    unresolvedReferencePreview: preview.unresolvedReferences.slice(0, limit),
    placeholderPersonCandidatePreview: preview.placeholderPersonCandidates.slice(0, limit),
    nextActions: buildImportReportNextActions(preview),
  };
}

export function buildImportReportNextActions(preview: ImportPreviewResult): string[] {
  if (preview.summary.importPolicyStatus === 'preview_only') return ['このインポート方式は現在プレビューのみ対応です。反映後のレポートは作成されません。'];
  if (preview.summary.errorIssues > 0 || !preview.canImport) return ['エラーがあるためデータは反映されませんでした。プレビュー上のissueを確認してください。'];
  const actions: string[] = [];
  if (preview.summary.warningIssues > 0) actions.push('warning内容を確認し、必要に応じてCSVを修正してください。');
  if (preview.summary.unresolvedReferenceSummary.total > 0) actions.push('参照先不明があるため、CSV内のID参照を確認してください。');
  if (preview.placeholderPersonCandidates.length > 0) actions.push('仮人物候補があります。必要なら後続フェーズで仮人物作成を検討してください。');
  if (preview.summary.matchSummary.matchedExisting > 0) actions.push('既存一致候補があります。将来のexternal_idによる更新インポートで扱いを確認してください。');
  actions.push('ValidationPanelで出典なし・未確認・低確度を確認してください。');
  actions.push('家系図表示と人物詳細を確認してください。');
  return actions;
}
