import { useState } from 'react';
import type { Person, SelectableTarget, ValidationIssue, ValidationSeverity, ValidationTargetType } from '../../models';
import { validationIssueToSelectableTarget } from '../../services/selectionService';

export const VALIDATION_PANEL_DISPLAY_LIMIT = 50;

type ValidationCounts = Record<ValidationSeverity, number> & { total: number };

export interface ValidationIssueFilters {
  severity?: ValidationSeverity | 'all';
  category?: string | 'all';
  targetType?: ValidationTargetType | 'all';
}

interface ValidationPanelProps {
  issues: ValidationIssue[];
  persons: Person[];
  displayLimit?: number;
  initialFilters?: ValidationIssueFilters;
  onSelectTarget?: (target: SelectableTarget) => void;
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
  source: 'Source',
  name: 'Name',
  place: 'Place',
};

export function countValidationIssues(issues: ValidationIssue[]): ValidationCounts {
  return issues.reduce<ValidationCounts>((counts, issue) => {
    counts[issue.severity] += 1;
    counts.total += 1;
    return counts;
  }, { error: 0, warning: 0, info: 0, total: 0 });
}

export function filterValidationIssues(issues: ValidationIssue[], filters: ValidationIssueFilters = {}): ValidationIssue[] {
  const severity = filters.severity ?? 'all';
  const category = filters.category ?? 'all';
  const targetType = filters.targetType ?? 'all';

  return issues.filter((issue) => {
    if (severity !== 'all' && issue.severity !== severity) return false;
    if (category !== 'all' && (issue.category ?? '未分類') !== category) return false;
    if (targetType !== 'all' && (issue.target_type ?? '不明') !== targetType) return false;
    return true;
  });
}

export function getValidationCategoryOptions(issues: ValidationIssue[]): string[] {
  return Array.from(new Set(issues.map((issue) => issue.category ?? '未分類'))).sort();
}

export function getValidationTargetTypeOptions(issues: ValidationIssue[]): string[] {
  return Array.from(new Set(issues.map((issue) => issue.target_type ?? '不明'))).sort();
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

export function ValidationPanel({ issues, persons, displayLimit = VALIDATION_PANEL_DISPLAY_LIMIT, initialFilters = {}, onSelectTarget }: ValidationPanelProps) {
  const [severityFilter, setSeverityFilter] = useState<ValidationSeverity | 'all'>(initialFilters.severity ?? 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialFilters.category ?? 'all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<ValidationTargetType | 'all'>(initialFilters.targetType ?? 'all');
  const counts = countValidationIssues(issues);
  const categoryOptions = getValidationCategoryOptions(issues);
  const targetTypeOptions = getValidationTargetTypeOptions(issues);
  const filteredIssues = filterValidationIssues(issues, { severity: severityFilter, category: categoryFilter, targetType: targetTypeFilter });
  const visibleIssues = filteredIssues.slice(0, displayLimit);
  const isLimited = filteredIssues.length > visibleIssues.length;

  return <section className="panel list-panel validation-panel" aria-labelledby="validation-panel-title">
    <h2 id="validation-panel-title">データ検証結果</h2>
    <div className="list-panel-count validation-counts" aria-label="検証結果件数">
      <span className="error">error: {counts.error}</span>
      <span className="warning">warning: {counts.warning}</span>
      <span className="info">info: {counts.info}</span>
      <span>total: {counts.total}</span>
    </div>
    <div className="list-panel-controls validation-filters" aria-label="検証結果フィルタ">
      <label>severity
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as ValidationSeverity | 'all')}>
          <option value="all">すべて</option>
          <option value="error">error</option>
          <option value="warning">warning</option>
          <option value="info">info</option>
        </select>
      </label>
      <label>category
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">すべて</option>
          {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <label>target_type
        <select value={targetTypeFilter} onChange={(e) => setTargetTypeFilter(e.target.value as ValidationTargetType | 'all')}>
          <option value="all">すべて</option>
          {targetTypeOptions.map((targetType) => <option key={targetType} value={targetType}>{targetType}</option>)}
        </select>
      </label>
    </div>
    <p className="list-panel-count validation-visible-count">条件一致: {filteredIssues.length}件 / 全体: {counts.total}件</p>
    <dl className="validation-help">
      <div><dt>error</dt><dd>{severityDescriptions.error}</dd></div>
      <div><dt>warning</dt><dd>{severityDescriptions.warning}</dd></div>
      <div><dt>info</dt><dd>{severityDescriptions.info}</dd></div>
    </dl>
    {issues.length === 0 ? <p className="success">問題は見つかりませんでした。</p> : filteredIssues.length === 0 ? <p className="notice list-panel-empty">条件に一致する検証結果がありません。</p> : <>
      {isLimited && <p className="notice">最初の{displayLimit}件を表示しています。</p>}
      <ul className="list-card-list validation-issue-list">
        {visibleIssues.map((issue, index) => {
          const target = validationIssueToSelectableTarget(issue);
          const canSelectTarget = !!target && !!onSelectTarget;
          const selectLabel = canSelectTarget ? '対象へ移動' : '対象へ移動不可';
          return <li key={issue.id ?? `${issue.severity}-${issue.target_type}-${issue.target_id}-${index}`} className={`list-card validation-issue ${issue.severity} ${canSelectTarget ? 'selectable' : 'not-selectable'}`}>
            <div className="validation-issue-header">
              <h3>[{issue.severity}] {issue.title ?? issue.category ?? '検証項目'}</h3>
              {canSelectTarget ? <button type="button" className="validation-target-button" onClick={() => onSelectTarget(target)}>対象へ移動</button> : <span className="validation-target-unavailable" aria-label={selectLabel}>{selectLabel}</span>}
            </div>
            <p>{formatValidationTarget(issue, persons)}</p>
            <p>target_type: {issue.target_type ?? '不明'} / target_id: {issue.target_id ?? '不明'}</p>
            <p>category: {issue.category ?? '未分類'}</p>
            <p>{issue.message}</p>
          </li>;
        })}
      </ul>
    </>}
  </section>;
}
