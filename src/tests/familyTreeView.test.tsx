import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FamilyTreeView, formatLifeDates, getConfidenceLabel, getReviewStatusLabel, hasPersonCitation } from '../components/FamilyTreeView/FamilyTreeView';
import type { Citation, LayoutNode, Person } from '../models';

const now = '2026-07-07T00:00:00.000Z';
const person: Person = { id: 'p1', display_name: '山田太郎', gender: 'male', birth_date_text: '1900', death_date_text: '1970', rank_title: '戸主', confidence: 'uncertain', review_status: 'unreviewed', created_at: now, updated_at: now };
const node: LayoutNode = { id: 'p1', type: 'person', x: 10, y: 20, width: 176, height: 84, label: person.display_name, person };
const citation: Citation = { id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now };
const viewBox = { x: 0, y: 0, width: 500, height: 300 };

function render(mode: 'compact' | 'standard' | 'detailed', citations: Citation[] = []) {
  return renderToStaticMarkup(<FamilyTreeView nodes={[node]} edges={[]} viewBox={viewBox} citations={citations} initialDisplayMode={mode} />);
}

describe('FamilyTreeView display modes', () => {
  it('compact表示では氏名中心になる', () => {
    const html = render('compact');
    expect(html).toContain('山田太郎');
    expect(html).not.toContain('1900 - 1970');
    expect(html).not.toContain('戸主');
  });

  it('standard表示では氏名と生没年が表示される', () => {
    const html = render('standard');
    expect(html).toContain('山田太郎');
    expect(html).toContain('1900 - 1970');
  });

  it('detailed表示では氏名、生没年、rank_title、confidence、review_status、出典状態が表示される', () => {
    const html = render('detailed', [citation]);
    expect(html).toContain('山田太郎');
    expect(html).toContain('1900 - 1970');
    expect(html).toContain('戸主');
    expect(html).toContain('要確認');
    expect(html).toContain('未確認');
    expect(html).toContain('出典あり');
  });

  it('Person Citationがある場合は出典あり表示になる', () => {
    expect(hasPersonCitation('p1', [citation])).toBe(true);
    expect(render('detailed', [citation])).toContain('出典あり');
  });

  it('Person Citationがない場合は出典なし表示になる', () => {
    expect(hasPersonCitation('p1', [])).toBe(false);
    expect(render('detailed')).toContain('出典なし');
  });

  it('confidence === uncertain が要確認として表示される', () => {
    expect(getConfidenceLabel('uncertain')).toBe('要確認');
    expect(render('detailed')).toContain('要確認');
  });

  it('confidence === disputed が異説ありとして表示される', () => {
    expect(getConfidenceLabel('disputed')).toBe('異説あり');
  });

  it('review_status === unreviewed が未確認として表示される', () => {
    expect(getReviewStatusLabel('unreviewed')).toBe('未確認');
    expect(render('detailed')).toContain('未確認');
  });

  it('生没年の片側欠損を分かりやすく表示できる', () => {
    expect(formatLifeDates({ birth_date_text: '1900' })).toBe('1900 - ');
    expect(formatLifeDates({ death_date_text: '1970' })).toBe('? - 1970');
  });

  it('表示密度切替UIが表示される', () => {
    const html = render('standard');
    expect(html).toContain('表示密度:');
    expect(html).toContain('コンパクト');
    expect(html).toContain('標準');
    expect(html).toContain('詳細');
  });

  it('表示密度を変更するとノード表示内容が変わる', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => { root.render(<FamilyTreeView nodes={[node]} edges={[]} viewBox={viewBox} citations={[citation]} />); });
    expect(host.textContent).toContain('1900 - 1970');
    expect(host.textContent).not.toContain('戸主');
    const select = host.querySelector('select')!;
    act(() => { select.value = 'detailed'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(host.textContent).toContain('戸主');
    act(() => { root.unmount(); });
    host.remove();
  });
});
