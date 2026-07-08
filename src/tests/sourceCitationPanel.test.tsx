import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SourceCitationPanel } from '../components/SourceCitationPanel/SourceCitationPanel';
import type { Citation, Event, ParentChildRelation, Person, Source, Union } from '../models';
const now = '2026-01-01T00:00:00.000Z';
const persons: Person[] = [{ id: 'p1', display_name: '山田 太郎', created_at: now, updated_at: now }];
const sources: Source[] = [{ id: 's1', source_type: 'book', title: '資料タイトル', created_at: now, updated_at: now }];
const citations: Citation[] = [{ id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', quote_text: '引用文', created_at: now, updated_at: now }];
const events: Event[] = [];
const unions: Union[] = [];
const relations: ParentChildRelation[] = [];
function renderPanel(onSelectTarget = vi.fn()) { const container = document.createElement('div'); document.body.appendChild(container); const root = createRoot(container); act(() => { root.render(<SourceCitationPanel sources={sources} citations={citations} persons={persons} events={events} unions={unions} relations={relations} onSelectTarget={onSelectTarget} />); }); return { container, root, onSelectTarget }; }
describe('SourceCitationPanel', () => {
  it('SourceタイトルとCitation引用文が表示される', () => { const { container, root } = renderPanel(); expect(container.textContent).toContain('資料タイトル'); expect(container.textContent).toContain('引用文'); act(() => root.unmount()); });
  it('検索すると表示件数が変わる', () => { const { container, root } = renderPanel(); const input = container.querySelector('input[type="text"]') as HTMLInputElement; act(() => { input.value = '一致しない'; input.dispatchEvent(new Event('input', { bubbles: true })); }); expect(container.textContent).toContain('0 / 1 件のSourceを表示'); expect(container.textContent).toContain('0 / 1 件のCitationを表示'); act(() => root.unmount()); });
  it('CitationクリックでonSelectTargetが呼ばれる', () => { const onSelectTarget = vi.fn(); const { container, root } = renderPanel(onSelectTarget); const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('引用文')) as HTMLButtonElement; act(() => { button.click(); }); expect(onSelectTarget).toHaveBeenCalledWith({ target_type: 'person', target_id: 'p1' }); act(() => root.unmount()); });
  it('SourceクリックでCitationをSource絞り込みする', () => { const { container, root } = renderPanel(); const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('資料タイトル')) as HTMLButtonElement; act(() => { button.click(); }); expect(container.textContent).toContain('Source絞り込みを解除'); act(() => root.unmount()); });
});
