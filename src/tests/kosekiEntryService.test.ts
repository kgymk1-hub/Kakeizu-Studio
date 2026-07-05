import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Citation, ParentChildRelation, Person, Source, Union } from '../models';
import { applyKosekiPersonEntry, createKosekiSource } from '../services/kosekiEntryService';

const now = '2026-01-01T00:00:00.000Z';
const person = (id: string, display_name = id): Person => ({ id, display_name, gender: 'unknown', created_at: now, updated_at: now });
const source = (id = 's1'): Source => ({ id, title: '戸籍', source_type: 'current_koseki', created_at: now, updated_at: now });
const base = (overrides: Partial<{ persons: Person[]; sources: Source[]; citations: Citation[]; parentChildRelations: ParentChildRelation[]; unions: Union[] }> = {}) => ({ persons: [person('father'), person('mother'), person('spouse')], sources: [source()], citations: [], parentChildRelations: [], unions: [], ...overrides });

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
