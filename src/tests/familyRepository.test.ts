import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Citation, Event, ImportBatch, ParentChildRelation, Person, Source, Union } from '../models';

type Row = { id: string };
const stores = {
  persons: new Map<string, Person>(),
  unions: new Map<string, Union>(),
  parentChildRelations: new Map<string, ParentChildRelation>(),
  importBatches: new Map<string, ImportBatch>(),
  sources: new Map<string, Source>(),
  citations: new Map<string, Citation>(),
  events: new Map<string, Event>(),
};

function makeTable<T extends Row>(store: Map<string, T>) {
  return {
    clear: async () => { store.clear(); },
    put: async (item: T) => { store.set(item.id, item); },
    bulkPut: async (items: T[]) => { for (const item of items) store.set(item.id, item); },
    toArray: async () => [...store.values()],
    get: async (id: string) => store.get(id),
    delete: async (id: string) => { store.delete(id); },
    where: (index: string) => ({
      equals: (value: unknown) => ({
        delete: async () => {
          for (const item of [...store.values()]) {
            if (index === '[target_type+target_id]' && Array.isArray(value) && 'target_type' in item && 'target_id' in item && (item as { target_type: string; target_id: string }).target_type === value[0] && (item as { target_type: string; target_id: string }).target_id === value[1]) store.delete(item.id);
          }
        },
      }),
    }),
  };
}

vi.mock('../db/dexieDb', () => ({
  db: {
    persons: makeTable(stores.persons),
    unions: makeTable(stores.unions),
    parentChildRelations: makeTable(stores.parentChildRelations),
    importBatches: makeTable(stores.importBatches),
    sources: makeTable(stores.sources),
    citations: makeTable(stores.citations),
    events: makeTable(stores.events),
    transaction: async (_mode: string, _tables: unknown[], cb: () => Promise<void>) => { await cb(); },
  },
}));

const repo = await import('../db/repositories/familyRepository');

const now = '2026-07-05T00:00:00.000Z';
const person: Person = { id: 'p1', external_id: 'P001', display_name: '人物A', gender: 'unknown', confidence: 'confirmed', review_status: 'reviewed', created_at: now, updated_at: now };
const importBatch: ImportBatch = { id: 'b1', imported_at: now, import_type: 'csv_simple', source_name: 'test.csv', imported_count: 1, warning_count: 0, error_count: 0 };
const source: Source = { id: 's1', source_type: 'book', title: '本', created_at: now, updated_at: now };
const citation: Citation = { id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now };
const event: Event = { id: 'e1', event_type: 'birth', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now };

beforeEach(() => { Object.values(stores).forEach((store) => store.clear()); });

describe('familyRepository Source/Citation cleanup', () => {
  it('clearFamilyDataがsources/citations/eventsも削除する', async () => {
    stores.persons.set(person.id, person);
    stores.importBatches.set(importBatch.id, importBatch);
    stores.sources.set(source.id, source);
    stores.citations.set(citation.id, citation);
    stores.events.set(event.id, event);

    await repo.clearFamilyData();

    expect(await repo.loadFamilyData()).toMatchObject({ persons: [], importBatches: [], sources: [], citations: [], events: [] });
  });

  it('CSVインポートの全置き換え保存で既存sources/citations/eventsも削除する', async () => {
    stores.sources.set(source.id, source);
    stores.citations.set(citation.id, citation);
    stores.events.set(event.id, event);

    await repo.saveFamilyData({ persons: [person], unions: [], parentChildRelations: [], importBatch });

    const saved = await repo.loadFamilyData();
    expect(saved.persons).toEqual([person]);
    expect(saved.sources).toEqual([]);
    expect(saved.citations).toEqual([]);
    expect(saved.events).toEqual([]);
  });
});


