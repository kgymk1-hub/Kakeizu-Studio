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

describe('FamilyTreeView relationship edge styles', () => {
  it('親子線のrelation_typeに応じたクラスを生成できる', async () => {
    const { getEdgeClassName, getEdgeDashArray } = await import('../components/FamilyTreeView/FamilyTreeView');
    expect(getEdgeClassName({ id: 'e1', type: 'parent-child', from: 'p1', to: 'p2', relation_type: 'biological' })).toContain('edge-relation-biological');
    expect(getEdgeDashArray({ id: 'e1', type: 'parent-child', from: 'p1', to: 'p2', relation_type: 'biological' })).toBeUndefined();
    expect(getEdgeClassName({ id: 'e2', type: 'parent-child', from: 'p1', to: 'p2', relation_type: 'adoptive' })).toContain('edge-relation-adoptive');
    expect(getEdgeDashArray({ id: 'e2', type: 'parent-child', from: 'p1', to: 'p2', relation_type: 'adoptive' })).toBe('8 5');
    expect(getEdgeClassName({ id: 'e3', type: 'parent-child', from: 'p1', to: 'p2', relation_type: 'step' })).toContain('edge-relation-step');
    expect(getEdgeDashArray({ id: 'e3', type: 'parent-child', from: 'p1', to: 'p2', relation_type: 'step' })).toBe('2 5');
    expect(getEdgeClassName({ id: 'e4', type: 'parent-child', from: 'p1', to: 'p2', relation_type: 'disputed' })).toContain('edge-relation-disputed');
  });

  it('関係線にconfidence / review_statusのクラスを付けられる', async () => {
    const { getEdgeClassName } = await import('../components/FamilyTreeView/FamilyTreeView');
    expect(getEdgeClassName({ id: 'e1', type: 'parent-child', from: 'p1', to: 'p2', relation_type: 'biological', confidence: 'uncertain' })).toContain('edge-confidence-uncertain');
    expect(getEdgeClassName({ id: 'e2', type: 'parent-child', from: 'p1', to: 'p2', relation_type: 'biological', confidence: 'disputed' })).toContain('edge-confidence-disputed');
    expect(getEdgeClassName({ id: 'e3', type: 'parent-child', from: 'p1', to: 'p2', relation_type: 'biological', review_status: 'unreviewed' })).toContain('edge-review-unreviewed');
  });

  it('Union線のunion_type / status / end_reasonに応じたクラスを生成できる', async () => {
    const { getEdgeClassName, getEdgeDashArray } = await import('../components/FamilyTreeView/FamilyTreeView');
    expect(getEdgeClassName({ id: 'e1', type: 'spouse', from: 'p1', to: 'u1', union_type: 'marriage' })).toContain('edge-union-marriage');
    expect(getEdgeDashArray({ id: 'e1', type: 'spouse', from: 'p1', to: 'u1', union_type: 'marriage' })).toBeUndefined();
    expect(getEdgeClassName({ id: 'e2', type: 'spouse', from: 'p1', to: 'u1', union_type: 'partner' })).toContain('edge-union-partner');
    expect(getEdgeDashArray({ id: 'e2', type: 'spouse', from: 'p1', to: 'u1', union_type: 'partner' })).toBe('9 5');
    expect(getEdgeClassName({ id: 'e3', type: 'spouse', from: 'p1', to: 'u1', union_type: 'marriage', status: 'divorced' })).toContain('edge-union-divorced');
    expect(getEdgeClassName({ id: 'e4', type: 'spouse', from: 'p1', to: 'u1', union_type: 'marriage', end_reason: 'divorce' })).toContain('edge-union-divorced');
    expect(getEdgeClassName({ id: 'e5', type: 'spouse', from: 'p1', to: 'u1', union_type: 'marriage', status: 'widowed' })).toContain('edge-union-widowed');
    expect(getEdgeClassName({ id: 'e6', type: 'spouse', from: 'p1', to: 'u1', union_type: 'marriage', end_reason: 'death' })).toContain('edge-union-widowed');
  });

  it('凡例が表示される', () => {
    const html = render('standard');
    expect(html).toContain('凡例:');
    expect(html).toContain('実親子 = 実線');
    expect(html).toContain('養親子 = 破線');
    expect(html).toContain('継親子 = 点線');
    expect(html).toContain('婚姻 = 橙の実線');
    expect(html).toContain('離婚/終了 = 警告色・破線');
  });
});
