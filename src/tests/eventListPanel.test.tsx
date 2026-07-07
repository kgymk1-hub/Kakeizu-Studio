import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { EventListPanel } from '../components/EventListPanel/EventListPanel';
import type { Event, ParentChildRelation, Person, Union } from '../models';

const now = '2026-01-01T00:00:00.000Z';
const persons: Person[] = [
  { id: 'p1', display_name: '山田 太郎', created_at: now, updated_at: now },
  { id: 'p2', display_name: '佐藤 花子', created_at: now, updated_at: now },
];
const unions: Union[] = [{ id: 'u1', partner1_id: 'p1', partner2_id: 'p2', union_type: 'marriage', created_at: now, updated_at: now }];
const relations: ParentChildRelation[] = [];
const events: Event[] = [
  { id: 'e1', event_type: 'birth', target_type: 'person', target_id: 'p1', date_text: '明治10年', description: '出生', created_at: now, updated_at: now },
  { id: 'e2', event_type: 'marriage', target_type: 'union', target_id: 'u1', date_text: '大正1年', description: '婚姻', created_at: now, updated_at: now },
];

function renderPanel(onSelectTarget = vi.fn()) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => { root.render(<EventListPanel events={events} persons={persons} unions={unions} relations={relations} onSelectTarget={onSelectTarget} />); });
  return { container, root, onSelectTarget };
}

describe('EventListPanel', () => {
  it('Eventが表示される', () => {
    const { container, root } = renderPanel();
    expect(container.textContent).toContain('birth');
    expect(container.textContent).toContain('marriage');
    act(() => root.unmount());
  });

  it('検索すると表示件数が変わる', () => {
    const { container, root } = renderPanel();
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    act(() => { input.value = '花子'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(container.textContent).toContain('1 / 2 件を表示');
    expect(container.textContent).toContain('marriage');
    act(() => root.unmount());
  });

  it('EventクリックでonSelectTargetが呼ばれる', () => {
    const onSelectTarget = vi.fn();
    const { container, root } = renderPanel(onSelectTarget);
    const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('birth')) as HTMLButtonElement;
    act(() => { button.click(); });
    expect(onSelectTarget).toHaveBeenCalledWith({ target_type: 'event', target_id: 'e1' });
    act(() => root.unmount());
  });
});
