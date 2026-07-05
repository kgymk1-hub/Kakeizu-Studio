import type { Citation, Confidence, Gender, ParentChildRelation, Person, Source, SourceType, Union } from '../models';

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
}

export interface KosekiEntryData {
  persons: Person[];
  sources: Source[];
  citations: Citation[];
  parentChildRelations: ParentChildRelation[];
  unions: Union[];
}

export interface KosekiEntryResult extends KosekiEntryData {
  person: Person;
  citation: Citation;
  createdPerson: boolean;
  createdCitation: boolean;
  createdRelationIds: string[];
  createdUnionIds: string[];
}

const nowIso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const clean = (value?: string) => value?.trim() || undefined;

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
    gender: input.gender || undefined,
    birth_date_text: clean(input.birth_date_text),
    death_date_text: clean(input.death_date_text),
    generation_no: input.generation_no,
    rank_title: clean(input.rank_title),
    note: clean(input.note),
    confidence: input.confidence,
    review_status: existing?.review_status ?? 'reviewed',
    updated_at: now,
  };
  const persons = existing ? data.persons.map((p) => p.id === person.id ? person : p) : [...data.persons, person];

  const dupCitation = data.citations.find((c) => c.source_id === input.sourceId && c.target_type === 'person' && c.target_id === person.id);
  const citation: Citation = { ...(dupCitation ?? { id: uuid(), source_id: input.sourceId, target_type: 'person' as const, target_id: person.id, created_at: now }), confidence: input.confidence, page_or_location: clean(input.page_or_location), quote_text: clean(input.quote_text), interpretation: clean(input.interpretation), note: clean(input.citation_note), updated_at: now };
  const citations = dupCitation ? data.citations.map((c) => c.id === citation.id ? citation : c) : [...data.citations, citation];

  const createdRelationIds: string[] = [];
  let parentChildRelations = [...data.parentChildRelations];
  for (const parentId of [input.fatherId, input.motherId].filter(Boolean) as string[]) {
    if (!parentChildRelations.some((r) => r.parent_id === parentId && r.child_id === person.id)) {
      const rel: ParentChildRelation = { id: uuid(), parent_id: parentId, child_id: person.id, relation_type: 'biological', confidence: input.confidence, review_status: 'reviewed', created_at: now, updated_at: now };
      parentChildRelations = [...parentChildRelations, rel];
      createdRelationIds.push(rel.id);
    }
  }

  const createdUnionIds: string[] = [];
  let unions = [...data.unions];
  if (input.spouseId) {
    const pair = [person.id, input.spouseId].sort().join(':');
    if (!unions.some((u) => [u.partner1_id, u.partner2_id].filter(Boolean).sort().join(':') === pair)) {
      const union: Union = { id: uuid(), partner1_id: person.id, partner2_id: input.spouseId, union_type: 'marriage', confidence: input.confidence, review_status: 'reviewed', created_at: now, updated_at: now };
      unions = [...unions, union];
      createdUnionIds.push(union.id);
    }
  }

  return { persons, sources: data.sources, citations, parentChildRelations, unions, person, citation, createdPerson: !existing, createdCitation: !dupCitation, createdRelationIds, createdUnionIds };
}
