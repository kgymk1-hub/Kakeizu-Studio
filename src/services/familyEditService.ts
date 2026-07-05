import { nanoid } from 'nanoid';
import type { ParentChildRelation, Person, Union } from '../models';

export interface FamilyEditState {
  persons: Person[];
  unions: Union[];
  parentChildRelations: ParentChildRelation[];
}

export type RelativeKind = 'father' | 'mother' | 'spouse' | 'child';

export interface AddRelativeInput {
  basePersonId: string;
  kind: RelativeKind;
  displayName: string;
  gender?: Person['gender'];
  birthDateText?: string;
  deathDateText?: string;
  note?: string;
}

const timestamp = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${nanoid(10)}`;

export function createEmptyPerson(overrides: Partial<Person> & Pick<Person, 'display_name'>): Person {
  const now = timestamp();

  return {
    id: makeId('per'),
    display_name: overrides.display_name,
    external_id: overrides.external_id,
    family_name: overrides.family_name,
    given_name: overrides.given_name,
    gender: overrides.gender ?? 'unknown',
    birth_date_text: overrides.birth_date_text,
    death_date_text: overrides.death_date_text,
    generation_no: overrides.generation_no,
    confidence: overrides.confidence ?? 'uncertain',
    review_status: overrides.review_status ?? 'unreviewed',
    note: overrides.note,
    created_at: now,
    updated_at: now,
  };
}

export function addRelative(state: FamilyEditState, input: AddRelativeInput): FamilyEditState {
  const base = state.persons.find((person) => person.id === input.basePersonId);

  if (!base) {
    throw new Error(`Base person not found: ${input.basePersonId}`);
  }

  const newPerson = createEmptyPerson({
    display_name: input.displayName.trim() || defaultNameFor(input.kind),
    gender: input.gender ?? defaultGenderFor(input.kind),
    birth_date_text: input.birthDateText,
    death_date_text: input.deathDateText,
    generation_no: estimateGeneration(base.generation_no, input.kind),
    note: input.note,
  });

  if (input.kind === 'spouse') {
    const union = createUnion(base.id, newPerson.id);

    return {
      ...state,
      persons: [...state.persons, newPerson],
      unions: [...state.unions, union],
    };
  }

  if (input.kind === 'child') {
    const union = findPrimaryUnionForParent(state.unions, base.id) ?? createUnion(base.id);
    const relation = createRelation(base.id, newPerson.id, union.id);
    const unions = state.unions.some((item) => item.id === union.id)
      ? state.unions
      : [...state.unions, union];

    return {
      ...state,
      persons: [...state.persons, newPerson],
      unions,
      parentChildRelations: [...state.parentChildRelations, relation],
    };
  }

  const relation = createRelation(newPerson.id, base.id);

  return {
    ...state,
    persons: [...state.persons, newPerson],
    parentChildRelations: [...state.parentChildRelations, relation],
  };
}

function createUnion(partner1Id: string, partner2Id?: string): Union {
  const now = timestamp();

  return {
    id: makeId('uni'),
    partner1_id: partner1Id,
    partner2_id: partner2Id,
    union_type: partner2Id ? 'marriage' : 'unknown',
    confidence: 'uncertain',
    review_status: 'unreviewed',
    created_at: now,
    updated_at: now,
  };
}

function createRelation(parentId: string, childId: string, unionId?: string): ParentChildRelation {
  const now = timestamp();

  return {
    id: makeId('rel'),
    parent_id: parentId,
    child_id: childId,
    union_id: unionId,
    relation_type: 'biological',
    confidence: 'uncertain',
    review_status: 'unreviewed',
    created_at: now,
    updated_at: now,
  };
}

function defaultNameFor(kind: RelativeKind) {
  return kind === 'father'
    ? '新規父'
    : kind === 'mother'
      ? '新規母'
      : kind === 'spouse'
        ? '新規配偶者'
        : '新規子';
}

function defaultGenderFor(kind: RelativeKind): Person['gender'] {
  if (kind === 'father') return 'male';
  if (kind === 'mother') return 'female';
  return 'unknown';
}

function estimateGeneration(baseGeneration: number | undefined, kind: RelativeKind) {
  if (!baseGeneration) return undefined;
  if (kind === 'father' || kind === 'mother') return Math.max(1, baseGeneration - 1);
  if (kind === 'child') return baseGeneration + 1;
  return baseGeneration;
}

function findPrimaryUnionForParent(unions: Union[], parentId: string) {
  return unions.find(
    (union) => union.partner1_id === parentId || union.partner2_id === parentId,
  );
}
