import { db } from '../dexieDb';
import type { Citation, CitationTargetType, Source } from '../../models';

export async function listSources() {
  return db.sources.orderBy('created_at').toArray();
}

export async function getSourceById(id: string) {
  return db.sources.get(id);
}

export async function addSource(source: Source) {
  await db.sources.add(source);
}

export async function updateSource(source: Source) {
  await db.sources.put(source);
}

export async function deleteSource(id: string) {
  await db.transaction('rw', db.sources, db.citations, async () => {
    await db.sources.delete(id);
    await db.citations.where('source_id').equals(id).delete();
  });
}

export async function listCitations() {
  return db.citations.orderBy('created_at').toArray();
}

export async function listCitationsForTarget(targetType: CitationTargetType, targetId: string) {
  return db.citations.where('[target_type+target_id]').equals([targetType, targetId]).toArray();
}

export async function addCitation(citation: Citation) {
  await db.citations.add(citation);
}

export async function updateCitation(citation: Citation) {
  await db.citations.put(citation);
}

export async function addOrUpdateCitations(citations: Citation[]) {
  await db.citations.bulkPut(citations);
}

export async function deleteCitation(id: string) {
  await db.citations.delete(id);
}

export async function deleteCitationsForSource(sourceId: string) {
  await db.citations.where('source_id').equals(sourceId).delete();
}
