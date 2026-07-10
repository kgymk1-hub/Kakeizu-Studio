import { describe, expect, it } from 'vitest';
import type { Citation, Source } from '../models';
import { createJsonBackup, parseJsonBackup } from '../services/backupService';

const now = '2026-07-05T00:00:00.000Z';
const source: Source = { id: 's1', source_type: 'book', title: '本', created_at: now, updated_at: now };
const citation: Citation = { id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now };

describe('backupService Source/Citation', () => {
  it('JSONバックアップにsources/citationsが含まれる', () => {
    const parsed = JSON.parse(createJsonBackup({ persons: [], unions: [], parent_child_relations: [], import_batches: [], sources: [source], citations: [citation] }));
    expect(parsed.schema_version).toBe('1.3');
    expect(parsed.sources).toEqual([source]);
    expect(parsed.citations).toEqual([citation]);
  });

  it('JSONバックアップ/復元でrelation / union Citationが維持される', () => {
    const relationCitation: Citation = { ...citation, id: 'cr1', target_type: 'relation', target_id: 'r1' };
    const unionCitation: Citation = { ...citation, id: 'cu1', target_type: 'union', target_id: 'u1' };
    const parsed = parseJsonBackup(createJsonBackup({ persons: [], unions: [{ id:'u1', partner1_id:'p1', union_type:'marriage', created_at:now, updated_at:now }], parent_child_relations: [{ id:'r1', parent_id:'p1', child_id:'p2', relation_type:'biological', created_at:now, updated_at:now }], import_batches: [], sources: [source], citations: [relationCitation, unionCitation] }));
    expect(parsed.citations).toEqual([relationCitation, unionCitation]);
  });

  it('sources/citationsがない旧形式JSONでも復元できる', () => {
    const backup = parseJsonBackup(JSON.stringify({ schema_version: '1.0', exported_at: now, persons: [], unions: [], parent_child_relations: [], import_batches: [] }));
    expect(backup.sources).toEqual([]);
    expect(backup.citations).toEqual([]);
  });
});


import type { Event } from '../models';

describe('backupService events', () => {
  it('JSONバックアップにeventsとsettingsが含まれる', () => {
    const event: Event = { id:'e1', event_type:'birth', target_type:'person', target_id:'p1', created_at:'2026-01-01T00:00:00.000Z', updated_at:'2026-01-01T00:00:00.000Z' };
    const parsed = JSON.parse(createJsonBackup({ persons:[], unions:[], parent_child_relations:[], import_batches:[], sources:[], citations:[], events:[event] }));
    expect(parsed.schema_version).toBe('1.3');
    expect(parsed.events).toEqual([event]);
    expect(parsed.projects[0].id).toBe('default-project');
    expect(parsed.view_settings[0].tree_display_mode).toBe('standard');
    expect(parsed.export_settings[0].show_title).toBe(true);
    expect(parsed.privacy_settings[0].public_output_mode).toBe(false);
  });

  it('旧1.0 / 1.1 JSONでeventsがなくても復元できる', () => {
    expect(parseJsonBackup(JSON.stringify({ schema_version:'1.0' })).events).toEqual([]);
    expect(parseJsonBackup(JSON.stringify({ schema_version:'1.1' })).events).toEqual([]);
  });
});

describe('relation deletion backup filtering', () => {
  it('Relation削除後、JSONバックアップ対象からRelation/Citationが消える', () => {
    const parsed = JSON.parse(createJsonBackup({ persons: [], unions: [], parent_child_relations: [], import_batches: [], sources: [source], citations: [] }));
    expect(parsed.parent_child_relations).toEqual([]);
    expect(parsed.citations).toEqual([]);
  });

  it('Union削除後、JSONバックアップ対象からUnion/Citationが消える', () => {
    const parsed = JSON.parse(createJsonBackup({ persons: [], unions: [], parent_child_relations: [], import_batches: [], sources: [source], citations: [] }));
    expect(parsed.unions).toEqual([]);
    expect(parsed.citations).toEqual([]);
  });
});


describe('relation edit backup fields', () => {
  it('編集後のParentChildRelationとUnion属性がJSONバックアップ/復元対象に含まれる', () => {
    const relation = { id:'r1', parent_id:'p1', child_id:'p2', relation_type:'adoptive' as const, start_date_text:'明治1年', end_date_text:'明治2年', confidence:'uncertain' as const, review_status:'reviewed' as const, note:'親子編集', created_at:now, updated_at:'2026-07-06T00:00:00.000Z' };
    const union = { id:'u1', partner1_id:'p1', partner2_id:'p2', union_type:'partner' as const, marriage_date_text:'明治3年', divorce_date_text:'明治4年', end_date_text:'明治5年', end_reason:'divorce' as const, status:'divorced' as const, confidence:'likely' as const, review_status:'rejected' as const, note:'夫婦編集', created_at:now, updated_at:'2026-07-06T00:00:00.000Z' };
    const parsed = parseJsonBackup(createJsonBackup({ persons: [], unions: [union], parent_child_relations: [relation], import_batches: [], sources: [], citations: [] }));
    expect(parsed.parent_child_relations[0]).toEqual(relation);
    expect(parsed.unions[0]).toEqual(union);
  });
});


describe('backupService v1.3 settings compatibility', () => {
  it('schema_version 1.2 の古いJSONはdefault settingsを補完して復元できる', () => {
    const backup = parseJsonBackup(JSON.stringify({ schema_version: '1.2', persons: [{ id: 'p1', display_name: 'A', created_at: now, updated_at: now }], unions: [], parent_child_relations: [], import_batches: [] }));
    expect(backup.persons[0].id).toBe('p1');
    expect(backup.projects[0].id).toBe('default-project');
    expect(backup.privacy_settings[0].hide_private_persons).toBe(true);
  });

  it('schema_version 1.3 の設定を作成・復元できる', () => {
    const json = createJsonBackup({ persons: [], unions: [], parent_child_relations: [], import_batches: [], sources: [], citations: [], view_settings: [{ id: 'v1', project_id: 'default-project', tree_display_mode: 'compact', show_relation_legend: false, created_at: now, updated_at: now }] });
    const parsed = parseJsonBackup(json);
    expect(parsed.schema_version).toBe('1.3');
    expect(parsed.view_settings[0].tree_display_mode).toBe('compact');
  });
});
