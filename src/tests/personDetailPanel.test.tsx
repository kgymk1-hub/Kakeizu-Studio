import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PersonDetailPanel } from '../components/PersonDetailPanel/PersonDetailPanel';
import type { Citation, ParentChildRelation, Person, Source, Union } from '../models';

const now = '2026-07-05T00:00:00.000Z';
const person: Person = { id: 'p1', external_id: 'P001', display_name: '人物A', gender: 'unknown', confidence: 'confirmed', review_status: 'reviewed', created_at: now, updated_at: now };
const missingSourceCitation: Citation = { id: 'c1', source_id: 'missing', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now };

describe('PersonDetailPanel Source/Citation display', () => {
  it('Sourceが存在しないCitationでも安全な表示で落ちない', () => {
    const html = renderToStaticMarkup(<PersonDetailPanel person={person} sources={[]} citations={[missingSourceCitation]} onChange={() => undefined} onSaveCitation={() => undefined} onDeleteCitation={() => undefined} />);

    expect(html).toContain('参照先資料なし');
    expect(html).toContain('出典あり');
  });
});


describe('PersonDetailPanel relation Citation display', () => {
  it('Sourceが存在しない関係Citationでも安全な表示で落ちない', () => {
    const parent: Person = { ...person, id: 'p0', display_name: '親' };
    const relation: ParentChildRelation = { id: 'r1', parent_id: 'p0', child_id: 'p1', relation_type: 'biological', created_at: now, updated_at: now };
    const union: Union = { id: 'u1', partner1_id: 'p1', partner2_id: 'p0', union_type: 'marriage', created_at: now, updated_at: now };
    const relationCitation: Citation = { id: 'cr1', source_id: 'missing', target_type: 'relation', target_id: 'r1', created_at: now, updated_at: now };
    const unionCitation: Citation = { id: 'cu1', source_id: 'missing', target_type: 'union', target_id: 'u1', created_at: now, updated_at: now };
    const html = renderToStaticMarkup(<PersonDetailPanel person={person} persons={[person, parent]} relations={[relation]} unions={[union]} sources={[]} citations={[relationCitation, unionCitation]} onChange={() => undefined} onSaveCitation={() => undefined} onDeleteCitation={() => undefined} />);

    expect(html).toContain('関係の出典');
    expect(html).toContain('親子関係：親 → 人物A');
    expect(html).toContain('夫婦関係：人物A ⇔ 親');
    expect(html.match(/参照先資料なし/g)?.length).toBe(2);
  });

  it('同じRelation/UnionにSource違いの複数Citationをすべて表示できる', () => {
    const parent: Person = { ...person, id: 'p0', display_name: '親' };
    const relation: ParentChildRelation = { id: 'r1', parent_id: 'p0', child_id: 'p1', relation_type: 'biological', created_at: now, updated_at: now };
    const union: Union = { id: 'u1', partner1_id: 'p1', partner2_id: 'p0', union_type: 'marriage', created_at: now, updated_at: now };
    const sources: Source[] = [
      { id: 's1', source_type: 'current_koseki', title: '戸籍A', created_at: now, updated_at: now },
      { id: 's2', source_type: 'book', title: '資料B', created_at: now, updated_at: now },
    ];
    const relationCitations: Citation[] = [
      { id: 'cr1', source_id: 's1', target_type: 'relation', target_id: 'r1', page_or_location: '1頁', quote_text: '父として記載', interpretation: '父子', confidence: 'confirmed', note: '親子メモ1', created_at: now, updated_at: now },
      { id: 'cr2', source_id: 's2', target_type: 'relation', target_id: 'r1', page_or_location: '2頁', quote_text: '別資料', interpretation: '補強', confidence: 'likely', note: '親子メモ2', created_at: now, updated_at: now },
    ];
    const unionCitations: Citation[] = [
      { id: 'cu1', source_id: 's1', target_type: 'union', target_id: 'u1', page_or_location: '3頁', quote_text: '妻として記載', interpretation: '夫婦', confidence: 'confirmed', note: '夫婦メモ1', created_at: now, updated_at: now },
      { id: 'cu2', source_id: 's2', target_type: 'union', target_id: 'u1', page_or_location: '4頁', quote_text: '婚姻記録', interpretation: '補強', confidence: 'likely', note: '夫婦メモ2', created_at: now, updated_at: now },
    ];
    const html = renderToStaticMarkup(<PersonDetailPanel person={person} persons={[person, parent]} relations={[relation]} unions={[union]} sources={sources} citations={[...relationCitations, ...unionCitations]} onChange={() => undefined} onSaveCitation={() => undefined} onDeleteCitation={() => undefined} />);

    expect(html).toContain('戸籍A');
    expect(html).toContain('資料B');
    expect(html).toContain('父として記載');
    expect(html).toContain('別資料');
    expect(html).toContain('妻として記載');
    expect(html).toContain('婚姻記録');
    expect(html.match(/関係出典を削除/g)?.length).toBe(4);
  });

});
