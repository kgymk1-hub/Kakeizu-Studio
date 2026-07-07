import { describe, expect, it } from 'vitest';
import type { Event, ParentChildRelation, Person, Union } from '../models';
import { filterEvents, resolveEventTargetSummary } from '../components/EventListPanel/eventListFilter';

const now = '2026-01-01T00:00:00.000Z';
const event = (overrides: Partial<Event>): Event => ({ id: 'e', event_type: 'birth', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now, ...overrides });
const persons: Person[] = [
  { id: 'p1', display_name: '山田 太郎', family_name: '山田', given_name: '太郎', created_at: now, updated_at: now },
  { id: 'p2', display_name: '佐藤 花子', family_name: '佐藤', given_name: '花子', created_at: now, updated_at: now },
  { id: 'p3', display_name: '田中 一郎', family_name: '田中', given_name: '一郎', created_at: now, updated_at: now },
];
const unions: Union[] = [{ id: 'u1', partner1_id: 'p1', partner2_id: 'p2', union_type: 'marriage', created_at: now, updated_at: now }];
const relations: ParentChildRelation[] = [{ id: 'r1', parent_id: 'p1', child_id: 'p3', relation_type: 'biological', created_at: now, updated_at: now }];
const data = { persons, unions, relations };
const events: Event[] = [
  event({ id: 'e1', event_type: 'birth', target_id: 'p1', date_text: '明治10年', description: '出生届', note: '本家' }),
  event({ id: 'e2', event_type: 'marriage', target_type: 'union', target_id: 'u1', date_text: '大正1年', description: '婚姻' }),
  event({ id: 'e3', event_type: 'adoption', target_type: 'relation', target_id: 'r1', date_text: '昭和5年', note: '養子縁組' }),
  event({ id: 'e4', event_type: 'death', target_id: 'missing', description: '参照切れ' }),
];

describe('event list helpers', () => {
  it('検索語なしなら全件返す', () => { expect(filterEvents(events, data)).toEqual(events); });
  it('event_typeでフィルタできる', () => { expect(filterEvents(events, data, { event_type: 'marriage' }).map((e) => e.id)).toEqual(['e2']); });
  it('date_textで検索できる', () => { expect(filterEvents(events, data, { query: '明治10' }).map((e) => e.id)).toEqual(['e1']); });
  it('descriptionで検索できる', () => { expect(filterEvents(events, data, { query: '婚姻' }).map((e) => e.id)).toEqual(['e2']); });
  it('noteで検索できる', () => { expect(filterEvents(events, data, { query: '本家' }).map((e) => e.id)).toEqual(['e1']); });
  it('関連人物名で検索できる', () => { expect(filterEvents(events, data, { query: '花子' }).map((e) => e.id)).toEqual(['e2']); });
  it('person対象Eventの関連人物名を解決できる', () => { expect(resolveEventTargetSummary(events[0], data).label).toBe('山田 太郎'); });
  it('union対象Eventの関連人物名を解決できる', () => { expect(resolveEventTargetSummary(events[1], data).label).toBe('山田 太郎 × 佐藤 花子'); });
  it('relation対象Eventの関連人物名を解決できる', () => { expect(resolveEventTargetSummary(events[2], data).label).toBe('山田 太郎 → 田中 一郎'); });
  it('参照切れでもクラッシュしない', () => { expect(resolveEventTargetSummary(events[3], data)).toMatchObject({ label: '参照切れ（人物）', broken: true }); });
  it('複数条件を組み合わせられる', () => { expect(filterEvents(events, data, { query: '大正', event_type: 'marriage' }).map((e) => e.id)).toEqual(['e2']); });
  it('条件に合わない場合は空配列になる', () => { expect(filterEvents(events, data, { query: '大正', event_type: 'birth' })).toEqual([]); });
});
