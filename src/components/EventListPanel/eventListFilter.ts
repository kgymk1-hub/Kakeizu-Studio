import type { Event, EventType, ParentChildRelation, Person, Union } from '../../models';

export interface EventListData {
  persons: Pick<Person, 'id' | 'display_name' | 'family_name' | 'given_name'>[];
  unions: Pick<Union, 'id' | 'partner1_id' | 'partner2_id'>[];
  relations: Pick<ParentChildRelation, 'id' | 'parent_id' | 'child_id'>[];
}

export interface EventListFilters {
  query?: string;
  event_type?: 'all' | EventType;
}

export interface EventTargetSummary {
  label: string;
  searchText: string;
  broken: boolean;
}

const personName = (person: Pick<Person, 'display_name' | 'family_name' | 'given_name'> | undefined) => {
  if (!person) return undefined;
  return person.display_name || [person.family_name, person.given_name].filter(Boolean).join(' ') || '名称未入力';
};

const personSearchText = (person: Pick<Person, 'display_name' | 'family_name' | 'given_name'> | undefined) => person ? [person.display_name, person.family_name, person.given_name].filter(Boolean).join(' ') : '';

export function resolveEventTargetSummary(event: Pick<Event, 'target_type' | 'target_id'>, data: EventListData): EventTargetSummary {
  if (event.target_type === 'person') {
    const person = data.persons.find((item) => item.id === event.target_id);
    return person ? { label: personName(person) ?? '名称未入力', searchText: personSearchText(person), broken: false } : { label: '参照切れ（人物）', searchText: '', broken: true };
  }

  if (event.target_type === 'union') {
    const union = data.unions.find((item) => item.id === event.target_id);
    if (!union) return { label: '参照切れ（Union）', searchText: '', broken: true };
    const partner1 = data.persons.find((item) => item.id === union.partner1_id);
    const partner2 = data.persons.find((item) => item.id === union.partner2_id);
    const names = [personName(partner1) ?? '参照切れ', union.partner2_id ? personName(partner2) ?? '参照切れ' : '配偶者未入力'];
    return { label: names.join(' × '), searchText: [personSearchText(partner1), personSearchText(partner2)].join(' '), broken: !partner1 || (!!union.partner2_id && !partner2) };
  }

  if (event.target_type === 'relation') {
    const relation = data.relations.find((item) => item.id === event.target_id);
    if (!relation) return { label: '参照切れ（親子関係）', searchText: '', broken: true };
    const parent = data.persons.find((item) => item.id === relation.parent_id);
    const child = data.persons.find((item) => item.id === relation.child_id);
    return { label: `${personName(parent) ?? '参照切れ'} → ${personName(child) ?? '参照切れ'}`, searchText: [personSearchText(parent), personSearchText(child)].join(' '), broken: !parent || !child };
  }

  return { label: '対象不明', searchText: '', broken: true };
}

export function filterEvents(events: Event[], data: EventListData, filters: EventListFilters = {}): Event[] {
  const query = (filters.query ?? '').trim().toLocaleLowerCase();
  return events.filter((event) => {
    if (filters.event_type && filters.event_type !== 'all' && event.event_type !== filters.event_type) return false;
    if (!query) return true;
    const target = resolveEventTargetSummary(event, data);
    const haystack = [event.event_type, event.date_text, event.description, event.note, target.searchText, target.label].filter(Boolean).join(' ').toLocaleLowerCase();
    return haystack.includes(query);
  });
}

export const eventTypeOptions: ('all' | EventType)[] = ['all', 'birth', 'death', 'marriage', 'divorce', 'adoption', 'recognition', 'entry_registry', 'removal_registry', 'transfer_registry', 'name_change', 'residence', 'occupation', 'title', 'other'];
