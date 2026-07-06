import { db } from '../dexieDb';
import type { Event, EventTargetType } from '../../models';

export async function listEvents() {
  return db.events.orderBy('created_at').toArray();
}

export async function listEventsForTarget(targetType: EventTargetType, targetId: string) {
  return db.events.where('[target_type+target_id]').equals([targetType, targetId]).toArray();
}

export async function addEvent(event: Event) {
  await db.events.add(event);
}

export async function updateEvent(event: Event) {
  await db.events.put(event);
}

export async function addOrUpdateEvents(events: Event[]) {
  await db.events.bulkPut(events);
}

export async function deleteEvent(id: string) {
  await db.transaction('rw', db.events, db.citations, async () => {
    await db.events.delete(id);
    await db.citations.where('[target_type+target_id]').equals(['event', id]).delete();
  });
}

export async function deleteEventsForTarget(targetType: EventTargetType, targetId: string) {
  const events = await listEventsForTarget(targetType, targetId);
  await db.transaction('rw', db.events, db.citations, async () => {
    for (const event of events) {
      await db.events.delete(event.id);
      await db.citations.where('[target_type+target_id]').equals(['event', event.id]).delete();
    }
  });
}
