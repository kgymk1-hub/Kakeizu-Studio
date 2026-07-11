import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { BackupData } from '../services/backupService';
import { createJsonBackup, parseJsonBackup } from '../services/backupService';

const fixtureDir = resolve(process.cwd(), 'samples/compatibility');
const fixtureCases = [
  { schema: '1.0', file: 'backup_schema_1_0.json', personId: 'compat-v10-person', personName: '互換確認 一〇' },
  { schema: '1.1', file: 'backup_schema_1_1.json', personId: 'compat-v11-person', personName: '互換確認 一一' },
  { schema: '1.2', file: 'backup_schema_1_2.json', personId: 'compat-v12-person', personName: '互換確認 一二' },
  { schema: '1.3', file: 'backup_schema_1_3.json', personId: 'compat-v13-person', personName: '互換確認 一三' },
  { schema: '1.4', file: 'backup_schema_1_4.json', personId: 'compat-v14-person', personName: '互換確認 一四' },
] as const;

function fixtureJson(file: string) {
  return readFileSync(resolve(fixtureDir, file), 'utf8');
}
function loadFixture(file: string) {
  return parseJsonBackup(fixtureJson(file));
}
function expectDefaultSettings(data: BackupData) {
  expect(data.projects[0]).toMatchObject({ id: 'default-project', name: '既定プロジェクト' });
  expect(data.view_settings[0]).toMatchObject({ id: 'default-view-setting', project_id: 'default-project', tree_display_mode: 'standard', show_relation_legend: true });
  expect(data.export_settings[0]).toMatchObject({ id: 'default-export-setting', project_id: 'default-project', show_title: true, title: '家系図', show_legend: true, background: 'white' });
  expect(data.privacy_settings[0]).toMatchObject({ id: 'default-privacy-setting', project_id: 'default-project', public_output_mode: false, hide_living_persons: false, hide_private_persons: true, hide_hidden_persons: true, hide_honseki: true, mask_living_dates: true });
}
function expectV13LikeSettings(data: BackupData, suffix: '13' | '14') {
  expect(data.projects[0]).toMatchObject({ id: `compat-project-v${suffix}`, name: `互換プロジェクト1.${suffix[1]}` });
  expect(data.view_settings[0]).toMatchObject({ project_id: `compat-project-v${suffix}`, tree_display_mode: 'compact', show_relation_legend: false });
  expect(data.export_settings[0]).toMatchObject({ project_id: `compat-project-v${suffix}`, show_title: false, title: `互換確認1.${suffix[1]}`, show_legend: false, background: 'transparent' });
  expect(data.privacy_settings[0]).toMatchObject({ project_id: `compat-project-v${suffix}`, public_output_mode: true, hide_living_persons: true, hide_private_persons: false, hide_hidden_persons: false, hide_honseki: false, mask_living_dates: false });
}

