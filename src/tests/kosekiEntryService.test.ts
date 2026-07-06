import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Citation, Event, ParentChildRelation, Person, Source, Union } from '../models';
import { applyKosekiPersonEntry, createKosekiSource } from '../services/kosekiEntryService';

const now = '2026-01-01T00:00:00.000Z';
const person = (id: string, display_name = id): Person => ({ id, display_name, gender: 'unknown', created_at: now, updated_at: now });
const source = (id = 's1'): Source => ({ id, title: '戸籍', source_type: 'current_koseki', created_at: now, updated_at: now });
const base = (overrides: Partial<{ persons: Person[]; sources: Source[]; citations: Citation[]; parentChildRelations: ParentChildRelation[]; unions: Union[]; events: Event[] }> = {}) => ({ persons: [person('father'), person('mother'), person('spouse')], sources: [source()], citations: [], parentChildRelations: [], unions: [], events: [], ...overrides });

let seq = 0;
beforeEach(() => {
  seq = 0;
  vi.stubGlobal('crypto', { randomUUID: () => `id-${++seq}` });
});

describe('kosekiEntryService', () => {
  it('戸籍資料Sourceを作成できる', () => {
    const s = createKosekiSource({ title: '山田家 除籍', source_type: 'joseki', honseki_text: '東京府', head_of_registry: '山田太郎', issued_date_text: '昭和10年', obtained_date: '2026-01-01', note: 'メモ' });
    expect(s).toMatchObject({ id: 'id-1', title: '山田家 除籍', source_type: 'joseki', honseki_text: '東京府', head_of_registry: '山田太郎' });
  });

  it('戸籍資料Sourceを選んで新規Personを作成しCitationが自動作成される', () => {
    const result = applyKosekiPersonEntry(base(), { mode: 'create', sourceId: 's1', display_name: '山田一郎', gender: 'male', confidence: 'confirmed', page_or_location: '1頁' });
    expect(result.person.display_name).toBe('山田一郎');
    expect(result.persons).toHaveLength(4);
    expect(result.citations).toHaveLength(1);
    expect(result.citation).toMatchObject({ source_id: 's1', target_type: 'person', target_id: result.person.id, confidence: 'confirmed', page_or_location: '1頁' });
  });

  it('既存Person更新時にCitationが自動作成される', () => {
    const data = base({ persons: [person('p1', '旧名')] });
    const result = applyKosekiPersonEntry(data, { mode: 'update', sourceId: 's1', personId: 'p1', display_name: '新名', confidence: 'likely' });
    expect(result.person.display_name).toBe('新名');
    expect(result.citations).toHaveLength(1);
    expect(result.citation).toMatchObject({ target_id: 'p1', confidence: 'likely' });
  });

  it('同じSourceとPersonのCitationが重複作成されず更新される', () => {
    const existing: Citation = { id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', confidence: 'uncertain', created_at: now, updated_at: now };
    const result = applyKosekiPersonEntry(base({ persons: [person('p1')], citations: [existing] }), { mode: 'update', sourceId: 's1', personId: 'p1', display_name: '人物', confidence: 'confirmed', quote_text: '原文' });
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0]).toMatchObject({ id: 'c1', confidence: 'confirmed', quote_text: '原文' });
  });

  it('既存Person更新時は空欄項目で既存値を消さない', () => {
    const existing: Person = { ...person('p1', '旧名'), birth_date_text: '明治10年', death_date_text: '昭和5年', generation_no: 2, rank_title: '戸主', note: '既存メモ', confidence: 'likely' };
    const result = applyKosekiPersonEntry(base({ persons: [existing] }), { mode: 'update', sourceId: 's1', personId: 'p1', display_name: '', birth_date_text: '', death_date_text: '', rank_title: '', note: '', confidence: 'confirmed' });
    expect(result.person).toMatchObject({ display_name: '旧名', birth_date_text: '明治10年', death_date_text: '昭和5年', generation_no: 2, rank_title: '戸主', note: '既存メモ' });
  });

  it('既存Citation更新時はcreated_atを維持しupdated_atだけ更新する', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-03T04:05:06.000Z'));
    const existing: Citation = { id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', confidence: 'uncertain', page_or_location: '1頁', created_at: now, updated_at: now };
    const result = applyKosekiPersonEntry(base({ persons: [person('p1')], citations: [existing] }), { mode: 'update', sourceId: 's1', personId: 'p1', display_name: '人物', confidence: 'confirmed', quote_text: '原文' });
    expect(result.citation.created_at).toBe(now);
    expect(result.citation.updated_at).toBe('2026-02-03T04:05:06.000Z');
    expect(result.citation.page_or_location).toBe('1頁');
    vi.useRealTimers();
  });

  it('人物作成とCitation・親子関係・Union作成を同時に行える', () => {
    const result = applyKosekiPersonEntry(base(), { mode: 'create', sourceId: 's1', display_name: '子', confidence: 'confirmed', fatherId: 'father', motherId: 'mother', spouseId: 'spouse', page_or_location: '2頁', interpretation: '続柄確認' });
    expect(result.persons).toHaveLength(4);
    expect(result.citations).toHaveLength(1);
    expect(result.parentChildRelations).toHaveLength(2);
    expect(result.unions).toHaveLength(1);
    expect(result.citation).toMatchObject({ target_id: result.person.id, page_or_location: '2頁', interpretation: '続柄確認' });
  });

  it('父・母選択でParentChildRelationが作成され重複作成されない', () => {
    const first = applyKosekiPersonEntry(base(), { mode: 'create', sourceId: 's1', display_name: '子', confidence: 'confirmed', fatherId: 'father', motherId: 'mother' });
    expect(first.parentChildRelations).toHaveLength(2);
    const second = applyKosekiPersonEntry(first, { mode: 'update', sourceId: 's1', personId: first.person.id, display_name: '子', confidence: 'confirmed', fatherId: 'father', motherId: 'mother' });
    expect(second.parentChildRelations).toHaveLength(2);
  });

  it('配偶者選択でUnionが作成され重複作成されない', () => {
    const first = applyKosekiPersonEntry(base(), { mode: 'create', sourceId: 's1', display_name: '本人', confidence: 'confirmed', spouseId: 'spouse' });
    expect(first.unions).toHaveLength(1);
    expect(first.unions[0]).toMatchObject({ union_type: 'marriage', partner2_id: 'spouse' });
    const second = applyKosekiPersonEntry(first, { mode: 'update', sourceId: 's1', personId: first.person.id, display_name: '本人', confidence: 'confirmed', spouseId: 'spouse' });
    expect(second.unions).toHaveLength(1);
  });

  it('Source未選択では登録不可', () => {
    expect(() => applyKosekiPersonEntry(base(), { mode: 'create', display_name: 'A', confidence: 'confirmed' })).toThrow('戸籍資料');
  });

  it('氏名空欄では新規Person作成不可', () => {
    expect(() => applyKosekiPersonEntry(base(), { mode: 'create', sourceId: 's1', display_name: '', confidence: 'confirmed' })).toThrow('氏名');
  });

  it('自分自身を父・母・配偶者に選べない', () => {
    expect(() => applyKosekiPersonEntry(base({ persons: [person('p1')] }), { mode: 'update', sourceId: 's1', personId: 'p1', display_name: '本人', confidence: 'confirmed', fatherId: 'p1' })).toThrow('自分自身');
    expect(() => applyKosekiPersonEntry(base({ persons: [person('p1')] }), { mode: 'update', sourceId: 's1', personId: 'p1', display_name: '本人', confidence: 'confirmed', motherId: 'p1' })).toThrow('自分自身');
    expect(() => applyKosekiPersonEntry(base({ persons: [person('p1')] }), { mode: 'update', sourceId: 's1', personId: 'p1', display_name: '本人', confidence: 'confirmed', spouseId: 'p1' })).toThrow('自分自身');
  });
});

