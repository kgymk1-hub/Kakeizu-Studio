import type { Person, ValidationIssue, ValidationSeverity, ValidationTargetType } from '../../models';

export const VALIDATION_PANEL_DISPLAY_LIMIT = 50;

type ValidationCounts = Record<ValidationSeverity, number> & { total: number };

interface ValidationPanelProps {
  issues: ValidationIssue[];
  persons: Person[];
  displayLimit?: number;
}

const severityDescriptions: Record<ValidationSeverity, string> = {
  error: 'データ破損や参照切れの可能性がある問題',
  warning: '確認した方がよい問題',
  info: '参考情報',
};

const targetTypeLabels: Partial<Record<ValidationTargetType, string>> = {
  person: '人物',
  event: 'Event',
  union: '夫婦関係',
  relation: '親子関係',
  citation: 'Citation',
};

export function countValidationIssues(issues: ValidationIssue[]): ValidationCounts {
  return issues.reduce<ValidationCounts>((counts, issue) => {
    counts[issue.severity] += 1;
    counts.total += 1;
    return counts;
  }, { error: 0, warning: 0, info: 0, total: 0 });
}

export function formatValidationTarget(issue: ValidationIssue, persons: Person[]): string {
  const targetType = issue.target_type;
  const targetId = issue.target_id;
  if (!targetType && !targetId) return '対象: 不明';

  const label = targetType ? targetTypeLabels[targetType] ?? targetType : '対象';
  if (targetType === 'person' && targetId) {
    const person = persons.find((p) => p.id === targetId);
    if (person) return `対象: ${label} ${person.display_name} (${targetId})`;
  }
  return `対象: ${label}${targetId ? ` ${targetId}` : ''}`;
}

export function ValidationPanel({ issues, persons, displayLimit = VALIDATION_PANEL_DISPLAY_LIMIT }: ValidationPanelProps) {
  const counts = countValidationIssues(issues);
  const visibleIssues = issues.slice(0, displayLimit);
  const isLimited = issues.length > visibleIssues.length;

  return <section className="panel validation-panel" aria-labelledby="validation-panel-title">
    <h2 id="validation-panel-title">検証結果</h2>
    <div className="validation-counts" aria-label="検証結果件数">
      <span className="error">error: {counts.error}</span>
      <span className="warning">warning: {counts.warning}</span>
      <span className="info">info: {counts.info}</span>
      <span>total: {counts.total}</span>
    </div>
    <dl className="validation-help">
      <div><dt>error</dt><dd>{severityDescriptions.error}</dd></div>
      <div><dt>warning</dt><dd>{severityDescriptions.warning}</dd></div>
      <div><dt>info</dt><dd>{severityDescriptions.info}</dd></div>
    </dl>
    {issues.length === 0 ? <p className="success">問題は見つかりませんでした。</p> : <>
      {isLimited && <p className="notice">最初の{displayLimit}件を表示しています。</p>}
      <ul className="validation-issue-list">
        {visibleIssues.map((issue, index) => <li key={issue.id ?? `${issue.severity}-${issue.target_type}-${issue.target_id}-${index}`} className={`validation-issue ${issue.severity}`}>
          <h3>[{issue.severity}] {issue.title ?? issue.category ?? '検証項目'}</h3>
          <p>{formatValidationTarget(issue, persons)}</p>
          <p>target_type: {issue.target_type ?? '不明'} / target_id: {issue.target_id ?? '不明'}</p>
          <p>category: {issue.category ?? '未分類'}</p>
          <p>{issue.message}</p>
        </li>)}
      </ul>
    </>}
  </section>;
}
