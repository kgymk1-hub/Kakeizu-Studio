import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ValidationPanel, countValidationIssues, formatValidationTarget } from '../components/ValidationPanel/ValidationPanel';
import type { Person, ValidationIssue } from '../models';

const now = '2026-07-06T00:00:00.000Z';
const persons: Person[] = [{ id: 'p1', display_name: '山田太郎', created_at: now, updated_at: now }];

const issues: ValidationIssue[] = [
  { severity: 'error', category: 'broken_reference', target_type: 'relation', target_id: 'r001', title: '参照先不明', message: 'parent_id が存在しないPerson p999 を参照しています。' },
  { severity: 'warning', category: 'missing_citation', target_type: 'person', target_id: 'p1', title: '出典なし', message: 'この人物には出典がありません。' },
  { severity: 'info', category: 'unreviewed', target_type: 'event', target_id: 'e1', title: '参考情報', message: '参考情報です。' },
];

describe('ValidationPanel', () => {
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
