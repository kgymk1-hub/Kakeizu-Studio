import { db } from '../dexieDb';
import type { Citation, Event, ExportSetting, ImportBatch, Name, ParentChildRelation, Person, Place, PrivacySetting, Project, Source, Union, ViewSetting } from '../../models';

export async function saveFamilyData(data: {persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatch: ImportBatch}) {
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.importBatches, db.sources, db.citations, db.events, db.names, db.places], async () => {
    await db.persons.clear();
    await db.unions.clear();
    await db.parentChildRelations.clear();
    await db.importBatches.clear();
    await db.sources.clear();
    await db.citations.clear();
    await db.events.clear();
    await db.names?.clear();
    await db.places?.clear();
    await db.importBatches.put(data.importBatch);
    await db.persons.bulkPut(data.persons);
    await db.unions.bulkPut(data.unions);
    await db.parentChildRelations.bulkPut(data.parentChildRelations);
  });
}

export async function saveBackupData(data: {persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatches: ImportBatch[]; sources?: Source[]; citations?: Citation[]; events?: Event[]; names?: Name[]; places?: Place[]; project?: Project; viewSetting?: ViewSetting; exportSetting?: ExportSetting; privacySetting?: PrivacySetting}) {
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.importBatches, db.sources, db.citations, db.events, db.names, db.places, db.projects, db.viewSettings, db.exportSettings, db.privacySettings], async () => {
    await db.persons.clear();
    await db.unions.clear();
    await db.parentChildRelations.clear();
    await db.importBatches.clear();
    await db.sources.clear();
    await db.citations.clear();
    await db.events.clear();
    await db.names?.clear();
    await db.places?.clear();
    if (data.project && data.viewSetting && data.exportSetting && data.privacySetting) {
      await db.projects.clear();
      await db.viewSettings.clear();
      await db.exportSettings.clear();
      await db.privacySettings.clear();
      await db.projects.put(data.project);
      await db.viewSettings.put(data.viewSetting);
      await db.exportSettings.put(data.exportSetting);
      await db.privacySettings.put(data.privacySetting);
    }
    await db.persons.bulkPut(data.persons);
    await db.unions.bulkPut(data.unions);
    await db.parentChildRelations.bulkPut(data.parentChildRelations);
    await db.importBatches.bulkPut(data.importBatches);
    await db.sources.bulkPut(data.sources ?? []);
    await db.citations.bulkPut(data.citations ?? []);
    await db.events.bulkPut(data.events ?? []);
    await db.names?.bulkPut(data.names ?? []);
    await db.places?.bulkPut(data.places ?? []);
  });
}

export async function loadFamilyData() {
  const [persons, unions, parentChildRelations, importBatches, sources, citations, events, names, places] = await Promise.all([
    db.persons.toArray(),
    db.unions.toArray(),
    db.parentChildRelations.toArray(),
    db.importBatches.toArray(),
    db.sources.toArray(),
    db.citations.toArray(),
    db.events.toArray(),
    (db.names ? db.names.toArray() : Promise.resolve([])),
    (db.places ? db.places.toArray() : Promise.resolve([])),
  ]);
  return { persons, unions, parentChildRelations, importBatches, sources, citations, events, names, places };
}

export async function updatePerson(person: Person) {
  await db.persons.put(person);
}


export async function updateParentChildRelation(relationId: string, patch: Partial<Omit<ParentChildRelation, 'id' | 'parent_id' | 'child_id' | 'created_at'>>) {
  const existing = await db.parentChildRelations.get(relationId);
  if (!existing) return undefined;
  const next: ParentChildRelation = { ...existing, ...patch, id: existing.id, parent_id: existing.parent_id, child_id: existing.child_id, created_at: existing.created_at, updated_at: new Date().toISOString() };
  await db.parentChildRelations.put(next);
  return next;
}

export async function updateUnion(unionId: string, patch: Partial<Omit<Union, 'id' | 'partner1_id' | 'partner2_id' | 'created_at'>>) {
  const existing = await db.unions.get(unionId);
  if (!existing) return undefined;
  const next: Union = { ...existing, ...patch, id: existing.id, partner1_id: existing.partner1_id, partner2_id: existing.partner2_id, created_at: existing.created_at, updated_at: new Date().toISOString() };
  await db.unions.put(next);
  return next;
}

export async function saveKosekiEntryData(data: {persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; citations: Citation[]; events?: Event[]; names?: Name[]; places?: Place[]}) {
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.citations, db.events, db.names, db.places], async () => {
    await db.persons.bulkPut(data.persons);
    await db.unions.bulkPut(data.unions);
    await db.parentChildRelations.bulkPut(data.parentChildRelations);
    await db.citations.bulkPut(data.citations);
    await db.events.bulkPut(data.events ?? []);
    await db.names?.bulkPut(data.names ?? []);
    await db.places?.bulkPut(data.places ?? []);
  });
}

export async function addOrUpdatePersons(persons: Person[]) {
  await db.persons.bulkPut(persons);
}

export async function addOrUpdateParentChildRelations(relations: ParentChildRelation[]) {
  await db.parentChildRelations.bulkPut(relations);
}

export async function addOrUpdateUnions(unions: Union[]) {
  await db.unions.bulkPut(unions);
}

export async function clearFamilyData() {
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.importBatches, db.sources, db.citations, db.events, db.names, db.places], async () => {
    await db.persons.clear();
    await db.unions.clear();
    await db.parentChildRelations.clear();
    await db.importBatches.clear();
    await db.sources.clear();
    await db.citations.clear();
    await db.events.clear();
    await db.names?.clear();
    await db.places?.clear();
  });
}


export async function deleteParentChildRelationWithCitations(relationId: string) {
  await db.transaction('rw', [db.parentChildRelations, db.citations], async () => {
    await db.parentChildRelations.delete(relationId);
    await db.citations.where('[target_type+target_id]').equals(['relation', relationId]).delete();
  });
}

export async function deleteUnionWithCitations(unionId: string) {
  await db.transaction('rw', [db.unions, db.citations], async () => {
    await db.unions.delete(unionId);
    await db.citations.where('[target_type+target_id]').equals(['union', unionId]).delete();
  });
}
