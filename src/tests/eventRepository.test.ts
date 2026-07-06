import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Citation, Event } from '../models';

type Row = { id: string };
const stores = { events: new Map<string, Event>(), citations: new Map<string, Citation>() };
function makeQuery<T extends Row>(store: Map<string, T>, predicate: (item: T) => boolean) { return { toArray: async () => [...store.values()].filter(predicate), delete: async () => { for (const item of [...store.values()].filter(predicate)) store.delete(item.id); } }; }
function makeTable<T extends Row>(store: Map<string, T>) { return { add: async (item:T)=>{store.set(item.id,item);}, put: async (item:T)=>{store.set(item.id,item);}, bulkPut: async (items:T[])=>{for(const item of items) store.set(item.id,item);}, delete: async(id:string)=>{store.delete(id);}, orderBy:()=>({toArray:async()=>[...store.values()]}), where:(index:string)=>({ equals:(value: unknown)=>makeQuery(store, (item)=> index === '[target_type+target_id]' ? (item as any).target_type === (value as any[])[0] && (item as any).target_id === (value as any[])[1] : false) }) }; }
vi.mock('../db/dexieDb', () => ({ db: { events: makeTable(stores.events), citations: makeTable(stores.citations), transaction: async (_m:string, ...args:unknown[])=>{ const cb = args.at(-1) as () => Promise<void>; await cb(); } } }));
const repo = await import('../db/repositories/eventRepository');
const now = '2026-07-06T00:00:00.000Z';
const event: Event = { id:'e1', event_type:'birth', target_type:'person', target_id:'p1', date_text:'明治1年', created_at:now, updated_at:now };

beforeEach(()=>{ stores.events.clear(); stores.citations.clear(); });

describe('eventRepository', () => {
  it('Eventを追加・取得・更新・削除できる', async () => {
    await repo.addEvent(event);
    expect(await repo.listEvents()).toEqual([event]);
    await repo.updateEvent({ ...event, date_text:'明治2年' });
    expect((await repo.listEvents())[0].date_text).toBe('明治2年');
    await repo.deleteEvent('e1');
    expect(await repo.listEvents()).toEqual([]);
  });

  it("listEventsForTarget('person', personId) が動く", async () => {
    await repo.addOrUpdateEvents([event, { ...event, id:'e2', target_id:'p2' }]);
    expect(await repo.listEventsForTarget('person', 'p1')).toEqual([event]);
  });

  it('Event削除時にEvent Citationも削除される', async () => {
    await repo.addEvent(event);
    stores.citations.set('c1', { id:'c1', source_id:'s1', target_type:'event', target_id:'e1', created_at:now, updated_at:now });
    await repo.deleteEvent('e1');
    expect([...stores.citations.values()]).toEqual([]);
  });
});
