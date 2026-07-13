import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { BackupData } from '../services/backupService';
import { createJsonBackup, parseJsonBackup } from '../services/backupService';
import { buildFamilyLayout } from '../services/layoutService';
import { validateFamilyData } from '../services/validationService';

const samplePath = resolve(process.cwd(), 'samples/kakeizu_studio_v1_sample.json');
const sampleJson = () => readFileSync(samplePath, 'utf8');
const loadSample = () => parseJsonBackup(sampleJson());

const expectedCounts = {
  persons: 7,
  unions: 3,
  parent_child_relations: 6,
  events: 7,
  sources: 4,
  citations: 27,
  import_batches: 1,
  projects: 1,
  view_settings: 1,
  export_settings: 1,
  privacy_settings: 1,
  names: 2,
  places: 4,
} as const;

const entityCollections = [
  'persons',
  'unions',
  'parent_child_relations',
  'events',
  'sources',
  'citations',
  'import_batches',
  'projects',
  'view_settings',
  'export_settings',
  'privacy_settings',
  'names',
  'places',
] as const;

type CollectionName = (typeof entityCollections)[number];

function expectCounts(data: BackupData) {
  for (const key of Object.keys(expectedCounts) as CollectionName[]) {
    expect(data[key]).toHaveLength(expectedCounts[key]);
  }
}

function idsOf(items: Array<{ id: string }>) {
  return items.map((item) => item.id).sort();
}

