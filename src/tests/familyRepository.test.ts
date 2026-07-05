import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Citation, ImportBatch, ParentChildRelation, Person, Source, Union } from '../models';

type Row = { id: string };
const stores = {
  persons: new Map<string, Person>(),
  unions: new Map<string, Union>(),
  parentChildRelations: new Map<string, ParentChildRelation>(),
  importBatches: new Map<string, ImportBatch>(),
  sources: new Map<string, Source>(),
  citations: new Map<string, Citation>(),
};

function makeTable<T extends Row>(store: Map<string, T>) {
  return {
    clear: async () => { store.clear(); },
    put: async (item: T) => { store.set(item.id, item); },
    bulkPut: async (items: T[]) => { for (const item of items) store.set(item.id, item); },
    toArray: async () => [...store.values()],
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
    transaction: async (_mode: string, _tables: unknown[], cb: () => Promise<void>) => { await cb(); },
  },
}));

const repo = await import('../db/repositories/familyRepository');

const now = '2026-07-05T00:00:00.000Z';
const person: Person = { id: 'p1', external_id: 'P001', display_name: '人物A', gender: 'unknown', confidence: 'confirmed', review_status: 'reviewed', created_at: now, updated_at: now };
const importBatch: ImportBatch = { id: 'b1', imported_at: now, import_type: 'csv_simple', source_name: 'test.csv', imported_count: 1, warning_count: 0, error_count: 0 };
const source: Source = { id: 's1', source_type: 'book', title: '本', created_at: now, updated_at: now };
const citation: Citation = { id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now };

beforeEach(() => { Object.values(stores).forEach((store) => store.clear()); });

describe('familyRepository Source/Citation cleanup', () => {
  it('clearFamilyDataがsources/citationsも削除する', async () => {
    stores.persons.set(person.id, person);
    stores.importBatches.set(importBatch.id, importBatch);
    stores.sources.set(source.id, source);
    stores.citations.set(citation.id, citation);

    await repo.clearFamilyData();

    expect(await repo.loadFamilyData()).toMatchObject({ persons: [], importBatches: [], sources: [], citations: [] });
  });

  it('CSVインポートの全置き換え保存で既存sources/citationsも削除する', async () => {
    stores.sources.set(source.id, source);
    stores.citations.set(citation.id, citation);

    await repo.saveFamilyData({ persons: [person], unions: [], parentChildRelations: [], importBatch });

    const saved = await repo.loadFamilyData();
    expect(saved.persons).toEqual([person]);
    expect(saved.sources).toEqual([]);
    expect(saved.citations).toEqual([]);
  });
});
