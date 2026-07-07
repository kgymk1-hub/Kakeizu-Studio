import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { FamilyTreeView, defaultExportAppearance, formatLifeDates, getConfidenceLabel, getEdgeClassName, getExportBackgroundClassName, getReviewStatusLabel, hasPersonCitation } from '../components/FamilyTreeView/FamilyTreeView';
import type { Citation, LayoutEdge, LayoutNode, Person } from '../models';

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

describe('FamilyTreeView export appearance', () => {
  it('出力用見た目設定UIが表示され、初期状態でタイトルと凡例が表示される', () => {
    const html = render('standard');
    expect(html).toContain('出力用表示:');
    expect(html).toContain('タイトルを表示');
    expect(html).toContain('凡例を表示');
    expect(html).toContain('白');
    expect(html).toContain('透明風');
    expect(html).toContain('淡色');
    expect(html).toContain('<h2 class="tree-export-title">家系図</h2>');
    expect(html).toContain('凡例:');
    expect(html).toContain('tree-export-bg-white');
    expect(defaultExportAppearance).toEqual({ showTitle: true, title: '家系図', showLegend: true, background: 'white' });
  });

  it('PNG/PDF出力対象から操作UIだけを除外し、出力要素は残す', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => { root.render(<FamilyTreeView nodes={[node]} edges={[]} viewBox={viewBox} />); });
    expect(host.querySelector('.tree-toolbar')?.getAttribute('data-html2canvas-ignore')).toBe('true');
    expect(host.querySelector('.export-appearance-controls')?.getAttribute('data-html2canvas-ignore')).toBe('true');
    expect(host.querySelector('.tree-export-title')?.hasAttribute('data-html2canvas-ignore')).toBe(false);
    expect(host.querySelector('.edge-legend')?.hasAttribute('data-html2canvas-ignore')).toBe(false);
    expect(host.querySelector('.tree-svg')?.hasAttribute('data-html2canvas-ignore')).toBe(false);
    act(() => { root.unmount(); });
    host.remove();
  });

  it('タイトル入力を変更すると表示タイトルが変わり、タイトル表示OFFで非表示になる', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => { root.render(<FamilyTreeView nodes={[node]} edges={[]} viewBox={viewBox} />); });
    const titleInput = host.querySelector<HTMLInputElement>('input[aria-label="出力タイトル"]')!;
    act(() => { titleInput.value = '佐藤家の家系図'; titleInput.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(host.querySelector('.tree-export-title')?.textContent).toBe('佐藤家の家系図');
    const titleCheckbox = Array.from(host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))[0];
    act(() => { titleCheckbox.click(); });
    expect(host.querySelector('.tree-export-title')).toBeNull();
    act(() => { root.unmount(); });
    host.remove();
  });

  it('凡例表示ON/OFFを切り替えられる', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => { root.render(<FamilyTreeView nodes={[node]} edges={[]} viewBox={viewBox} />); });
    expect(host.textContent).toContain('凡例:');
    const legendCheckbox = Array.from(host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))[1];
    act(() => { legendCheckbox.click(); });
    expect(host.textContent).not.toContain('凡例:');
    act(() => { root.unmount(); });
    host.remove();
  });

  it('背景を white / transparent / soft に切り替えると対応classが付く', () => {
    expect(getExportBackgroundClassName('white')).toBe('tree-export-bg-white');
    expect(getExportBackgroundClassName('transparent')).toBe('tree-export-bg-transparent');
    expect(getExportBackgroundClassName('soft')).toBe('tree-export-bg-soft');
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => { root.render(<FamilyTreeView nodes={[node]} edges={[]} viewBox={viewBox} />); });
    const select = host.querySelector<HTMLSelectElement>('select[aria-label="出力背景"]')!;
    const preview = () => host.querySelector('.tree-export-preview')!;
    expect(preview().classList.contains('tree-export-bg-white')).toBe(true);
    act(() => { select.value = 'transparent'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(preview().classList.contains('tree-export-bg-transparent')).toBe(true);
    act(() => { select.value = 'soft'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(preview().classList.contains('tree-export-bg-soft')).toBe(true);
    act(() => { root.unmount(); });
    host.remove();
  });

  it('PNG/PDF出力ボタンが引き続き表示される', () => {
    const appSource = readFileSync('src/App.tsx', 'utf8');
    expect(appSource).toContain('PNG出力');
    expect(appSource).toContain('PDF出力');
    expect(appSource).toContain('ref={treeRef}');
  });
});


describe('FamilyTreeView relation edge styles', () => {
  const parentEdge = (relation_type: LayoutEdge['relation_type'], extra: Partial<LayoutEdge> = {}): LayoutEdge => ({ id: `e-${relation_type}`, type: 'parent-child', from: 'p1', to: 'p2', relation_type, ...extra });
  const unionEdge = (extra: Partial<LayoutEdge> = {}): LayoutEdge => ({ id: 'e-union', type: 'spouse', from: 'p1', to: 'u1', union_type: 'marriage', ...extra });

  it('biologicalの親子線が実線系クラスになる', () => {
    expect(getEdgeClassName(parentEdge('biological'))).toContain('edge-relation-biological');
  });

  it('adoptiveの親子線が破線系クラスになる', () => {
    expect(getEdgeClassName(parentEdge('adoptive'))).toContain('edge-relation-adoptive');
  });

  it('stepの親子線が点線系クラスになる', () => {
    expect(getEdgeClassName(parentEdge('step'))).toContain('edge-relation-step');
  });

  it('disputedの親子線が警告系クラスになる', () => {
    expect(getEdgeClassName(parentEdge('disputed'))).toContain('edge-relation-disputed');
  });

  it('confidence === uncertain の関係線に注意系クラスが付く', () => {
    expect(getEdgeClassName(parentEdge('biological', { confidence: 'uncertain' }))).toContain('edge-confidence-uncertain');
  });

  it('confidence === disputed の関係線に異説/警告系クラスが付く', () => {
    expect(getEdgeClassName(parentEdge('biological', { confidence: 'disputed' }))).toContain('edge-confidence-disputed');
  });

  it('review_status === unreviewed の関係線に未確認系クラスが付く', () => {
    expect(getEdgeClassName(parentEdge('biological', { review_status: 'unreviewed' }))).toContain('edge-review-unreviewed');
  });

  it('marriageのUnion線が通常婚姻系クラスになる', () => {
    expect(getEdgeClassName(unionEdge({ union_type: 'marriage' }))).toContain('edge-union-marriage');
  });

  it('partnerのUnion線がパートナー系クラスになる', () => {
    expect(getEdgeClassName(unionEdge({ union_type: 'partner' }))).toContain('edge-union-partner');
  });

  it('divorced / end_reason divorce のUnion線が離婚系クラスになる', () => {
    expect(getEdgeClassName(unionEdge({ status: 'divorced' }))).toContain('edge-union-divorced');
    expect(getEdgeClassName(unionEdge({ end_reason: 'divorce' }))).toContain('edge-union-divorced');
  });

  it('widowed / end_reason death のUnion線が死別系クラスになる', () => {
    expect(getEdgeClassName(unionEdge({ status: 'widowed' }))).toContain('edge-union-widowed');
    expect(getEdgeClassName(unionEdge({ end_reason: 'death' }))).toContain('edge-union-widowed');
  });

  it('凡例が表示される', () => {
    const html = render('standard');
    expect(html).toContain('凡例:');
    expect(html).toContain('養親子 = 破線');
    expect(html).toContain('離婚/終了 = 警告色・破線');
  });
});
