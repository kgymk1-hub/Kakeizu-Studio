import { describe, expect, it } from 'vitest';
import type { Citation, Person } from '../models';
import { filterPersons } from '../components/PersonListPanel/personListFilter';

const now = '2026-01-01T00:00:00.000Z';
const person = (overrides: Partial<Person>): Person => ({ id: 'p', display_name: '山田 太郎', created_at: now, updated_at: now, ...overrides });
const persons: Person[] = [
  person({ id: 'p1', display_name: '山田 太郎', family_name: '山田', given_name: '太郎', family_name_kana: 'やまだ', given_name_kana: 'たろう', gender: 'male', confidence: 'confirmed', review_status: 'reviewed', rank_title: '士族', occupation: '農家', note: '本家' }),
  person({ id: 'p2', display_name: '佐藤 花子', family_name: '佐藤', given_name: '花子', birth_family_name: '鈴木', gender: 'female', confidence: 'likely', review_status: 'unreviewed', occupation: '教師', note: '分家から転居' }),
  person({ id: 'p3', display_name: 'Alex Kim', gender: 'other', confidence: 'uncertain', review_status: 'rejected', rank_title: 'Dr.', note: 'overseas record' }),
];
const citations: Pick<Citation, 'target_type' | 'target_id'>[] = [{ target_type: 'person', target_id: 'p1' }, { target_type: 'event', target_id: 'p2' }];

describe('filterPersons', () => {
  it('検索語なしなら全件返す', () => { expect(filterPersons(persons, citations)).toEqual(persons); });
  it('display_nameで検索できる', () => { expect(filterPersons(persons, citations, { query: '花子' }).map((p) => p.id)).toEqual(['p2']); });
  it('family_name / given_nameで検索できる', () => { expect(filterPersons(persons, citations, { query: '太郎' }).map((p) => p.id)).toEqual(['p1']); expect(filterPersons(persons, citations, { query: '佐藤' }).map((p) => p.id)).toEqual(['p2']); });
  it('かなと旧姓で検索できる', () => { expect(filterPersons(persons, citations, { query: 'やまだ' }).map((p) => p.id)).toEqual(['p1']); expect(filterPersons(persons, citations, { query: '鈴木' }).map((p) => p.id)).toEqual(['p2']); });
  it('rank_title / occupation / noteで検索できる', () => { expect(filterPersons(persons, citations, { query: '士族' }).map((p) => p.id)).toEqual(['p1']); expect(filterPersons(persons, citations, { query: '教師' }).map((p) => p.id)).toEqual(['p2']); expect(filterPersons(persons, citations, { query: 'OVERSEAS' }).map((p) => p.id)).toEqual(['p3']); });
  it('genderでフィルタできる', () => { expect(filterPersons(persons, citations, { gender: 'female' }).map((p) => p.id)).toEqual(['p2']); });
  it('confidenceでフィルタできる', () => { expect(filterPersons(persons, citations, { confidence: 'uncertain' }).map((p) => p.id)).toEqual(['p3']); });
  it('review_statusでフィルタできる', () => { expect(filterPersons(persons, citations, { review_status: 'reviewed' }).map((p) => p.id)).toEqual(['p1']); });
  it('出典あり人物だけを抽出できる', () => { expect(filterPersons(persons, citations, { citation: 'with' }).map((p) => p.id)).toEqual(['p1']); });
  it('出典なし人物だけを抽出できる', () => { expect(filterPersons(persons, citations, { citation: 'without' }).map((p) => p.id)).toEqual(['p2', 'p3']); });
  it('複数条件を組み合わせられる', () => { expect(filterPersons(persons, citations, { query: '山田', gender: 'male', confidence: 'confirmed', review_status: 'reviewed', citation: 'with' }).map((p) => p.id)).toEqual(['p1']); });
  it('条件に合わない場合は空配列になる', () => { expect(filterPersons(persons, citations, { query: '山田', gender: 'female' })).toEqual([]); });
});