describe('kosekiEntryService Event連携', () => {
  it('戸籍入力モードで出生Eventを作成できる', () => {
    const result = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'子', birth_date_text:'明治1年', confidence:'confirmed', createBirthEvent:true });
    expect(result.events).toHaveLength(1);
    expect(result.events?.[0]).toMatchObject({ event_type:'birth', target_type:'person', target_id:result.person.id, date_text:'明治1年' });
    expect(result.citations.some((c) => c.target_type === 'event' && c.target_id === result.events?.[0].id)).toBe(true);
  });

  it('戸籍入力モードで死亡Eventを作成できる', () => {
    const result = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'子', death_date_text:'昭和1年', confidence:'likely', createDeathEvent:true });
    expect(result.events?.[0]).toMatchObject({ event_type:'death', date_text:'昭和1年', confidence:'likely' });
  });


  it('出生日付テキストが空なら出生Event作成ONでもEventを作らない', () => {
    const result = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'子', birth_date_text:'', confidence:'confirmed', createBirthEvent:true });
    expect(result.events).toHaveLength(0);
    expect(result.citations.filter((c) => c.target_type === 'event')).toHaveLength(0);
  });

  it('死亡日付テキストが空なら死亡Event作成ONでもEventを作らない', () => {
    const result = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'子', death_date_text:'', confidence:'confirmed', createDeathEvent:true });
    expect(result.events).toHaveLength(0);
    expect(result.citations.filter((c) => c.target_type === 'event')).toHaveLength(0);
  });

  it('既存Event Citation更新時はcreated_atを維持しupdated_atだけ更新する', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-03T04:05:06.000Z'));
    const existingEvent: Event = { id:'e1', event_type:'birth', target_type:'person', target_id:'p1', date_text:'明治1年', created_at:now, updated_at:now };
    const existingCitation: Citation = { id:'c-event', source_id:'s1', target_type:'event', target_id:'e1', confidence:'uncertain', created_at:now, updated_at:now };
    const result = applyKosekiPersonEntry(base({ persons:[person('p1')], events:[existingEvent], citations:[existingCitation] }), { mode:'update', sourceId:'s1', personId:'p1', display_name:'子', birth_date_text:'明治1年', confidence:'confirmed', createBirthEvent:true });
    const eventCitation = result.citations.find((c) => c.id === 'c-event');
    expect(eventCitation?.created_at).toBe(now);
    expect(eventCitation?.updated_at).toBe('2026-02-03T04:05:06.000Z');
    expect(eventCitation?.confidence).toBe('confirmed');
    vi.useRealTimers();
  });

  it('同一Person / event_type / date_text のEventを重複作成せずCitationも重複作成しない', () => {
    const first = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'子', birth_date_text:'明治1年', confidence:'confirmed', createBirthEvent:true });
    const second = applyKosekiPersonEntry(first, { mode:'update', sourceId:'s1', personId:first.person.id, display_name:'子', birth_date_text:'明治1年', confidence:'confirmed', createBirthEvent:true });
    expect(second.events).toHaveLength(1);
    expect(second.citations.filter((c) => c.target_type === 'event' && c.target_id === second.events?.[0].id)).toHaveLength(1);
  });
});


