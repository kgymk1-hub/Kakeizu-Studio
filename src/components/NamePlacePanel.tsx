import { useMemo, useState, type FormEvent } from 'react';
import type { Name, Person, Place, PlaceType, SelectableTarget } from '../models';
import { EmptyState } from './common/EmptyState';

const nameTypes = ['all','primary','birth','maiden','alias','childhood','posthumous','courtesy','legal','other'];
const placeTypes = ['all','honseki','birth','death','residence','marriage','burial','repository','event','other'];
const editablePlaceTypes = placeTypes.filter((t) => t !== 'all') as PlaceType[];
const includes = (value: unknown, q: string) => String(value ?? '').toLowerCase().includes(q);
const uuid = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `place-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function NamePlacePanel({ names, places, persons, onSelectTarget, onSavePlace, onDeletePlace }: { names: Name[]; places: Place[]; persons: Person[]; onSelectTarget: (target: SelectableTarget) => boolean; onSavePlace?: (place: Place) => Promise<void> | void; onDeletePlace?: (placeId: string) => Promise<void> | void }) {
  const [query, setQuery] = useState('');
  const [nameType, setNameType] = useState('all');
  const [placeType, setPlaceType] = useState('all');
  const [editingPlace, setEditingPlace] = useState<Place | undefined>();
  const q = query.trim().toLowerCase();
  const personById = useMemo(() => new Map(persons.map((p) => [p.id, p])), [persons]);
  const filteredNames = names.filter((name) => (nameType === 'all' || name.name_type === nameType) && (!q || [name.name_text, name.family_name, name.given_name, name.family_name_kana, name.given_name_kana, name.note, personById.get(name.person_id)?.display_name].some((v) => includes(v, q))));
  const filteredPlaces = places.filter((place) => (placeType === 'all' || place.place_type === placeType) && (!q || [place.name, place.normalized_name, place.address_text, place.country, place.prefecture, place.municipality, place.district, place.note].some((v) => includes(v, q))));
  const placeForm = editingPlace ?? { id: '', name: '', place_type: 'event' as PlaceType, created_at: '', updated_at: '' };

  const handleSavePlace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const now = new Date().toISOString();
    const clean = (key: string) => String(fd.get(key) ?? '').trim() || undefined;
    const name = clean('name');
    if (!name) return;
    const next: Place = {
      ...(editingPlace ?? { id: uuid(), created_at: now }),
      name,
      place_type: clean('place_type') as PlaceType,
      normalized_name: clean('normalized_name'),
      address_text: clean('address_text'),
      country: clean('country'),
      prefecture: clean('prefecture'),
      municipality: clean('municipality'),
      district: clean('district'),
      privacy_level: clean('privacy_level') as Place['privacy_level'],
      confidence: clean('confidence') as Place['confidence'],
      review_status: clean('review_status') as Place['review_status'],
      note: clean('note'),
      updated_at: now,
    };
    await onSavePlace?.(next);
    setEditingPlace(undefined);
  };

  return <section className="panel name-place-panel"><h2>名前・別名（Name）/ 場所候補（Place）</h2><label>検索<input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="名前・地名・メモを検索" /></label><div className="inline-filters"><label>名前種別<select value={nameType} onChange={(e)=>setNameType(e.target.value)}>{nameTypes.map((t)=><option key={t} value={t}>{t}</option>)}</select></label><label>場所種別<select value={placeType} onChange={(e)=>setPlaceType(e.target.value)}>{placeTypes.map((t)=><option key={t} value={t}>{t}</option>)}</select></label></div><h3>名前・別名（Name）一覧</h3><p className="list-panel-count">{filteredNames.length} / {names.length} 件</p>{filteredNames.length===0 ? <EmptyState className="notice list-panel-empty">名前・別名はありません。</EmptyState> : <ul className="list-card-list">{filteredNames.map((name)=>{ const person = personById.get(name.person_id); return <li key={name.id}><button type="button" className="list-card list-card-clickable" onClick={()=>onSelectTarget({ target_type:'name', target_id:name.id })}><strong>{name.name_text}</strong><span>{name.name_type} / 関連人物: {person?.display_name ?? `参照先不明(${name.person_id})`}</span><span className="list-card-meta">確度: {name.confidence ?? '-'} / 確認状態: {name.review_status ?? '-'}</span></button></li>; })}</ul>}<h3>場所候補（Place）の追加・編集</h3><form className="stacked-form" onSubmit={handleSavePlace}><label>場所名<input name="name" key={`name-${placeForm.id}`} defaultValue={placeForm.name} required /></label><label>場所種別<select name="place_type" key={`type-${placeForm.id}`} defaultValue={placeForm.place_type ?? 'event'}>{editablePlaceTypes.map((t)=><option key={t} value={t}>{t}</option>)}</select></label><label>正規化名<input name="normalized_name" key={`normalized-${placeForm.id}`} defaultValue={placeForm.normalized_name ?? ''} /></label><label>住所<input name="address_text" key={`address-${placeForm.id}`} defaultValue={placeForm.address_text ?? ''} /></label><label>国<input name="country" key={`country-${placeForm.id}`} defaultValue={placeForm.country ?? ''} /></label><label>都道府県<input name="prefecture" key={`prefecture-${placeForm.id}`} defaultValue={placeForm.prefecture ?? ''} /></label><label>市区町村<input name="municipality" key={`municipality-${placeForm.id}`} defaultValue={placeForm.municipality ?? ''} /></label><label>地区<input name="district" key={`district-${placeForm.id}`} defaultValue={placeForm.district ?? ''} /></label><label>公開範囲<select name="privacy_level" key={`privacy-${placeForm.id}`} defaultValue={placeForm.privacy_level ?? ''}><option value="">未設定</option><option value="public">public</option><option value="private">private</option><option value="hidden">hidden</option></select></label><label>確度<select name="confidence" key={`confidence-${placeForm.id}`} defaultValue={placeForm.confidence ?? ''}><option value="">未設定</option><option value="confirmed">confirmed</option><option value="likely">likely</option><option value="uncertain">uncertain</option><option value="disputed">disputed</option></select></label><label>確認状態<select name="review_status" key={`review-${placeForm.id}`} defaultValue={placeForm.review_status ?? ''}><option value="">未設定</option><option value="unreviewed">unreviewed</option><option value="reviewed">reviewed</option><option value="rejected">rejected</option></select></label><label>備考<textarea name="note" key={`note-${placeForm.id}`} defaultValue={placeForm.note ?? ''} /></label><div className="button-row"><button type="submit">{editingPlace ? '場所候補を更新' : '場所候補を追加'}</button>{editingPlace && <button type="button" onClick={()=>setEditingPlace(undefined)}>新規入力に戻す</button>}</div></form><h3>場所候補（Place）一覧</h3><p className="list-panel-count">{filteredPlaces.length} / {places.length} 件</p>{filteredPlaces.length===0 ? <EmptyState className="notice list-panel-empty">場所候補はありません。</EmptyState> : <ul className="list-card-list">{filteredPlaces.map((place)=><li key={place.id}><div className="list-card"><button type="button" className="list-card-clickable" onClick={()=>onSelectTarget({ target_type:'place', target_id:place.id })}><strong>{place.name}</strong><span>{place.place_type ?? '-'} / 正規化名: {place.normalized_name ?? '-'}</span><span className="list-card-meta">{place.prefecture ?? '-'} {place.municipality ?? '-'} / 公開範囲: {place.privacy_level ?? '-'}</span></button><div className="button-row"><button type="button" onClick={()=>setEditingPlace(place)}>編集</button>{onDeletePlace && <button type="button" onClick={()=>{ if (confirm(`場所候補「${place.name}」を削除します。関連する出来事・資料からPlace参照が解除されます。`)) void onDeletePlace(place.id); }}>削除</button>}</div></div></li>)}</ul>}</section>;
}
