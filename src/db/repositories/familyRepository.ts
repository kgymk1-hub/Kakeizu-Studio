import { db } from '../dexieDb';
import type { Citation, ImportBatch, ParentChildRelation, Person, Source, Union } from '../../models';

export async function saveFamilyData(data: {persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatch: ImportBatch}) {
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.importBatches, db.sources, db.citations], async () => {
    await db.persons.clear();
    await db.unions.clear();
    await db.parentChildRelations.clear();
    await db.importBatches.clear();
    await db.sources.clear();
    await db.citations.clear();
    await db.importBatches.put(data.importBatch);
    await db.persons.bulkPut(data.persons);
    await db.unions.bulkPut(data.unions);
    await db.parentChildRelations.bulkPut(data.parentChildRelations);
  });
}

export async function saveBackupData(data: {persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatches: ImportBatch[]; sources?: Source[]; citations?: Citation[]}) {
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.importBatches, db.sources, db.citations], async () => {
    await db.persons.clear();
    await db.unions.clear();
    await db.parentChildRelations.clear();
    await db.importBatches.clear();
    await db.sources.clear();
    await db.citations.clear();
    await db.persons.bulkPut(data.persons);
    await db.unions.bulkPut(data.unions);
    await db.parentChildRelations.bulkPut(data.parentChildRelations);
    await db.importBatches.bulkPut(data.importBatches);
    await db.sources.bulkPut(data.sources ?? []);
    await db.citations.bulkPut(data.citations ?? []);
  });
}

export async function loadFamilyData() {
  const [persons, unions, parentChildRelations, importBatches, sources, citations] = await Promise.all([
    db.persons.toArray(),
    db.unions.toArray(),
    db.parentChildRelations.toArray(),
    db.importBatches.toArray(),
    db.sources.toArray(),
    db.citations.toArray(),
  ]);
  return { persons, unions, parentChildRelations, importBatches, sources, citations };
}

export async function updatePerson(person: Person) {
  await db.persons.put(person);
}

export async function saveKosekiEntryData(data: {persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; citations: Citation[]}) {
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.citations], async () => {
    await db.persons.bulkPut(data.persons);
    await db.unions.bulkPut(data.unions);
    await db.parentChildRelations.bulkPut(data.parentChildRelations);
    await db.citations.bulkPut(data.citations);
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
  await db.transaction('rw', [db.persons, db.unions, db.parentChildRelations, db.importBatches, db.sources, db.citations], async () => {
    await db.persons.clear();
    await db.unions.clear();
    await db.parentChildRelations.clear();
    await db.importBatches.clear();
    await db.sources.clear();
    await db.citations.clear();
  });
}
