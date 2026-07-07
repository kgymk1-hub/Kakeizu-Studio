import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FamilyTreeView } from '../components/FamilyTreeView/FamilyTreeView';
import { createSvgTextFromElement, downloadSvgFromElement } from '../services/exportImageService';
import type { LayoutNode, Person } from '../models';

const now = '2026-07-07T00:00:00.000Z';
const person: Person = { id: 'p1', display_name: '山田太郎', gender: 'male', birth_date_text: '1900', death_date_text: '1970', created_at: now, updated_at: now };
const node: LayoutNode = { id: 'p1', type: 'person', x: 10, y: 20, width: 176, height: 84, label: person.display_name, person };
const viewBox = { x: 0, y: 0, width: 500, height: 300 };

function renderTree() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(<section className="canvas"><FamilyTreeView nodes={[node]} edges={[]} viewBox={viewBox} /></section>); });
  return { host, root, element: host.querySelector<HTMLElement>('.canvas')! };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SVG export', () => {
  it('SVG出力用の文字列にSVG、タイトル、凡例、背景が含まれ、操作UIが含まれない', () => {
    const { host, root, element } = renderTree();
    const svgText = createSvgTextFromElement(element);
    expect(svgText).toContain('<svg');
    expect(svgText).toContain('家系図');
    expect(svgText).toContain('山田太郎');
    expect(svgText).toContain('凡例:');
    expect(svgText).toContain('data-export-background="white"');
    expect(svgText).toContain('<rect width="100%" height="100%" fill="#ffffff"');
    expect(svgText).not.toContain('出力用表示');
    expect(svgText).not.toContain('表示密度');
    act(() => { root.unmount(); });
    host.remove();
  });

  it('タイトル表示ON時の入力タイトルと凡例ON/OFFがSVGに反映される', () => {
    const { host, root, element } = renderTree();
    const titleInput = host.querySelector<HTMLInputElement>('input[aria-label="出力タイトル"]')!;
    act(() => { titleInput.value = '佐藤家の家系図'; titleInput.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(createSvgTextFromElement(element)).toContain('佐藤家の家系図');
    const legendCheckbox = Array.from(host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))[1];
    act(() => { legendCheckbox.click(); });
    expect(createSvgTextFromElement(element)).not.toContain('凡例:');
    act(() => { root.unmount(); });
    host.remove();
  });

  it('背景 soft / transparent がSVGに反映される', () => {
    const { host, root, element } = renderTree();
    const select = host.querySelector<HTMLSelectElement>('select[aria-label="出力背景"]')!;
    act(() => { select.value = 'soft'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(createSvgTextFromElement(element)).toContain('data-export-background="soft"');
    expect(createSvgTextFromElement(element)).toContain('fill="#fff7ea"');
    act(() => { select.value = 'transparent'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    const transparentSvg = createSvgTextFromElement(element);
    expect(transparentSvg).toContain('data-export-background="transparent"');
    expect(transparentSvg).not.toContain('fill="transparent"');
    act(() => { root.unmount(); });
    host.remove();
  });

  it('SVG出力ボタン押下相当でダウンロード処理が呼ばれる', () => {
    const { host, root, element } = renderTree();
    const click = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      const created = document.createElementNS('http://www.w3.org/1999/xhtml', tagName) as HTMLElement;
      if (tagName === 'a') Object.defineProperty(created, 'click', { value: click });
      return created;
    }) as typeof document.createElement);
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:svg');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    downloadSvgFromElement(element);
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:svg');
    act(() => { root.unmount(); });
    host.remove();
  });
});