describe('Kakeizu Studio v1 sample JSON', () => {
  it('JSONとして復元できる', () => {
    expect(() => loadSample()).not.toThrow();
    expect(loadSample().schema_version).toBe('1.4');
  });

  it('件数が固定値と一致する', () => {
    expectCounts(loadSample());
  });

  it('各配列内でIDが重複しない', () => {
    const data = loadSample();
    for (const key of entityCollections) {
      const ids = data[key].map((item) => item.id);
      expect(new Set(ids).size, key).toBe(ids.length);
    }
  });

  it('全参照が有効', () => {
    const data = loadSample();
    const personIds = new Set(data.persons.map((item) => item.id));
    const unionIds = new Set(data.unions.map((item) => item.id));
    const relationIds = new Set(data.parent_child_relations.map((item) => item.id));
    const eventIds = new Set(data.events.map((item) => item.id));
    const sourceIds = new Set(data.sources.map((item) => item.id));
    const nameIds = new Set(data.names.map((item) => item.id));
    const placeIds = new Set(data.places.map((item) => item.id));
    const projectIds = new Set(data.projects.map((item) => item.id));

    for (const union of data.unions) {
      expect(personIds.has(union.partner1_id), union.id).toBe(true);
      if (union.partner2_id) expect(personIds.has(union.partner2_id), union.id).toBe(true);
    }
    for (const relation of data.parent_child_relations) {
      expect(personIds.has(relation.parent_id), relation.id).toBe(true);
      expect(personIds.has(relation.child_id), relation.id).toBe(true);
      if (relation.union_id) expect(unionIds.has(relation.union_id), relation.id).toBe(true);
    }
    for (const event of data.events) {
      if (event.target_type === 'person') expect(personIds.has(event.target_id), event.id).toBe(true);
      if (event.target_type === 'union') expect(unionIds.has(event.target_id), event.id).toBe(true);
      if (event.target_type === 'relation') expect(relationIds.has(event.target_id), event.id).toBe(true);
      if (event.place_id) expect(placeIds.has(event.place_id), event.id).toBe(true);
    }
    for (const source of data.sources) {
      if (source.place_id) expect(placeIds.has(source.place_id), source.id).toBe(true);
    }
    for (const citation of data.citations) {
      expect(sourceIds.has(citation.source_id), citation.id).toBe(true);
      if (citation.target_type === 'person') expect(personIds.has(citation.target_id), citation.id).toBe(true);
      if (citation.target_type === 'union') expect(unionIds.has(citation.target_id), citation.id).toBe(true);
      if (citation.target_type === 'relation') expect(relationIds.has(citation.target_id), citation.id).toBe(true);
      if (citation.target_type === 'event') expect(eventIds.has(citation.target_id), citation.id).toBe(true);
      if (citation.target_type === 'name') expect(nameIds.has(citation.target_id), citation.id).toBe(true);
      if (citation.target_type === 'place') expect(placeIds.has(citation.target_id), citation.id).toBe(true);
    }
    for (const name of data.names) {
      expect(personIds.has(name.person_id), name.id).toBe(true);
    }
    for (const setting of [...data.view_settings, ...data.export_settings, ...data.privacy_settings]) {
      expect(projectIds.has(setting.project_id), setting.id).toBe(true);
    }
  });

  it('Validation結果が期待値と一致する', () => {
    const data = loadSample();
    const issues = validateFamilyData({
      persons: data.persons,
      unions: data.unions,
      parentChildRelations: data.parent_child_relations,
      events: data.events,
      sources: data.sources,
      citations: data.citations,
      names: data.names,
      places: data.places,
    });
    expect(issues.filter((issue) => issue.severity === 'error')).toHaveLength(0);
    expect(issues.filter((issue) => issue.severity === 'warning')).toHaveLength(2);
    expect(issues.filter((issue) => issue.category === 'low_confidence')).toHaveLength(1);
    expect(issues.filter((issue) => issue.category === 'unreviewed')).toHaveLength(1);
    for (const category of ['missing_citation', 'broken_reference', 'self_reference', 'date_inconsistency', 'age_warning']) {
      expect(issues.filter((issue) => issue.category === category), category).toHaveLength(0);
    }
  });

  it('JSON往復で主要データを維持する', () => {
    const data = loadSample();
    const roundTripped = parseJsonBackup(createJsonBackup({
      persons: data.persons,
      unions: data.unions,
      parent_child_relations: data.parent_child_relations,
      import_batches: data.import_batches,
      sources: data.sources,
      citations: data.citations,
      events: data.events,
      projects: data.projects,
      view_settings: data.view_settings,
      export_settings: data.export_settings,
      privacy_settings: data.privacy_settings,
      names: data.names,
      places: data.places,
    }));

    expect(roundTripped.schema_version).toBe('1.4');
    expectCounts(roundTripped);
    for (const key of entityCollections) {
      expect(idsOf(roundTripped[key]), key).toEqual(idsOf(data[key]));
    }
    expect(roundTripped.names).toEqual(data.names);
    expect(roundTripped.places).toEqual(data.places);
    expect(roundTripped.projects).toEqual(data.projects);
    expect(roundTripped.view_settings).toEqual(data.view_settings);
    expect(roundTripped.export_settings).toEqual(data.export_settings);
    expect(roundTripped.privacy_settings).toEqual(data.privacy_settings);
  });



  it('Citation総数27とName/Place Citation各2件、ImportBatch内23件を区別する', () => {
    const data = loadSample();
    expect(data.citations).toHaveLength(27);
    expect(data.citations.filter((citation) => citation.target_type === 'name')).toHaveLength(2);
    expect(data.citations.filter((citation) => citation.target_type === 'place')).toHaveLength(2);
    expect(data.import_batches[0].imported_counts?.citations).toBe(23);
  });

  it('v1サンプルの描画edge数はspouse 6本、union-child 3本でID重複がない', () => {
    const data = loadSample();
    const layout = buildFamilyLayout(data.persons, data.unions, data.parent_child_relations);
    const edgeIds = layout.layoutEdges.map((edge) => edge.id);
    expect(layout.layoutEdges.filter((edge) => edge.type === 'spouse')).toHaveLength(6);
    expect(layout.layoutEdges.filter((edge) => edge.type === 'union-child')).toHaveLength(3);
    expect(layout.layoutEdges).toHaveLength(9);
    expect(new Set(edgeIds).size).toBe(edgeIds.length);
  });

  it('ImportBatchの方式・ファイル・件数が標準CSVセット履歴として整合する', () => {
    const data = loadSample();
    const batch = data.import_batches[0];

    expect(batch.import_type).toBe('csv_standard');
    expect(batch.mode).toBe('standard_csv_set');
    expect(batch.import_policy).toBe('replace_all');
    expect(batch.placeholder_person_policy).toBe('warn_and_skip');
    expect(batch.status).toBe('completed_with_warnings');
    expect(batch.warning_count).toBe(2);
    expect(batch.error_count).toBe(0);
    expect(batch.unresolved_reference_count).toBe(0);
    expect(batch.placeholder_person_candidate_count).toBe(0);

    expect(batch.file_names).toEqual([
      'manifest.json',
      'persons.csv',
      'unions.csv',
      'parent_child_relations.csv',
      'sources.csv',
      'citations.csv',
      'events.csv',
    ]);

    expect(batch.imported_counts).toEqual({
      persons: 7,
      unions: 3,
      relations: 6,
      events: 7,
      sources: 4,
      citations: 23,
    });

    const importedCounts = batch.imported_counts;
    expect(importedCounts).toBeDefined();
    if (!importedCounts) throw new Error('imported_counts is required');

    const importedTotal =
      importedCounts.persons +
      importedCounts.unions +
      importedCounts.relations +
      importedCounts.events +
      importedCounts.sources +
      importedCounts.citations;

    expect(importedTotal).toBe(50);
    expect(batch.total_rows).toBe(importedTotal);
    expect(batch.file_names).not.toContain('names.csv');
    expect(batch.file_names).not.toContain('places.csv');
    expect(batch.file_names).not.toContain('media.csv');
  });
});
