import { describe, expect, it } from 'vitest';
import type { Citation, Event, ParentChildRelation, Person, Source, Union } from '../models';
import { validateFamilyData } from '../services/validationService';

const now = '2026-01-01T00:00:00.000Z';
const person = (id: string, extra: Partial<Person> = {}): Person => ({ id, display_name: id, created_at: now, updated_at: now, ...extra });
const union = (id: string, extra: Partial<Union> = {}): Union => ({ id, partner1_id: 'p1', partner2_id: 'p2', union_type: 'marriage', created_at: now, updated_at: now, ...extra });
const relation = (id: string, extra: Partial<ParentChildRelation> = {}): ParentChildRelation => ({ id, parent_id: 'p1', child_id: 'p2', relation_type: 'biological', created_at: now, updated_at: now, ...extra });
const event = (id: string, extra: Partial<Event> = {}): Event => ({ id, event_type: 'birth', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now, ...extra });
const source = (id = 's1'): Source => ({ id, source_type: 'book', title: id, created_at: now, updated_at: now });
const citation = (id: string, extra: Partial<Citation> = {}): Citation => ({ id, source_id: 's1', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now, ...extra });
const base = () => ({ persons: [person('p1'), person('p2')], unions: [] as Union[], parentChildRelations: [] as ParentChildRelation[], events: [] as Event[], sources: [source()], citations: [] as Citation[] });

describe('validateFamilyData', () => {
  it('出典なしPersonを検出できる', () => {
    expect(validateFamilyData(base())).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'missing_citation', target_type: 'person', target_id: 'p1' })]));
  });

  it('出典なしEventを検出できる', () => {
    const input = base(); input.events = [event('e1')]; input.citations = [citation('c1')];
    expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'missing_citation', target_type: 'event', target_id: 'e1' })]));
  });

  it('出典なしParentChildRelationを検出できる', () => {
    const input = base(); input.parentChildRelations = [relation('r1')]; input.citations = [citation('c1'), citation('c2', { target_type: 'person', target_id: 'p2' })];
    expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'missing_citation', target_type: 'relation', target_id: 'r1' })]));
  });

  it('出典なしUnionを検出できる', () => {
    const input = base(); input.unions = [union('u1')]; input.citations = [citation('c1'), citation('c2', { target_type: 'person', target_id: 'p2' })];
    expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'missing_citation', target_type: 'union', target_id: 'u1' })]));
  });

  it('unreviewed Person / Event / Relation / Union を検出できる', () => {
    const input = base();
    input.persons = [person('p1', { review_status: 'unreviewed' }), person('p2')];
    input.events = [event('e1', { review_status: 'unreviewed' })];
    input.parentChildRelations = [relation('r1', { review_status: 'unreviewed' })];
    input.unions = [union('u1', { review_status: 'unreviewed' })];
    const issues = validateFamilyData(input).filter((i) => i.category === 'unreviewed');
    expect(issues.map((i) => i.target_type).sort()).toEqual(['event', 'person', 'relation', 'union']);
  });

  it('uncertain / disputed Person / Event / Relation / Union を検出できる', () => {
    const input = base();
    input.persons = [person('p1', { confidence: 'uncertain' }), person('p2')];
    input.events = [event('e1', { confidence: 'disputed' })];
    input.parentChildRelations = [relation('r1', { confidence: 'uncertain' })];
    input.unions = [union('u1', { confidence: 'disputed' })];
    const issues = validateFamilyData(input).filter((i) => i.category === 'low_confidence');
    expect(issues.map((i) => i.target_type).sort()).toEqual(['event', 'person', 'relation', 'union']);
  });

  it('存在しないpartner1_idを検出できる', () => { const input = base(); input.unions = [union('u1', { partner1_id: 'missing' })]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'broken_reference', target_id: 'u1', related_ids: ['missing'] })])); });
  it('存在しないpartner2_idを検出できる', () => { const input = base(); input.unions = [union('u1', { partner2_id: 'missing' })]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'broken_reference', target_id: 'u1', related_ids: ['missing'] })])); });
  it('存在しないparent_idを検出できる', () => { const input = base(); input.parentChildRelations = [relation('r1', { parent_id: 'missing' })]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'broken_reference', target_id: 'r1', related_ids: ['missing'] })])); });
  it('存在しないchild_idを検出できる', () => { const input = base(); input.parentChildRelations = [relation('r1', { child_id: 'missing' })]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'broken_reference', target_id: 'r1', related_ids: ['missing'] })])); });
  it('存在しないunion_idを持つRelationを検出できる', () => { const input = base(); input.parentChildRelations = [relation('r1', { union_id: 'missing' })]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'broken_reference', target_id: 'r1', related_ids: ['missing'] })])); });
  it('存在しないsource_idを持つCitationを検出できる', () => { const input = base(); input.citations = [citation('c1', { source_id: 'missing' })]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'broken_reference', target_type: 'citation', target_id: 'c1', related_ids: ['missing'] })])); });
  it('存在しないtarget_idを持つCitationを検出できる', () => { const input = base(); input.citations = [citation('c1', { target_id: 'missing' })]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'broken_reference', target_type: 'citation', target_id: 'c1', related_ids: ['missing'] })])); });
  it('parent_id === child_id を検出できる', () => { const input = base(); input.parentChildRelations = [relation('r1', { parent_id: 'p1', child_id: 'p1' })]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'self_reference', target_id: 'r1' })])); });
  it('partner1_id === partner2_id を検出できる', () => { const input = base(); input.unions = [union('u1', { partner1_id: 'p1', partner2_id: 'p1' })]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'self_reference', target_id: 'u1' })])); });
  it('死亡年が出生年より前のPersonを検出できる', () => { const input = base(); input.persons = [person('p1', { birth_date_text: '1900年', death_date_text: '1899-01-01' })]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ category: 'date_inconsistency', target_type: 'person' })])); });
  it('子の出生年が親の出生年より前のRelationを検出できる', () => { const input = base(); input.persons = [person('p1', { birth_date_text: '1900' }), person('p2', { birth_date_text: '1899' })]; input.parentChildRelations = [relation('r1')]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ severity: 'error', category: 'date_inconsistency', target_type: 'relation' })])); });
  it('子の出生時に親が10歳未満の場合warningになる', () => { const input = base(); input.persons = [person('p1', { birth_date_text: '1900' }), person('p2', { birth_date_text: '1909' })]; input.parentChildRelations = [relation('r1')]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ severity: 'warning', category: 'age_warning' })])); });
  it('子の出生時に親が80歳超の場合warningになる', () => { const input = base(); input.persons = [person('p1', { birth_date_text: '1900' }), person('p2', { birth_date_text: '1981' })]; input.parentChildRelations = [relation('r1')]; expect(validateFamilyData(input)).toEqual(expect.arrayContaining([expect.objectContaining({ severity: 'warning', category: 'age_warning' })])); });
  it('severity順に並ぶ', () => { const input = base(); input.persons = [person('p1', { review_status: 'unreviewed' })]; input.unions = [union('u1', { partner1_id: 'missing' })]; const ranks = validateFamilyData(input).map((i) => i.severity); expect(ranks.indexOf('error')).toBeLessThan(ranks.indexOf('warning')); });
});
