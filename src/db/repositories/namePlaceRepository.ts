import { db } from '../dexieDb';
import type { Name, Place } from '../../models';

export async function addOrUpdateName(name: Name) { await db.names.put(name); }
export async function deleteName(id: string) { await db.names.delete(id); }
export async function addOrUpdatePlace(place: Place) { await db.places.put(place); }
export async function deletePlace(id: string) { await db.places.delete(id); }