describe('backup compatibility fixtures', () => {
  it.each(fixtureCases)('$fileをJSONとして読み込み、parseJsonBackupで復元できる', ({ schema, file, personName }) => {
    const raw = fixtureJson(file);
    const json = JSON.parse(raw);
    const parsed = parseJsonBackup(raw);
    expect(json.schema_version).toBe(schema);
    expect(parsed.schema_version).toBe(schema);
    expect(parsed.persons).toHaveLength(1);
    expect(parsed.persons[0].display_name).toBe(personName);
  });

  it('schema 1.0の不足配列とdefault settingsを補完する', () => {
    const data = loadFixture('backup_schema_1_0.json');
    expect(data.sources).toEqual([]);
    expect(data.citations).toEqual([]);
    expect(data.events).toEqual([]);
    expect(data.names).toEqual([]);
    expect(data.places).toEqual([]);
    expectDefaultSettings(data);
  });

  it('schema 1.1のSource / Citationを維持し、不足データを補完する', () => {
    const data = loadFixture('backup_schema_1_1.json');
    expect(data.sources).toHaveLength(1);
    expect(data.sources[0]).toMatchObject({ id: 'compat-v11-source', title: '互換確認資料1.1' });
    expect(data.citations).toHaveLength(1);
    expect(data.citations[0]).toMatchObject({ source_id: 'compat-v11-source', target_type: 'person', target_id: 'compat-v11-person' });
    expect(data.events).toEqual([]);
    expect(data.names).toEqual([]);
    expect(data.places).toEqual([]);
    expectDefaultSettings(data);
  });

  it('schema 1.2のEventとEvent Citationを維持し、不足データを補完する', () => {
    const data = loadFixture('backup_schema_1_2.json');
    expect(data.events).toHaveLength(1);
    expect(data.events[0]).toMatchObject({ id: 'compat-v12-event', target_type: 'person', target_id: 'compat-v12-person', review_status: 'reviewed', confidence: 'confirmed' });
    expect(data.citations.some((item) => item.target_type === 'event' && item.target_id === 'compat-v12-event')).toBe(true);
    expect(data.names).toEqual([]);
    expect(data.places).toEqual([]);
    expectDefaultSettings(data);
  });

  it('schema 1.3のProject / settingsを明示値のまま維持する', () => {
    const data = loadFixture('backup_schema_1_3.json');
    expectV13LikeSettings(data, '13');
    expect(data.projects[0].id).not.toBe('default-project');
    expect(data.view_settings[0].id).not.toBe('default-view-setting');
    expect(data.export_settings[0].id).not.toBe('default-export-setting');
    expect(data.privacy_settings[0].id).not.toBe('default-privacy-setting');
    expect(data.names).toEqual([]);
    expect(data.places).toEqual([]);
  });

  it('schema 1.4のName / Place、place_id、Citation、Project / settingsを維持する', () => {
    const data = loadFixture('backup_schema_1_4.json');
    expect(data.names).toHaveLength(1);
    expect(data.names[0]).toMatchObject({ id: 'compat-v14-name', person_id: 'compat-v14-person', name_type: 'alias', name_text: '互換確認 一四別名' });
    expect(data.places).toHaveLength(1);
    expect(data.places[0]).toMatchObject({ id: 'compat-v14-place', prefecture: '新潟県', municipality: '架空市' });
    expect(data.events[0].place_id).toBe('compat-v14-place');
    expect(data.sources[0].place_id).toBe('compat-v14-place');
    expect(data.citations.some((item) => item.target_type === 'name' && item.target_id === 'compat-v14-name')).toBe(true);
    expect(data.citations.some((item) => item.target_type === 'place' && item.target_id === 'compat-v14-place')).toBe(true);
    expectV13LikeSettings(data, '14');
    const ids = {
      persons: new Set(data.persons.map((item) => item.id)),
      sources: new Set(data.sources.map((item) => item.id)),
      events: new Set(data.events.map((item) => item.id)),
      names: new Set(data.names.map((item) => item.id)),
      places: new Set(data.places.map((item) => item.id)),
    };
    expect(ids.places.has(data.events[0].place_id ?? '')).toBe(true);
    expect(ids.places.has(data.sources[0].place_id ?? '')).toBe(true);
    for (const citation of data.citations) {
      if (citation.target_type === 'person') expect(ids.persons.has(citation.target_id)).toBe(true);
      if (citation.target_type === 'event') expect(ids.events.has(citation.target_id)).toBe(true);
      if (citation.target_type === 'name') expect(ids.names.has(citation.target_id)).toBe(true);
      if (citation.target_type === 'place') expect(ids.places.has(citation.target_id)).toBe(true);
      expect(ids.sources.has(citation.source_id)).toBe(true);
    }
  });

  it.each(fixtureCases)('$fileを復元後に1.4形式で再出力し、主要データを維持する', ({ file, personId }) => {
    const restored = loadFixture(file);
    const exported = parseJsonBackup(createJsonBackup(restored));
    expect(exported.schema_version).toBe('1.4');
    expect(exported.persons[0].id).toBe(personId);
    expect(exported.sources).toEqual(restored.sources);
    expect(exported.citations).toEqual(restored.citations);
    expect(exported.events).toEqual(restored.events);
    expect(exported.projects).toEqual(restored.projects);
    expect(exported.view_settings).toEqual(restored.view_settings);
    expect(exported.export_settings).toEqual(restored.export_settings);
    expect(exported.privacy_settings).toEqual(restored.privacy_settings);
    expect(exported.names).toEqual(restored.names);
    expect(exported.places).toEqual(restored.places);
    expect(exported.projects).toHaveLength(1);
    expect(exported.view_settings).toHaveLength(1);
    expect(exported.export_settings).toHaveLength(1);
    expect(exported.privacy_settings).toHaveLength(1);
  });

  it.each(['0.9', '1.5', undefined] as const)('unsupported schema_version %sを拒否する', (schemaVersion) => {
    const data = schemaVersion === undefined ? { persons: [] } : { schema_version: schemaVersion, persons: [] };
    expect(() => parseJsonBackup(JSON.stringify(data))).toThrow('Unsupported schema_version');
  });

  it('JSON構文不正を例外にする', () => {
    expect(() => parseJsonBackup('{"schema_version":"1.4",')).toThrow();
  });
});
