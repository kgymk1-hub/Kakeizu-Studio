import { useMemo, useState } from 'react';
import type { Name, Person, Place, SelectableTarget } from '../models';

const nameTypes = ['all','primary','birth','maiden','alias','childhood','posthumous','courtesy','legal','other'];
const placeTypes = ['all','honseki','birth','death','residence','marriage','burial','repository','event','other'];
const includes = (value: unknown, q: string) => String(value ?? '').toLowerCase().includes(q);

export function NamePlacePanel({ names, places, persons, onSelectTarget }: { names: Name[]; places: Place[]; persons: Person[]; onSelectTarget: (target: SelectableTarget) => boolean }) {
  const [query, setQuery] = useState('');
  const [nameType, setNameType] = useState('all');
  const [placeType, setPlaceType] = useState('all');
  const q = query.trim().toLowerCase();
  const personById = useMemo(() => new Map(persons.map((p) => [p.id, p])), [persons]);
  const filteredNames = names.filter((name) => (nameType === 'all' || name.name_type === nameType) && (!q || [name.name_text, name.family_name, name.given_name, name.family_name_kana, name.given_name_kana, name.note, personById.get(name.person_id)?.display_name].some((v) => includes(v, q))));
  const filteredPlaces = places.filter((place) => (placeType === 'all' || place.place_type === placeType) && (!q || [place.name, place.normalized_name, place.address_text, place.country, place.prefecture, place.municipality, place.district, place.note].some((v) => includes(v, q))));
  return <section className="panel name-place-panel"><h2>Name / Place一覧</h2><label>検索<input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="名前・地名・メモを検索" /></label><div className="inline-filters"><label>Name type<select value={nameType} onChange={(e)=>setNameType(e.target.value)}>{nameTypes.map((t)=><option key={t} value={t}>{t}</option>)}</select></label><label>Place type<select value={placeType} onChange={(e)=>setPlaceType(e.target.value)}>{placeTypes.map((t)=><option key={t} value={t}>{t}</option>)}</select></label></div><h3>Name一覧</h3><p className="list-panel-count">{filteredNames.length} / {names.length} 件</p>{filteredNames.length===0 ? <p className="notice list-panel-empty">Nameはありません。</p> : <ul className="list-card-list">{filteredNames.map((name)=>{ const person = personById.get(name.person_id); return <li key={name.id}><button type="button" className="list-card list-card-clickable" onClick={()=>onSelectTarget({ target_type:'name', target_id:name.id })}><strong>{name.name_text}</strong><span>{name.name_type} / 関連Person: {person?.display_name ?? `参照先不明(${name.person_id})`}</span><span className="list-card-meta">confidence: {name.confidence ?? '-'} / review: {name.review_status ?? '-'}</span></button></li>; })}</ul>}<h3>Place一覧</h3><p className="list-panel-count">{filteredPlaces.length} / {places.length} 件</p>{filteredPlaces.length===0 ? <p className="notice list-panel-empty">Placeはありません。</p> : <ul className="list-card-list">{filteredPlaces.map((place)=><li key={place.id}><button type="button" className="list-card" onClick={()=>onSelectTarget({ target_type:'place', target_id:place.id })}><strong>{place.name}</strong><span>{place.place_type ?? '-'} / normalized: {place.normalized_name ?? '-'}</span><span className="list-card-meta">{place.prefecture ?? '-'} {place.municipality ?? '-'} / privacy: {place.privacy_level ?? '-'}</span></button></li>)}</ul>}</section>;
}
