import type { Citation, Confidence, Gender, Person, ReviewStatus } from '../../models';

export type PersonCitationFilter = 'all' | 'with' | 'without';

export interface PersonListFilters {
  query?: string;
  gender?: 'all' | Gender;
  confidence?: 'all' | Confidence;
  review_status?: 'all' | ReviewStatus;
  citation?: PersonCitationFilter;
}

const searchableFields: (keyof Pick<Person, 'display_name' | 'family_name' | 'given_name' | 'family_name_kana' | 'given_name_kana' | 'birth_family_name' | 'rank_title' | 'occupation' | 'note'>)[] = [
  'display_name',
  'family_name',
  'given_name',
  'family_name_kana',
  'given_name_kana',
  'birth_family_name',
  'rank_title',
  'occupation',
  'note',
];

export function hasPersonCitation(personId: string, citations: Pick<Citation, 'target_type' | 'target_id'>[] = []): boolean {
  return citations.some((citation) => citation.target_type === 'person' && citation.target_id === personId);
}

export function filterPersons(persons: Person[], citations: Pick<Citation, 'target_type' | 'target_id'>[], filters: PersonListFilters = {}): Person[] {
  const query = (filters.query ?? '').trim().toLocaleLowerCase();
  return persons.filter((person) => {
    if (query) {
      const matchesQuery = searchableFields.some((field) => String(person[field] ?? '').toLocaleLowerCase().includes(query));
      if (!matchesQuery) return false;
    }
    if (filters.gender && filters.gender !== 'all' && (person.gender ?? 'unknown') !== filters.gender) return false;
    if (filters.confidence && filters.confidence !== 'all' && (person.confidence ?? 'confirmed') !== filters.confidence) return false;
    if (filters.review_status && filters.review_status !== 'all' && (person.review_status ?? 'unreviewed') !== filters.review_status) return false;
    const citationFilter = filters.citation ?? 'all';
    if (citationFilter !== 'all') {
      const cited = hasPersonCitation(person.id, citations);
      if (citationFilter === 'with' && !cited) return false;
      if (citationFilter === 'without' && cited) return false;
    }
    return true;
  });
}
