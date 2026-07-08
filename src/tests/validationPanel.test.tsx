import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ValidationPanel, countValidationIssues, filterValidationIssues, formatValidationTarget, getValidationCategoryOptions, getValidationTargetTypeOptions } from '../components/ValidationPanel/ValidationPanel';
import type { Person, ValidationIssue } from '../models';

const now = '2026-07-06T00:00:00.000Z';
const persons: Person[] = [{ id: 'p1', display_name: '山田太郎', created_at: now, updated_at: now }];

const issues: ValidationIssue[] = [
  { severity: 'error', category: 'broken_reference', target_type: 'relation', target_id: 'r001', title: '参照先不明', message: 'parent_id が存在しないPerson p999 を参照しています。' },
  { severity: 'warning', category: 'missing_citation', target_type: 'person', target_id: 'p1', title: '出典なし', message: 'この人物には出典がありません。' },
  { severity: 'info', category: 'unreviewed', target_type: 'event', target_id: 'e1', title: '参考情報', message: '参考情報です。' },
];

describe('ValidationPanel', () => {

  it('severityでerrorだけに絞り込める', () => {
    expect(filterValidationIssues(issues, { severity: 'error' })).toEqual([issues[0]]);
  });

  it('severityでwarningだけに絞り込める', () => {
    expect(filterValidationIssues(issues, { severity: 'warning' })).toEqual([issues[1]]);
  });

  it('categoryでmissing_citationだけに絞り込める', () => {
    expect(filterValidationIssues(issues, { category: 'missing_citation' })).toEqual([issues[1]]);
  });

  it('target_typeでpersonだけに絞り込める', () => {
    expect(filterValidationIssues(issues, { targetType: 'person' })).toEqual([issues[1]]);
  });

  it('severity + category + target_type の組み合わせで絞り込める', () => {
    expect(filterValidationIssues(issues, { severity: 'warning', category: 'missing_citation', targetType: 'person' })).toEqual([issues[1]]);
    expect(filterValidationIssues(issues, { severity: 'error', category: 'missing_citation', targetType: 'person' })).toEqual([]);
  });

  it('categoryとtarget_typeの選択肢をissueから自動生成できる', () => {
    expect(getValidationCategoryOptions(issues)).toEqual(['broken_reference', 'missing_citation', 'unreviewed']);
    expect(getValidationTargetTypeOptions(issues)).toEqual(['event', 'person', 'relation']);
  });



  it('date_inconsistency / age_warningをcategoryフィルタ選択肢に出せる', () => {
    const dateIssues: ValidationIssue[] = [
      { severity: 'error', category: 'date_inconsistency', target_type: 'union', target_id: 'u1', message: '離婚年が婚姻年より前です。' },
      { severity: 'warning', category: 'age_warning', target_type: 'relation', target_id: 'r1', message: '子の出生時点で親が8歳です。' },
    ];
    expect(getValidationCategoryOptions(dateIssues)).toEqual(['age_warning', 'date_inconsistency']);
  });



  it('クリック可能なissueに対象へ移動UIを表示し、クリックでonSelectTargetを呼ぶ', () => {
    const container = document.createElement('div');
    const onSelectTarget = vi.fn();
    act(() => {
      createRoot(container).render(<ValidationPanel issues={issues} persons={persons} onSelectTarget={onSelectTarget} />);
    });
    const button = Array.from(container.querySelectorAll('button')).find((element) => element.textContent === '対象へ移動') as HTMLButtonElement | undefined;
    expect(button).toBeTruthy();
    act(() => button?.click());
    expect(onSelectTarget).toHaveBeenCalledWith({ target_type: 'relation', target_id: 'r001' });
  });

  it('クリック不可のissueは対象へ移動不可を表示し、onSelectTargetを呼ばない', () => {
    const container = document.createElement('div');
    const onSelectTarget = vi.fn();
    const noTargetIssues: ValidationIssue[] = [{ severity: 'info', category: 'unreviewed', title: '全体確認', message: '対象がありません。' }];
    act(() => {
      createRoot(container).render(<ValidationPanel issues={noTargetIssues} persons={persons} onSelectTarget={onSelectTarget} />);
    });
    expect(container.textContent).toContain('対象へ移動不可');
    expect(container.querySelector('button.validation-target-button')).toBeNull();
    expect(onSelectTarget).not.toHaveBeenCalled();
  });



  it('Source / Citation issueは対象へ移動不可として表示する', () => {
    const sourceCitationIssues: ValidationIssue[] = [
      { severity: 'warning', category: 'broken_reference', target_type: 'source', target_id: 's1', title: 'Source確認', message: 'Source issueです。' } as unknown as ValidationIssue,
      { severity: 'warning', category: 'broken_reference', target_type: 'citation', target_id: 'c1', title: 'Citation確認', message: 'Citation issueです。' },
    ];
    const container = document.createElement('div');
    const onSelectTarget = vi.fn();
    act(() => {
      createRoot(container).render(<ValidationPanel issues={sourceCitationIssues} persons={persons} onSelectTarget={onSelectTarget} />);
    });
    expect(container.textContent).toContain('対象へ移動不可');
    expect(container.querySelector('button.validation-target-button')).toBeNull();
    expect(onSelectTarget).not.toHaveBeenCalled();
  });

  it('onSelectTargetがない場合はtargetつきissueでもクリック不可表示になる', () => {
    const html = renderToStaticMarkup(<ValidationPanel issues={[issues[1]]} persons={persons} />);
    expect(html).toContain('対象へ移動不可');
    expect(html).not.toContain('class="validation-target-button"');
  });

  it('フィルタ後0件の場合に一致なしメッセージを表示できる', () => {
    const html = renderToStaticMarkup(<ValidationPanel issues={issues} persons={persons} initialFilters={{ severity: 'error', category: 'missing_citation' }} />);
    expect(html).toContain('条件に一致する検証結果がありません。');
    expect(html).toContain('条件一致: 0件 / 全体: 3件');
  });

  it('条件一致件数 / 全体件数が表示される', () => {
    const html = renderToStaticMarkup(<ValidationPanel issues={issues} persons={persons} initialFilters={{ severity: 'warning' }} />);
    expect(html).toContain('条件一致: 1件 / 全体: 3件');
  });

  it('表示上限がフィルタ後の結果に対して適用される', () => {
    const manyIssues = Array.from({ length: 4 }, (_, index): ValidationIssue => ({ severity: index === 0 ? 'error' : 'warning', category: 'missing_citation', target_type: 'person', target_id: `p${index}`, message: `issue ${index}` }));
    const html = renderToStaticMarkup(<ValidationPanel issues={manyIssues} persons={persons} displayLimit={2} initialFilters={{ severity: 'warning' }} />);
    expect(html).toContain('条件一致: 3件 / 全体: 4件');
    expect(html).toContain('最初の2件を表示しています。');
    expect(html).toContain('issue 1');
    expect(html).toContain('issue 2');
    expect(html).not.toContain('issue 3');
  });

  it('既存パネルとValidationPanelの見出しが同じ検証結果になっていない', () => {
    const html = renderToStaticMarkup(<ValidationPanel issues={issues} persons={persons} />);
    expect(html).toContain('データ検証結果');
    expect(html).not.toContain('<h2 id="validation-panel-title">検証結果</h2>');
  });
  it('error / warning / info件数を表示できる', () => {
    const html = renderToStaticMarkup(<ValidationPanel issues={issues} persons={persons} />);
    expect(html).toContain('error: 1');
    expect(html).toContain('warning: 1');
    expect(html).toContain('info: 1');
    expect(html).toContain('total: 3');
  });

  it('issue一覧を表示できる', () => {
    const html = renderToStaticMarkup(<ValidationPanel issues={issues} persons={persons} />);
    expect(html).toContain('[error] 参照先不明');
    expect(html).toContain('[warning] 出典なし');
    expect(html).toContain('category: broken_reference');
  });

  it('issueが0件の場合に問題なしメッセージを表示できる', () => {
    const html = renderToStaticMarkup(<ValidationPanel issues={[]} persons={persons} />);
    expect(html).toContain('問題は見つかりませんでした。');
  });

  it('target_type / target_id / messageを表示できる', () => {
    const html = renderToStaticMarkup(<ValidationPanel issues={issues} persons={persons} />);
    expect(html).toContain('target_type: relation / target_id: r001');
    expect(html).toContain('parent_id が存在しないPerson p999 を参照しています。');
  });

  it('target_typeがpersonの場合、人物名を表示できる', () => {
    expect(formatValidationTarget(issues[1], persons)).toBe('対象: 人物 山田太郎 (p1)');
    const html = renderToStaticMarkup(<ValidationPanel issues={issues} persons={persons} />);
    expect(html).toContain('対象: 人物 山田太郎 (p1)');
  });

  it('表示件数制限の文言を表示できる', () => {
    const manyIssues = Array.from({ length: 3 }, (_, index): ValidationIssue => ({ severity: 'warning', category: 'missing_citation', target_type: 'person', target_id: `p${index}`, message: `issue ${index}` }));
    const html = renderToStaticMarkup(<ValidationPanel issues={manyIssues} persons={persons} displayLimit={2} />);
    expect(html).toContain('最初の2件を表示しています。');
    expect(html).toContain('issue 0');
    expect(html).not.toContain('issue 2');
  });

  it('集計関数で件数を返せる', () => {
    expect(countValidationIssues(issues)).toEqual({ error: 1, warning: 1, info: 1, total: 3 });
  });
});
