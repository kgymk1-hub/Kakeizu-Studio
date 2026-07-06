import { describe, expect, it } from 'vitest';
import type { Citation, Source } from '../models';
import { createJsonBackup, parseJsonBackup } from '../services/backupService';

const now = '2026-07-05T00:00:00.000Z';
const source: Source = { id: 's1', source_type: 'book', title: '本', created_at: now, updated_at: now };
const citation: Citation = { id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now };

describe('backupService Source/Citation', () => {
  it('JSONバックアップにsources/citationsが含まれる', () => {
    const parsed = JSON.parse(createJsonBackup({ persons: [], unions: [], parent_child_relations: [], import_batches: [], sources: [source], citations: [citation] }));
    expect(parsed.schema_version).toBe('1.2');
    expect(parsed.sources).toEqual([source]);
    expect(parsed.citations).toEqual([citation]);
  });

  it('sources/citationsがない旧形式JSONでも復元できる', () => {
    const backup = parseJsonBackup(JSON.stringify({ schema_version: '1.0', exported_at: now, persons: [], unions: [], parent_child_relations: [], import_batches: [] }));
    expect(backup.sources).toEqual([]);
    expect(backup.citations).toEqual([]);
  });
});


import type { Event } from '../models';

describe('backupService events', () => {
  it('JSONバックアップにeventsが含まれる', () => {
    const event: Event = { id:'e1', event_type:'birth', target_type:'person', target_id:'p1', created_at:'2026-01-01T00:00:00.000Z', updated_at:'2026-01-01T00:00:00.000Z' };
    const parsed = JSON.parse(createJsonBackup({ persons:[], unions:[], parent_child_relations:[], import_batches:[], sources:[], citations:[], events:[event] }));
    expect(parsed.schema_version).toBe('1.2');
    expect(parsed.events).toEqual([event]);
  });

  it('旧1.0 / 1.1 JSONでeventsがなくても復元できる', () => {
    expect(parseJsonBackup(JSON.stringify({ schema_version:'1.0' })).events).toEqual([]);
    expect(parseJsonBackup(JSON.stringify({ schema_version:'1.1' })).events).toEqual([]);
  });
});
