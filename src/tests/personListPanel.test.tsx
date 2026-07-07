import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PersonListPanel } from '../components/PersonListPanel/PersonListPanel';
import type { Citation, Person } from '../models';

const now = '2026-01-01T00:00:00.000Z';
const persons: Person[] = [
  { id: 'p1', display_name: '山田 太郎', family_name: '山田', gender: 'male', created_at: now, updated_at: now },
  { id: 'p2', display_name: '佐藤 花子', occupation: '教師', gender: 'female', created_at: now, updated_at: now },
];
const citations: Citation[] = [{ id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now }];

function renderPanel(onSelectTarget = vi.fn()) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => { root.render(<PersonListPanel persons={persons} citations={citations} onSelectTarget={onSelectTarget} />); });
  return { container, root, onSelectTarget };
}

describe('PersonListPanel', () => {
  it('人物名が表示される', () => {
    const { container, root } = renderPanel();
    expect(container.textContent).toContain('山田 太郎');
    expect(container.textContent).toContain('佐藤 花子');
    act(() => root.unmount());
  });

  it('検索すると表示件数が変わる', () => {
    const { container, root } = renderPanel();
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    act(() => { input.value = '教師'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(container.textContent).toContain('1 / 2 人を表示');
    expect(container.textContent).toContain('佐藤 花子');
    expect(container.textContent).not.toContain('山田 太郎male');
    act(() => root.unmount());
  });

  it('人物クリックでonSelectTargetが呼ばれる', () => {
    const onSelectTarget = vi.fn();
    const { container, root } = renderPanel(onSelectTarget);
    const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('山田 太郎')) as HTMLButtonElement;
    act(() => { button.click(); });
    expect(onSelectTarget).toHaveBeenCalledWith({ target_type: 'person', target_id: 'p1' });
    act(() => root.unmount());
  });
});