describe('kosekiEntryService 追加Event', () => {
  it('戸籍入力モードでmarriage Eventを作成できる', () => {
    const result = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'本人', confidence:'confirmed', additionalEventType:'marriage', additionalEventDateText:'明治20年', additionalEventPlaceText:'東京府', additionalEventDescription:'婚姻届出', additionalEventNote:'追加Eventメモ' });
    expect(result.events).toHaveLength(1);
    expect(result.events?.[0]).toMatchObject({ event_type:'marriage', target_type:'person', target_id:result.person.id, date_text:'明治20年', place_text:'東京府', description:'婚姻届出', note:'追加Eventメモ', confidence:'confirmed', review_status:'reviewed' });
  });

  it('戸籍入力モードでtransfer_registry Eventを作成できる', () => {
    const result = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'本人', confidence:'likely', additionalEventType:'transfer_registry', additionalEventDateText:'大正3年', additionalEventPlaceText:'大阪市', additionalEventDescription:'転籍' });
    expect(result.events?.[0]).toMatchObject({ event_type:'transfer_registry', date_text:'大正3年', place_text:'大阪市', description:'転籍', confidence:'likely' });
  });

  it('追加EventにEvent Citationが作成される', () => {
    const result = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'本人', confidence:'confirmed', page_or_location:'3頁', quote_text:'原文', interpretation:'解釈', citation_note:'出典メモ', additionalEventType:'marriage', additionalEventDescription:'婚姻' });
    const event = result.events?.[0];
    expect(result.citations.find((c) => c.target_type === 'event' && c.target_id === event?.id)).toMatchObject({ source_id:'s1', confidence:'confirmed', page_or_location:'3頁', quote_text:'原文', interpretation:'解釈', note:'出典メモ' });
  });

  it('追加Eventが空入力なら作成されない', () => {
    const result = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'本人', confidence:'confirmed', additionalEventType:'marriage', additionalEventDateText:' ', additionalEventPlaceText:' ', additionalEventDescription:' ', additionalEventNote:' ' });
    expect(result.events).toHaveLength(0);
    expect(result.citations.filter((c) => c.target_type === 'event')).toHaveLength(0);
  });

  it('同一Person / event_type / date_text / place_text / description のEventが重複作成されない', () => {
    const first = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'本人', confidence:'confirmed', additionalEventType:'marriage', additionalEventDateText:'明治20年', additionalEventPlaceText:'東京府', additionalEventDescription:'婚姻' });
    const second = applyKosekiPersonEntry(first, { mode:'update', sourceId:'s1', personId:first.person.id, display_name:'本人', confidence:'confirmed', additionalEventType:'marriage', additionalEventDateText:'明治20年', additionalEventPlaceText:'東京府', additionalEventDescription:'婚姻', additionalEventNote:'別メモ' });
    expect(second.events).toHaveLength(1);
    expect(second.citations.filter((c) => c.target_type === 'event' && c.target_id === second.events?.[0].id)).toHaveLength(1);
  });

  it('追加EventからUnionやParentChildRelationやPerson基本情報が自動作成・更新されない', () => {
    const result = applyKosekiPersonEntry(base(), { mode:'create', sourceId:'s1', display_name:'本人', rank_title:'元の肩書', confidence:'confirmed', additionalEventType:'adoption', additionalEventDateText:'明治20年', additionalEventDescription:'養子縁組' });
    expect(result.unions).toHaveLength(0);
    expect(result.parentChildRelations).toHaveLength(0);
    expect(result.person.rank_title).toBe('元の肩書');
  });
});
