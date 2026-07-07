import { useMemo, useState } from 'react';
import type { Citation, Confidence, Gender, Person, ReviewStatus, SelectableTarget } from '../../models';
import { filterPersons, hasPersonCitation, type PersonCitationFilter } from './personListFilter';

interface Props {
  persons: Person[];
  citations: Citation[];
  selectedPersonId?: string;
  onSelectTarget: (target: SelectableTarget) => void;
}

const genders: ('all' | Gender)[] = ['all', 'male', 'female', 'unknown', 'other'];
const confidences: ('all' | Confidence)[] = ['all', 'confirmed', 'likely', 'uncertain', 'disputed'];
const reviewStatuses: ('all' | ReviewStatus)[] = ['all', 'reviewed', 'unreviewed', 'rejected'];
const citationFilters: { value: PersonCitationFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'with', label: '出典あり' },
  { value: 'without', label: '出典なし' },
];

const labelAll = (value: string) => value === 'all' ? 'すべて' : value;
const lifeDates = (person: Person) => [person.birth_date_text || person.birth_date_from || '', person.death_date_text || person.death_date_from || ''].filter(Boolean).join(' – ') || '生没年未入力';

export function PersonListPanel({ persons, citations, selectedPersonId, onSelectTarget }: Props) {
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState<'all' | Gender>('all');
  const [confidence, setConfidence] = useState<'all' | Confidence>('all');
  const [reviewStatus, setReviewStatus] = useState<'all' | ReviewStatus>('all');
  const [citation, setCitation] = useState<PersonCitationFilter>('all');

  const filteredPersons = useMemo(() => filterPersons(persons, citations, { query, gender, confidence, review_status: reviewStatus, citation }), [persons, citations, query, gender, confidence, reviewStatus, citation]);

  return <section className="panel person-list-panel" aria-labelledby="person-list-heading">
    <h2 id="person-list-heading">人物一覧</h2>
    <div className="person-list-controls">
      <label className="person-search-label">検索<input type="text" value={query} placeholder="氏名・かな・旧姓・称号・職業・備考" onInput={(e) => setQuery(e.currentTarget.value)} /></label>
      <label>gender<select value={gender} onChange={(e) => setGender(e.target.value as 'all' | Gender)}>{genders.map((value) => <option key={value} value={value}>{labelAll(value)}</option>)}</select></label>
      <label>confidence<select value={confidence} onChange={(e) => setConfidence(e.target.value as 'all' | Confidence)}>{confidences.map((value) => <option key={value} value={value}>{labelAll(value)}</option>)}</select></label>
      <label>review_status<select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value as 'all' | ReviewStatus)}>{reviewStatuses.map((value) => <option key={value} value={value}>{labelAll(value)}</option>)}</select></label>
      <label>出典<select value={citation} onChange={(e) => setCitation(e.target.value as PersonCitationFilter)}>{citationFilters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    </div>
    <p className="person-list-count">{filteredPersons.length} / {persons.length} 人を表示</p>
    {filteredPersons.length === 0 ? <p className="notice">条件に一致する人物がいません。</p> : <ul className="person-list-cards">
      {filteredPersons.map((person) => {
        const cited = hasPersonCitation(person.id, citations);
        return <li key={person.id}>
          <button type="button" className={`person-list-card ${person.id === selectedPersonId ? 'selected-list' : ''}`} onClick={() => onSelectTarget({ target_type: 'person', target_id: person.id })}>
            <span className="person-card-main"><strong>{person.display_name || '名称未入力'}</strong><span>{person.gender ?? 'unknown'} / {lifeDates(person)}</span></span>
            <span className="person-card-meta"><span>{person.rank_title || person.occupation || '称号・職業未入力'}</span><span>{person.confidence ?? 'confirmed'} / {person.review_status ?? 'unreviewed'} / {cited ? '出典あり' : '出典なし'}</span></span>
            {person.note && <span className="person-card-note">{person.note.slice(0, 60)}{person.note.length > 60 ? '…' : ''}</span>}
          </button>
        </li>;
      })}
    </ul>}
  </section>;
}
