import type { Citation, Confidence, Event, EventType, Gender, ParentChildRelation, Person, Source, SourceType, Union } from '../models';

export const kosekiSourceTypes: SourceType[] = ['current_koseki', 'joseki', 'kaisei_genkoseki', 'other'];

export interface KosekiPersonFormInput {
  mode: 'create' | 'update';
  sourceId?: string;
  personId?: string;
  display_name: string;
  gender?: Gender;
  birth_date_text?: string;
  death_date_text?: string;
  generation_no?: number;
  rank_title?: string;
  note?: string;
  confidence: Confidence;
  page_or_location?: string;
  quote_text?: string;
  interpretation?: string;
  citation_note?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  createBirthEvent?: boolean;
  createDeathEvent?: boolean;
  additionalEventType?: EventType | '';
  additionalEventDateText?: string;
  additionalEventPlaceText?: string;
  additionalEventDescription?: string;
  additionalEventNote?: string;
  additionalEventConfidence?: Confidence | '';
}

export interface KosekiEntryData {
  persons: Person[];
  sources: Source[];
  citations: Citation[];
  parentChildRelations: ParentChildRelation[];
  unions: Union[];
  events?: Event[];
}

export interface KosekiEntryResult extends KosekiEntryData {
  person: Person;
  citation: Citation;
  createdPerson: boolean;
  createdCitation: boolean;
  createdRelationIds: string[];
  createdUnionIds: string[];
  createdEventIds: string[];
}

const nowIso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const clean = (value?: string) => value?.trim() || undefined;
const keepExistingWhenBlank = <T,>(value: T | undefined, existing: T | undefined) => value === undefined ? existing : value;
const cleanKeepExistingWhenBlank = (value: string | undefined, existing: string | undefined) => clean(value) ?? existing;

export function createKosekiSource(input: {
  title: string;
  source_type: SourceType;
  honseki_text?: string;
  head_of_registry?: string;
  issued_date_text?: string;
  obtained_date?: string;
  note?: string;
}): Source {
  const now = nowIso();
  const title = input.title.trim();
  if (!title) throw new Error('資料名を入力してください。');
  if (!kosekiSourceTypes.includes(input.source_type)) throw new Error('戸籍入力モードで使用できない資料種別です。');
  return { id: uuid(), title, source_type: input.source_type, honseki_text: clean(input.honseki_text), head_of_registry: clean(input.head_of_registry), issued_date_text: clean(input.issued_date_text), obtained_date: clean(input.obtained_date), note: clean(input.note), created_at: now, updated_at: now };
}

