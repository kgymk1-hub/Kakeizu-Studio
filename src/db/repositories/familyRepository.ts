import { db } from '../dexieDb';
import type { Citation, Event, ImportBatch, ParentChildRelation, Person, Source, Union } from '../../models';

export async function saveFamilyData(data: {persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatch: ImportBatch}) {
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.importBatches, db.sources, db.citations, db.events], async () => {
    await db.persons.clear();
    await db.unions.clear();
    await db.parentChildRelations.clear();
    await db.importBatches.clear();
    await db.sources.clear();
    await db.citations.clear();
    await db.events.clear();
    await db.importBatches.put(data.importBatch);
    await db.persons.bulkPut(data.persons);
    await db.unions.bulkPut(data.unions);
    await db.parentChildRelations.bulkPut(data.parentChildRelations);
  });
}

export async function saveBackupData(data: {persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatches: ImportBatch[]; sources?: Source[]; citations?: Citation[]; events?: Event[]}) {
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.importBatches, db.sources, db.citations, db.events], async () => {
    await db.persons.clear();
    await db.unions.clear();
    await db.parentChildRelations.clear();
    await db.importBatches.clear();
    await db.sources.clear();
    await db.citations.clear();
    await db.events.clear();
    await db.persons.bulkPut(data.persons);
    await db.unions.bulkPut(data.unions);
    await db.parentChildRelations.bulkPut(data.parentChildRelations);
    await db.importBatches.bulkPut(data.importBatches);
    await db.sources.bulkPut(data.sources ?? []);
    await db.citations.bulkPut(data.citations ?? []);
    await db.events.bulkPut(data.events ?? []);
  });
}

export async function loadFamilyData() {
  const [persons, unions, parentChildRelations, importBatches, sources, citations, events] = await Promise.all([
    db.persons.toArray(),
    db.unions.toArray(),
    db.parentChildRelations.toArray(),
    db.importBatches.toArray(),
    db.sources.toArray(),
    db.citations.toArray(),
    db.events.toArray(),
  ]);
  return { persons, unions, parentChildRelations, importBatches, sources, citations, events };
}

export async function updatePerson(person: Person) {
  await db.persons.put(person);
}

export async function saveKosekiEntryData(data: {persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; citations: Citation[]; events?: Event[]}) {
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.citations, db.events], async () => {
    await db.persons.bulkPut(data.persons);
    await db.unions.bulkPut(data.unions);
    await db.parentChildRelations.bulkPut(data.parentChildRelations);
    await db.citations.bulkPut(data.citations);
    await db.events.bulkPut(data.events ?? []);
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
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.importBatches, db.sources, db.citations, db.events], async () => {
    await db.persons.clear();
    await db.unions.clear();
    await db.parentChildRelations.clear();
    await db.importBatches.clear();
    await db.sources.clear();
    await db.citations.clear();
    await db.events.clear();
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
