import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Citation, Source } from '../models';

const stores = {
  sources: new Map<string, Source>(),
  citations: new Map<string, Citation>(),
};

function makeTable<T extends { id: string }>(store: Map<string, T>) {
  return {
    add: async (item: T) => { store.set(item.id, item); },
    put: async (item: T) => { store.set(item.id, item); },
    get: async (id: string) => store.get(id),
    delete: async (id: string) => { store.delete(id); },
    toArray: async () => [...store.values()],
    orderBy: () => ({ toArray: async () => [...store.values()] }),
    where: (field: string) => ({
      equals: (value: unknown) => ({
        toArray: async () => [...store.values()].filter((item) => field === '[target_type+target_id]' ? (item as unknown as Citation).target_type === (value as unknown[])[0] && (item as unknown as Citation).target_id === (value as unknown[])[1] : (item as Record<string, unknown>)[field] === value),
        delete: async () => { for (const item of [...store.values()]) { if ((item as Record<string, unknown>)[field] === value) store.delete(item.id); } },
      }),
    }),
  };
}

vi.mock('../db/dexieDb', () => {
  const db = {
    sources: makeTable(stores.sources),
    citations: makeTable(stores.citations),
    transaction: async (_mode: string, ...args: unknown[]) => { const cb = args.at(-1) as () => Promise<void>; await cb(); },
  };
  return { db };
});

const repo = await import('../db/repositories/sourceRepository');

const now = '2026-07-05T00:00:00.000Z';
const source = (id = 's1'): Source => ({ id, source_type: 'website', title: `資料${id}`, created_at: now, updated_at: now });
const citation = (id = 'c1', sourceId = 's1'): Citation => ({ id, source_id: sourceId, target_type: 'person', target_id: 'p1', created_at: now, updated_at: now });

beforeEach(() => { stores.sources.clear(); stores.citations.clear(); });

describe('sourceRepository', () => {
  it('Sourceを追加・取得・更新・削除できる', async () => {
    await repo.addSource(source());
    expect(await repo.getSourceById('s1')).toMatchObject({ title: '資料s1' });
    await repo.updateSource({ ...source(), title: '更新済み' });
    expect((await repo.listSources())[0].title).toBe('更新済み');
    await repo.deleteSource('s1');
    expect(await repo.getSourceById('s1')).toBeUndefined();
  });

  it('Citationを追加・取得・削除でき、personターゲットで取得できる', async () => {
    await repo.addCitation(citation());
    expect(await repo.listCitations()).toHaveLength(1);
    expect(await repo.listCitationsForTarget('person', 'p1')).toHaveLength(1);
    await repo.deleteCitation('c1');
    expect(await repo.listCitations()).toHaveLength(0);
  });

  it('Source削除時に関連Citationも削除される', async () => {
    await repo.addSource(source());
    await repo.addCitation(citation('c1', 's1'));
    await repo.addCitation(citation('c2', 'missing'));
    await repo.deleteSource('s1');
    expect((await repo.listCitations()).map((c) => c.id)).toEqual(['c2']);
  });
});