describe('familyRepository relation deletion', () => {
  const relation: ParentChildRelation = { id: 'r1', parent_id: 'p1', child_id: 'p2', relation_type: 'biological', created_at: now, updated_at: now };
  const union: Union = { id: 'u1', partner1_id: 'p1', partner2_id: 'p2', union_type: 'marriage', created_at: now, updated_at: now };
  const relationCitation: Citation = { id: 'cr1', source_id: 's1', target_type: 'relation', target_id: 'r1', created_at: now, updated_at: now };
  const unionCitation: Citation = { id: 'cu1', source_id: 's1', target_type: 'union', target_id: 'u1', created_at: now, updated_at: now };

  it('ParentChildRelationを削除し、relation Citationも削除する', async () => {
    stores.parentChildRelations.set(relation.id, relation);
    stores.citations.set(relationCitation.id, relationCitation);

    await repo.deleteParentChildRelationWithCitations('r1');

    expect([...stores.parentChildRelations.values()]).toEqual([]);
    expect([...stores.citations.values()]).toEqual([]);
  });

  it('Unionを削除し、union Citationも削除する', async () => {
    stores.unions.set(union.id, union);
    stores.citations.set(unionCitation.id, unionCitation);

    await repo.deleteUnionWithCitations('u1');

    expect([...stores.unions.values()]).toEqual([]);
    expect([...stores.citations.values()]).toEqual([]);
  });

  it('存在しないRelation/Union削除で落ちない', async () => {
    await expect(repo.deleteParentChildRelationWithCitations('missing')).resolves.toBeUndefined();
    await expect(repo.deleteUnionWithCitations('missing')).resolves.toBeUndefined();
  });
});


describe('relation update repository', () => {
  it('ParentChildRelationのrelation_typeと属性を更新しcreated_atを維持してupdated_atを更新する', async () => {
    stores.parentChildRelations.set('r1', { id: 'r1', parent_id: 'p1', child_id: 'p2', relation_type: 'biological', created_at: now, updated_at: now });
    const updated = await repo.updateParentChildRelation('r1', { relation_type: 'adoptive', start_date_text: '明治1年', end_date_text: '明治2年', confidence: 'uncertain', review_status: 'reviewed', note: '更新メモ' });
    expect(updated).toMatchObject({ relation_type: 'adoptive', start_date_text: '明治1年', end_date_text: '明治2年', confidence: 'uncertain', review_status: 'reviewed', note: '更新メモ', created_at: now });
    expect(updated?.updated_at).not.toBe(now);
    expect(updated?.parent_id).toBe('p1');
    expect(updated?.child_id).toBe('p2');
  });

  it('Unionのunion_typeと属性を更新しcreated_atを維持してupdated_atを更新する', async () => {
    stores.unions.set('u1', { id: 'u1', partner1_id: 'p1', partner2_id: 'p2', union_type: 'marriage', created_at: now, updated_at: now });
    const updated = await repo.updateUnion('u1', { union_type: 'partner', marriage_date_text: '明治3年', divorce_date_text: '明治4年', end_date_text: '明治5年', end_reason: 'divorce', status: 'divorced', confidence: 'likely', review_status: 'rejected', note: '夫婦更新メモ' });
    expect(updated).toMatchObject({ union_type: 'partner', marriage_date_text: '明治3年', divorce_date_text: '明治4年', end_date_text: '明治5年', end_reason: 'divorce', status: 'divorced', confidence: 'likely', review_status: 'rejected', note: '夫婦更新メモ', created_at: now });
    expect(updated?.updated_at).not.toBe(now);
    expect(updated?.partner1_id).toBe('p1');
    expect(updated?.partner2_id).toBe('p2');
  });

  it('存在しないParentChildRelation/Union更新で落ちない', async () => {
    await expect(repo.updateParentChildRelation('missing', { relation_type: 'unknown' })).resolves.toBeUndefined();
    await expect(repo.updateUnion('missing', { union_type: 'unknown' })).resolves.toBeUndefined();
  });
});
