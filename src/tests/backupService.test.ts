import { describe, expect, it } from 'vitest';
import type { Citation, Source } from '../models';
import { createJsonBackup, parseJsonBackup } from '../services/backupService';

const now = '2026-07-05T00:00:00.000Z';
const source: Source = { id: 's1', source_type: 'book', title: '本', created_at: now, updated_at: now };
const citation: Citation = { id: 'c1', source_id: 's1', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now };

describe('backupService Source/Citation', () => {
  it('JSONバックアップにsources/citationsが含まれる', () => {
    const parsed = JSON.parse(createJsonBackup({ persons: [], unions: [], parent_child_relations: [], import_batches: [], sources: [source], citations: [citation] }));
    expect(parsed.schema_version).toBe('1.4');
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
    expect(parsed.schema_version).toBe('1.4');
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
    expect(parsed.schema_version).toBe('1.4');
    expect(parsed.view_settings[0].tree_display_mode).toBe('compact');
  });
});

describe('backupService v1.4 Name / Place compatibility', () => {
  it('schema_version 1.4 JSONを作成・復元でき、names / placesを含む', () => {
    const name = { id:'n1', person_id:'p1', name_type:'alias' as const, name_text:'旧姓 山田花子', created_at:now, updated_at:now };
    const place = { id:'pl1', place_type:'event' as const, name:'新潟県新潟市', created_at:now, updated_at:now };
    const event = { id:'e-place', event_type:'birth' as const, target_type:'person' as const, target_id:'p1', place_text:'新潟', place_id:'pl1', created_at:now, updated_at:now };
    const sourceWithPlace = { ...source, id:'s-place', place_id:'missing-place' };
    const parsed = parseJsonBackup(createJsonBackup({ persons:[{ id:'p1', display_name:'花子', created_at:now, updated_at:now }], unions:[], parent_child_relations:[], import_batches:[], sources:[sourceWithPlace], citations:[{ ...citation, id:'c-name', target_type:'name', target_id:'n1' }, { ...citation, id:'c-place', target_type:'place', target_id:'pl1' }], events:[event], names:[name], places:[place] }));
    expect(parsed.schema_version).toBe('1.4');
    expect(parsed.names).toEqual([name]);
    expect(parsed.places).toEqual([place]);
    expect(parsed.events[0].place_id).toBe('pl1');
    expect(parsed.sources[0].place_id).toBe('missing-place');
  });

  it('schema 1.0〜1.3の復元結果を再出力するとschema 1.4になる', () => {
    const oldExportedAt = '2020-01-01T00:00:00.000Z';

    for (const schemaVersion of ['1.0', '1.1', '1.2', '1.3'] as const) {
      const restored = parseJsonBackup(JSON.stringify({
        schema_version: schemaVersion,
        exported_at: oldExportedAt,
        persons: [{
          id: `person-${schemaVersion}`,
          display_name: `互換確認 ${schemaVersion}`,
          created_at: oldExportedAt,
          updated_at: oldExportedAt,
        }],
        unions: [],
        parent_child_relations: [],
        import_batches: [],
      }));

      expect(restored.schema_version).toBe(schemaVersion);

      const exportedJson = createJsonBackup(restored);
      const exportedData = JSON.parse(exportedJson);

      expect(exportedData.schema_version).toBe('1.4');
      expect(exportedData.exported_at).not.toBe(oldExportedAt);
      expect(exportedData.exported_at).not.toBe('');
      expect(Number.isNaN(Date.parse(exportedData.exported_at))).toBe(false);

      const reparsed = parseJsonBackup(exportedJson);

      expect(reparsed.schema_version).toBe('1.4');
      expect(reparsed.persons[0].id).toBe(`person-${schemaVersion}`);
      expect(reparsed.persons[0].display_name).toBe(`互換確認 ${schemaVersion}`);
    }
  });

  it('1.3以前やnames / placesがないJSONでも空配列補完して復元できる', () => {
    for (const schema_version of ['1.0', '1.1', '1.2', '1.3'] as const) {
      const parsed = parseJsonBackup(JSON.stringify({ schema_version, exported_at: now, persons: [], unions: [], parent_child_relations: [], import_batches: [] }));
      expect(parsed.names).toEqual([]);
      expect(parsed.places).toEqual([]);
      expect(parsed.projects[0].id).toBe('default-project');
    }
  });
});
