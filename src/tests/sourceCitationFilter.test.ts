import { describe, expect, it } from 'vitest';
import { filterCitations, filterSources, resolveCitationTargetSummary } from '../components/SourceCitationPanel/sourceCitationFilter';
import type { Citation, Event, ParentChildRelation, Person, Source, Union } from '../models';
const now = '2026-01-01T00:00:00.000Z';
const sources: Source[] = [
  { id: 's1', source_type: 'book', title: '山田家資料', author_or_issuer: '山田家', repository: '市立図書館', honseki_text: '東京府', source_text: '原文メモ', url: 'https://example.com', note: '重要', created_at: now, updated_at: now },
  { id: 's2', source_type: 'website', title: 'Web資料', created_at: now, updated_at: now },
];
const persons: Person[] = [{ id: 'p1', display_name: '山田 太郎', created_at: now, updated_at: now }, { id: 'p2', display_name: '山田 花子', created_at: now, updated_at: now }];
const events: Event[] = [{ id: 'e1', event_type: 'birth', target_type: 'person', target_id: 'p1', date_text: '明治10年', created_at: now, updated_at: now }];
const unions: Union[] = [{ id: 'u1', partner1_id: 'p1', partner2_id: 'p2', union_type: 'marriage', created_at: now, updated_at: now }];
const relations: ParentChildRelation[] = [{ id: 'r1', parent_id: 'p1', child_id: 'p2', relation_type: 'biological', created_at: now, updated_at: now }];
const citations: Citation[] = [
  { id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', quote_text: '引用文', interpretation: '解釈', page_or_location: 'p1', confidence: 'confirmed', note: '人物備考', created_at: now, updated_at: now },
  { id: 'c2', source_id: 's1', target_type: 'event', target_id: 'e1', quote_text: '出生引用', created_at: now, updated_at: now },
  { id: 'c3', source_id: 's2', target_type: 'union', target_id: 'u1', created_at: now, updated_at: now },
  { id: 'c4', source_id: 's2', target_type: 'relation', target_id: 'r1', created_at: now, updated_at: now },
  { id: 'c5', source_id: 'missing', target_type: 'person', target_id: 'missing', created_at: now, updated_at: now },
];
const data = { sources, persons, events, unions, relations };

describe('filterSources', () => {
  it('検索語なしなら全件返し、source_typeと各項目で検索できる', () => {
    expect(filterSources(sources)).toHaveLength(2);
    expect(filterSources(sources, { source_type: 'book' })).toEqual([sources[0]]);
    for (const q of ['山田家資料', '山田家', '市立図書館', '東京府', '原文メモ', 'example.com', '重要']) expect(filterSources(sources, { query: q })).toEqual([sources[0]]);
    expect(filterSources(sources, { query: 'なし' })).toEqual([]);
  });
});

describe('filterCitations', () => {
  it('検索語なしなら全件返し、target_typeでフィルタできる', () => {
    expect(filterCitations(citations, data)).toHaveLength(5);
    expect(filterCitations(citations, data, { target_type: 'event' })).toEqual([citations[1]]);
  });
  it('Sourceタイトル・対象名・引用・解釈・位置で検索できる', () => {
    for (const q of ['山田家資料', '山田 太郎', 'birth', '花子', '引用文', '解釈', 'p1']) expect(filterCitations(citations, data, { query: q }).length).toBeGreaterThan(0);
    expect(filterCitations(citations, data, { query: '一致しない' })).toEqual([]);
  });
  it('参照切れでもクラッシュせず表示名を返す', () => {
    expect(resolveCitationTargetSummary(citations[4], data).label).toContain('参照切れ');
  });
});