export function applyKosekiPersonEntry(data: KosekiEntryData, input: KosekiPersonFormInput): KosekiEntryResult {
  if (!input.sourceId || !data.sources.some((s) => s.id === input.sourceId)) throw new Error('戸籍資料を選択してください。');
  const now = nowIso();
  const existing = input.personId ? data.persons.find((p) => p.id === input.personId) : undefined;
  if (input.mode === 'update' && !existing) throw new Error('更新する人物を選択してください。');
  if (input.mode === 'create' && !input.display_name.trim()) throw new Error('氏名を入力してください。');

  const targetId = existing?.id ?? uuid();
  for (const [label, id] of [['父', input.fatherId], ['母', input.motherId], ['配偶者', input.spouseId]] as const) {
    if (!id) continue;
    if (id === targetId) throw new Error(`${label}に自分自身は選択できません。`);
    if (!data.persons.some((p) => p.id === id)) throw new Error(`${label}に存在しない人物が選択されています。`);
  }

  const person: Person = {
    ...(existing ?? { id: targetId, created_at: now }),
    display_name: input.display_name.trim() || existing?.display_name || '',
    gender: input.gender || existing?.gender || undefined,
    birth_date_text: cleanKeepExistingWhenBlank(input.birth_date_text, existing?.birth_date_text),
    death_date_text: cleanKeepExistingWhenBlank(input.death_date_text, existing?.death_date_text),
    generation_no: keepExistingWhenBlank(input.generation_no, existing?.generation_no),
    rank_title: cleanKeepExistingWhenBlank(input.rank_title, existing?.rank_title),
    note: cleanKeepExistingWhenBlank(input.note, existing?.note),
    confidence: input.confidence,
    review_status: existing?.review_status ?? 'reviewed',
    updated_at: now,
  };
  const persons = existing ? data.persons.map((p) => p.id === person.id ? person : p) : [...data.persons, person];

  const dupCitation = data.citations.find((c) => c.source_id === input.sourceId && c.target_type === 'person' && c.target_id === person.id);
  const citation: Citation = { ...(dupCitation ?? { id: uuid(), source_id: input.sourceId, target_type: 'person' as const, target_id: person.id, created_at: now }), confidence: input.confidence, page_or_location: cleanKeepExistingWhenBlank(input.page_or_location, dupCitation?.page_or_location), quote_text: cleanKeepExistingWhenBlank(input.quote_text, dupCitation?.quote_text), interpretation: cleanKeepExistingWhenBlank(input.interpretation, dupCitation?.interpretation), note: cleanKeepExistingWhenBlank(input.citation_note, dupCitation?.note), updated_at: now };
  let citations = dupCitation ? data.citations.map((c) => c.id === citation.id ? citation : c) : [...data.citations, citation];

  const upsertRelationCitation = (targetType: 'relation' | 'union', targetId: string) => {
    const existingCitation = citations.find((c) => c.source_id === input.sourceId && c.target_type === targetType && c.target_id === targetId);
    const nextCitation: Citation = { ...(existingCitation ?? { id: uuid(), source_id: input.sourceId!, target_type: targetType, target_id: targetId, created_at: now }), confidence: input.confidence, page_or_location: cleanKeepExistingWhenBlank(input.page_or_location, existingCitation?.page_or_location), quote_text: cleanKeepExistingWhenBlank(input.quote_text, existingCitation?.quote_text), interpretation: cleanKeepExistingWhenBlank(input.interpretation, existingCitation?.interpretation), note: cleanKeepExistingWhenBlank(input.citation_note, existingCitation?.note), updated_at: now };
    citations = existingCitation ? citations.map((c) => c.id === nextCitation.id ? nextCitation : c) : [...citations, nextCitation];
  };

  const createdRelationIds: string[] = [];
  let parentChildRelations = [...data.parentChildRelations];
  for (const parentId of [input.fatherId, input.motherId].filter(Boolean) as string[]) {
    let rel = parentChildRelations.find((r) => r.parent_id === parentId && r.child_id === person.id);
    if (!rel) {
      rel = { id: uuid(), parent_id: parentId, child_id: person.id, relation_type: 'biological', confidence: input.confidence, review_status: 'reviewed', created_at: now, updated_at: now };
      parentChildRelations = [...parentChildRelations, rel];
      createdRelationIds.push(rel.id);
    }
    upsertRelationCitation('relation', rel.id);
  }

  const createdUnionIds: string[] = [];
  let unions = [...data.unions];
  if (input.spouseId) {
    const pair = [person.id, input.spouseId].sort().join(':');
    let union = unions.find((u) => [u.partner1_id, u.partner2_id].filter(Boolean).sort().join(':') === pair);
    if (!union) {
      union = { id: uuid(), partner1_id: person.id, partner2_id: input.spouseId, union_type: 'marriage', confidence: input.confidence, review_status: 'reviewed', created_at: now, updated_at: now };
      unions = [...unions, union];
      createdUnionIds.push(union.id);
    }
    upsertRelationCitation('union', union.id);
  }

  const createdEventIds: string[] = [];
  let events = [...(data.events ?? [])];
  let eventCitations = citations;
  const ensureEvent = (eventInput: { event_type: EventType; date_text?: string; place_text?: string; description?: string; note?: string; confidence?: Confidence }, requireDate = false) => {
    const cleanedDate = clean(eventInput.date_text);
    const cleanedPlace = clean(eventInput.place_text);
    const cleanedDescription = clean(eventInput.description);
    const cleanedNote = clean(eventInput.note);
    if (requireDate && !cleanedDate) return;
    if (!requireDate && ![cleanedDate, cleanedPlace, cleanedDescription, cleanedNote].some(Boolean)) return;
    const eventConfidence = eventInput.confidence || input.confidence;
    const existingEvent = events.find((e) => e.target_type === 'person' && e.target_id === person.id && e.event_type === eventInput.event_type && (e.date_text ?? '') === (cleanedDate ?? '') && (e.place_text ?? '') === (cleanedPlace ?? '') && (e.description ?? '') === (cleanedDescription ?? ''));
    const event = existingEvent ?? { id: uuid(), event_type: eventInput.event_type, target_type: 'person' as const, target_id: person.id, date_text: cleanedDate, place_text: cleanedPlace, description: cleanedDescription, note: cleanedNote, confidence: eventConfidence, review_status: 'reviewed' as const, created_at: now, updated_at: now };
    if (!existingEvent) { events = [...events, event]; createdEventIds.push(event.id); }
    const existingEventCitation = eventCitations.find((c) => c.source_id === input.sourceId && c.target_type === 'event' && c.target_id === event.id);
    const nextEventCitation: Citation = { ...(existingEventCitation ?? { id: uuid(), source_id: input.sourceId!, target_type: 'event' as const, target_id: event.id, created_at: now }), confidence: eventConfidence, page_or_location: cleanKeepExistingWhenBlank(input.page_or_location, existingEventCitation?.page_or_location), quote_text: cleanKeepExistingWhenBlank(input.quote_text, existingEventCitation?.quote_text), interpretation: cleanKeepExistingWhenBlank(input.interpretation, existingEventCitation?.interpretation), note: cleanKeepExistingWhenBlank(input.citation_note, existingEventCitation?.note), updated_at: now };
    eventCitations = existingEventCitation ? eventCitations.map((c) => c.id === nextEventCitation.id ? nextEventCitation : c) : [...eventCitations, nextEventCitation];
  };
  if (input.createBirthEvent) ensureEvent({ event_type: 'birth', date_text: person.birth_date_text, confidence: input.confidence }, true);
  if (input.createDeathEvent) ensureEvent({ event_type: 'death', date_text: person.death_date_text, confidence: input.confidence }, true);
  if (input.additionalEventType) ensureEvent({ event_type: input.additionalEventType, date_text: input.additionalEventDateText, place_text: input.additionalEventPlaceText, description: input.additionalEventDescription, note: input.additionalEventNote, confidence: input.additionalEventConfidence || input.confidence });

  return { persons, sources: data.sources, citations: eventCitations, parentChildRelations, unions, events, person, citation, createdPerson: !existing, createdCitation: !dupCitation, createdRelationIds, createdUnionIds, createdEventIds };
}
