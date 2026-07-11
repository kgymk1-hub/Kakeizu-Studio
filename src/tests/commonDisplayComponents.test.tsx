import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '../components/common/EmptyState';
import { MetricPills } from '../components/common/MetricPills';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => { root.render(element); });
  return { container, root };
}

describe('EmptyState', () => {
  it('p要素として文字列とclassNameを表示し、余分なwrapperを追加しない', () => {
    const { container, root } = render(<EmptyState className="notice list-panel-empty">条件に一致する人物がありません。</EmptyState>);
    const element = container.querySelector('p');

    expect(container.children).toHaveLength(1);
    expect(element?.tagName).toBe('P');
    expect(element?.classList.contains('notice')).toBe(true);
    expect(element?.classList.contains('list-panel-empty')).toBe(true);
    expect(element?.textContent).toBe('条件に一致する人物がありません。');
    act(() => root.unmount());
    container.remove();
  });

  it('className省略時もp要素として表示する', () => {
    const { container, root } = render(<EmptyState>問題はありません。</EmptyState>);
    const element = container.querySelector('p');

    expect(container.children).toHaveLength(1);
    expect(element?.tagName).toBe('P');
    expect(element?.textContent).toBe('問題はありません。');
    expect(element?.getAttribute('class')).toBeNull();
    act(() => root.unmount());
    container.remove();
  });
});

describe('MetricPills', () => {
  it('div.preview-metrics直下のspanにitem順のまま表示し、余分なwrapperを追加しない', () => {
    const { container, root } = render(<MetricPills items={[{ key: 'persons', content: <>Person 10</> }, { key: 'unions', content: <>Union 3</> }, { key: 'events', content: <>Event 5</> }]} />);
    const rootElement = container.firstElementChild;
    const spans = Array.from(container.querySelectorAll('span'));

    expect(container.children).toHaveLength(1);
    expect(rootElement?.tagName).toBe('DIV');
    expect(rootElement?.classList.contains('preview-metrics')).toBe(true);
    expect(spans).toHaveLength(3);
    expect(spans.map((span) => span.textContent)).toEqual(['Person 10', 'Union 3', 'Event 5']);
    expect(Array.from(rootElement?.children ?? []).map((child) => child.tagName)).toEqual(['SPAN', 'SPAN', 'SPAN']);
    act(() => root.unmount());
    container.remove();
  });
});
