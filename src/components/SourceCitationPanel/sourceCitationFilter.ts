import type { Citation, CitationTargetType, Event, Name, ParentChildRelation, Person, Place, Source, SourceType, Union } from '../../models';

export interface SourceCitationData {
  sources: Pick<Source, 'id' | 'title'>[];
  persons: Pick<Person, 'id' | 'display_name' | 'family_name' | 'given_name'>[];
  events: Pick<Event, 'id' | 'event_type' | 'target_type' | 'target_id' | 'date_text'>[];
  unions: Pick<Union, 'id' | 'partner1_id' | 'partner2_id'>[];
  relations: Pick<ParentChildRelation, 'id' | 'parent_id' | 'child_id'>[];
  names?: Pick<Name, 'id' | 'person_id' | 'name_type' | 'name_text'>[];
  places?: Pick<Place, 'id' | 'name' | 'place_type' | 'normalized_name'>[];
}

export interface SourceFilters { query?: string; source_type?: 'all' | SourceType; }
export interface CitationFilters { query?: string; target_type?: 'all' | CitationTargetType; source_id?: string; }
export interface CitationTargetSummary { label: string; searchText: string; broken: boolean; supported: boolean; }

const personName = (person: Pick<Person, 'display_name' | 'family_name' | 'given_name'> | undefined) => {
  if (!person) return undefined;
  return person.display_name || [person.family_name, person.given_name].filter(Boolean).join(' ') || '名称未入力';
};
const personSearchText = (person: Pick<Person, 'display_name' | 'family_name' | 'given_name'> | undefined) => person ? [person.display_name, person.family_name, person.given_name].filter(Boolean).join(' ') : '';
const lowerIncludes = (values: unknown[], query: string) => values.filter(Boolean).join(' ').toLocaleLowerCase().includes(query);

export function resolveCitationTargetSummary(citation: Pick<Citation, 'target_type' | 'target_id'>, data: SourceCitationData): CitationTargetSummary {
  if (!citation.target_id) return { label: '対象不明', searchText: '', broken: true, supported: false };
  if (citation.target_type === 'person') {
    const person = data.persons.find((item) => item.id === citation.target_id);
    return person ? { label: personName(person) ?? '名称未入力', searchText: personSearchText(person), broken: false, supported: true } : { label: '参照切れ（人物）', searchText: '', broken: true, supported: true };
  }
  if (citation.target_type === 'event') {
    const event = data.events.find((item) => item.id === citation.target_id);
    if (!event) return { label: '参照切れ（Event）', searchText: '', broken: true, supported: true };
    const eventTarget = resolveEventTargetName(event, data);
    const label = [event.event_type, event.date_text || '日付未入力', eventTarget.label].join(' / ');
    return { label, searchText: [event.event_type, event.date_text, eventTarget.searchText, eventTarget.label].filter(Boolean).join(' '), broken: eventTarget.broken, supported: true };
  }
  if (citation.target_type === 'union') {
    const union = data.unions.find((item) => item.id === citation.target_id);
    if (!union) return { label: '参照切れ（Union）', searchText: '', broken: true, supported: true };
    const partner1 = data.persons.find((item) => item.id === union.partner1_id);
    const partner2 = data.persons.find((item) => item.id === union.partner2_id);
    return { label: `${personName(partner1) ?? '参照切れ'} × ${union.partner2_id ? personName(partner2) ?? '参照切れ' : '配偶者未入力'}`, searchText: [personSearchText(partner1), personSearchText(partner2)].join(' '), broken: !partner1 || (!!union.partner2_id && !partner2), supported: true };
  }
  if (citation.target_type === 'relation') {
    const relation = data.relations.find((item) => item.id === citation.target_id);
    if (!relation) return { label: '参照切れ（親子関係）', searchText: '', broken: true, supported: true };
    const parent = data.persons.find((item) => item.id === relation.parent_id);
    const child = data.persons.find((item) => item.id === relation.child_id);
    return { label: `${personName(parent) ?? '参照切れ'} → ${personName(child) ?? '参照切れ'}`, searchText: [personSearchText(parent), personSearchText(child)].join(' '), broken: !parent || !child, supported: true };
  }
  if (citation.target_type === 'name') {
    const name = data.names?.find((item) => item.id === citation.target_id);
    if (!name) return { label: '参照切れ（Name）', searchText: '', broken: true, supported: true };
    const person = data.persons.find((item) => item.id === name.person_id);
    return { label: `名前: ${name.name_type} ${name.name_text}${person ? ` / ${personName(person)}` : ''}`, searchText: [name.name_type, name.name_text, personSearchText(person)].join(' '), broken: !person, supported: true };
  }
  if (citation.target_type === 'place') {
    const place = data.places?.find((item) => item.id === citation.target_id);
    return place ? { label: `場所: ${place.name}`, searchText: [place.name, place.normalized_name, place.place_type].filter(Boolean).join(' '), broken: false, supported: true } : { label: '参照切れ（Place）', searchText: '', broken: true, supported: true };
  }
  return { label: '未対応対象', searchText: '', broken: false, supported: false };
}

function resolveEventTargetName(event: Pick<Event, 'target_type' | 'target_id'>, data: SourceCitationData): CitationTargetSummary {
  return resolveCitationTargetSummary({ target_type: event.target_type, target_id: event.target_id }, data);
}

export function filterSources(sources: Source[], filters: SourceFilters = {}): Source[] {
  const query = (filters.query ?? '').trim().toLocaleLowerCase();
  return sources.filter((source) => {
    if (filters.source_type && filters.source_type !== 'all' && source.source_type !== filters.source_type) return false;
    if (!query) return true;
    return lowerIncludes([source.title, source.source_type, source.author_or_issuer, source.issued_date_text, source.obtained_date, source.repository, source.honseki_text, source.head_of_registry, source.registry_type, source.source_text, source.url, source.note], query);
  });
}

export function filterCitations(citations: Citation[], data: SourceCitationData, filters: CitationFilters = {}): Citation[] {
  const query = (filters.query ?? '').trim().toLocaleLowerCase();
  return citations.filter((citation) => {
    if (filters.target_type && filters.target_type !== 'all' && citation.target_type !== filters.target_type) return false;
    if (filters.source_id && citation.source_id !== filters.source_id) return false;
    if (!query) return true;
    const source = data.sources.find((item) => item.id === citation.source_id);
    const target = resolveCitationTargetSummary(citation, data);
    return lowerIncludes([source?.title, citation.target_type, target.label, target.searchText, citation.page_or_location, citation.quote_text, citation.interpretation, citation.confidence, citation.note], query);
  });
}

export const sourceTypeOptions: ('all' | SourceType)[] = ['all', 'current_koseki', 'joseki', 'kaisei_genkoseki', 'website', 'book', 'interview', 'ai_generated', 'other'];
export const citationTargetTypeOptions: ('all' | CitationTargetType)[] = ['all', 'person', 'event', 'union', 'relation', 'name', 'place'];
