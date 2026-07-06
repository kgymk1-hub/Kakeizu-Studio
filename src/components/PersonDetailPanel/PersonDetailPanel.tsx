import type { Citation, Event, EventType, ParentChildRelation, Person, Source, Union } from '../../models';
import { sourceTypeLabels, sourceTypeOptions } from '../SourceManager/SourceManager';

interface Props {
  person?: Person;
  sources: Source[];
  citations: Citation[];
  persons?: Person[];
  relations?: ParentChildRelation[];
  unions?: Union[];
  onChange: (p: Person) => void;
  onSaveCitation: (citation: Citation, newSource?: Source) => void;
  onDeleteCitation: (citationId: string) => void;
  events?: Event[];
  onSaveEvent?: (event: Event, citation?: Citation) => void;
  onDeleteEvent?: (eventId: string) => void;
  onDeleteParentChildRelation?: (relationId: string) => void;
  onDeleteUnion?: (unionId: string) => void;
}

const eventTypeLabels: Record<EventType, string> = { birth: '出生', death: '死亡', marriage: '婚姻', divorce: '離婚', adoption: '養子縁組', recognition: '認知', entry_registry: '入籍', removal_registry: '除籍', transfer_registry: '転籍', name_change: '改名', residence: '住所', occupation: '職業', title: '称号', other: 'その他' };
const eventTypeOptions = Object.entries(eventTypeLabels) as [EventType, string][];

const confidenceLabels = { confirmed: '確認済み', likely: '有力', uncertain: '不確か', disputed: '異説あり' } as const;

export function PersonDetailPanel({ person, sources, citations, persons, relations, unions, onChange, onSaveCitation, onDeleteCitation, events, onSaveEvent, onDeleteEvent, onDeleteParentChildRelation, onDeleteUnion }: Props) {
  if (!person) return <aside className="detail"><h2>人物詳細</h2><p>人物ノードをクリックしてください。</p></aside>;
  const personEvents = (events ?? []).filter((e) => e.target_type === 'person' && e.target_id === person.id);
  const eventCitationById = new Map(citations.filter((c) => c.target_type === 'event').map((c) => [c.target_id, c]));
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const personById = new Map((persons ?? [person]).map((p) => [p.id, p]));
  const personCitations = citations.filter((c) => c.target_type === 'person' && c.target_id === person.id);
  const relationItems = (relations ?? []).filter((r) => r.parent_id === person.id || r.child_id === person.id);
  const unionItems = (unions ?? []).filter((u) => u.partner1_id === person.id || u.partner2_id === person.id);
  const citationsForTarget = (targetType: 'relation' | 'union', targetId: string) => citations.filter((c) => c.target_type === targetType && c.target_id === targetId);
  const update=(k:keyof Person,v:string)=>onChange({...person,[k]:v,updated_at:new Date().toISOString()});
  const saveCitation = (form: HTMLFormElement, existing?: Citation) => {
    const fd = new FormData(form);
    const now = new Date().toISOString();
    let sourceId = String(fd.get('source_id') ?? '');
    let newSource: Source | undefined;
    const newTitle = String(fd.get('new_source_title') ?? '').trim();
    if (sourceId === '__new__' && newTitle) {
      sourceId = crypto.randomUUID();
      newSource = { id: sourceId, title: newTitle, source_type: String(fd.get('new_source_type') ?? 'other') as Source['source_type'], created_at: now, updated_at: now };
    }
    if (!sourceId || sourceId === '__new__') return;
    onSaveCitation({
      ...(existing ?? { id: crypto.randomUUID(), created_at: now }),
      source_id: sourceId,
      target_type: 'person',
      target_id: person.id,
      page_or_location: String(fd.get('page_or_location') ?? '').trim() || undefined,
      quote_text: String(fd.get('quote_text') ?? '').trim() || undefined,
      interpretation: String(fd.get('interpretation') ?? '').trim() || undefined,
      confidence: String(fd.get('confidence') ?? 'confirmed') as Citation['confidence'],
      note: String(fd.get('note') ?? '').trim() || undefined,
      updated_at: now,
    }, newSource);
    form.reset();
  };

  const saveTargetCitation = (form: HTMLFormElement, targetType: 'relation' | 'union', targetId: string, existing?: Citation) => {
    const fd = new FormData(form);
    const now = new Date().toISOString();
    const sourceId = String(fd.get('source_id') ?? '');
    if (!sourceId || sourceId === '__new__') return;
    const duplicate = citations.find((c) => c.source_id === sourceId && c.target_type === targetType && c.target_id === targetId);
    onSaveCitation({
      ...(existing ?? duplicate ?? { id: crypto.randomUUID(), created_at: now }),
      source_id: sourceId,
      target_type: targetType,
      target_id: targetId,
      page_or_location: String(fd.get('page_or_location') ?? '').trim() || undefined,
      quote_text: String(fd.get('quote_text') ?? '').trim() || undefined,
      interpretation: String(fd.get('interpretation') ?? '').trim() || undefined,
      confidence: String(fd.get('confidence') ?? 'confirmed') as Citation['confidence'],
      note: String(fd.get('note') ?? '').trim() || undefined,
      updated_at: now,
    });
    form.reset();
  };


  const saveEvent = (form: HTMLFormElement, existing?: Event) => {
    const fd = new FormData(form);
    const now = new Date().toISOString();
    const event: Event = {
      ...(existing ?? { id: crypto.randomUUID(), target_type: 'person' as const, target_id: person.id, created_at: now }),
      event_type: String(fd.get('event_type') ?? 'other') as EventType,
      target_type: 'person',
      target_id: person.id,
      date_text: String(fd.get('date_text') ?? '').trim() || undefined,
      place_text: String(fd.get('place_text') ?? '').trim() || undefined,
      description: String(fd.get('description') ?? '').trim() || undefined,
      confidence: String(fd.get('confidence') ?? 'confirmed') as Event['confidence'],
      note: String(fd.get('note') ?? '').trim() || undefined,
      updated_at: now,
    };
    const sourceId = String(fd.get('event_source_id') ?? '');
    const existingCitation = citations.find((c) => c.source_id === sourceId && c.target_type === 'event' && c.target_id === event.id);
    const citation = sourceId ? {
      ...(existingCitation ?? { id: crypto.randomUUID(), source_id: sourceId, target_type: 'event' as const, target_id: event.id, created_at: now }),
      source_id: sourceId,
      target_type: 'event' as const,
      target_id: event.id,
      page_or_location: String(fd.get('page_or_location') ?? '').trim() || existingCitation?.page_or_location,
      quote_text: String(fd.get('quote_text') ?? '').trim() || existingCitation?.quote_text,
      interpretation: String(fd.get('interpretation') ?? '').trim() || existingCitation?.interpretation,
      confidence: String(fd.get('citation_confidence') ?? event.confidence ?? 'confirmed') as Citation['confidence'],
      note: String(fd.get('citation_note') ?? '').trim() || existingCitation?.note,
      updated_at: now,
    } : undefined;
    onSaveEvent?.(event, citation);
    form.reset();
  };

  return <aside className="detail"><h2>人物詳細 {personCitations.length > 0 && <span className="badge">出典あり</span>}</h2>
    <label>表示名<input value={person.display_name} onChange={(e)=>update('display_name',e.target.value)}/></label>
    <label>生年月日<input value={person.birth_date_text ?? ''} onChange={(e)=>update('birth_date_text',e.target.value)}/></label>
    <label>没年月日<input value={person.death_date_text ?? ''} onChange={(e)=>update('death_date_text',e.target.value)}/></label>
    <label>称号<input value={person.rank_title ?? ''} onChange={(e)=>update('rank_title',e.target.value)}/></label>
    <label>備考<textarea value={person.note ?? ''} onChange={(e)=>update('note',e.target.value)}/></label>

    <section className="citation-section"><h3>出来事（Event）</h3>
      <p className="help-text">出生・死亡・婚姻・転籍・入籍・除籍などを人物に紐づけて記録します。家系図ノード上にはまだ表示しません。</p>
      <details><summary>この人物にEventを追加</summary><EventForm sources={sources} onSubmit={(form) => saveEvent(form)} /></details>
      {personEvents.length === 0 ? <p>この人物に紐づくEventはありません。</p> : <ul className="citation-list">{personEvents.map((event) => {
        const eventCitation = eventCitationById.get(event.id);
        return <li key={event.id}><strong>{eventTypeLabels[event.event_type] ?? event.event_type}</strong> {eventCitation ? <span className="badge">出典あり</span> : <span className="badge">出典なし</span>}
          <dl><dt>日付</dt><dd>{event.date_text || '-'}</dd><dt>場所</dt><dd>{event.place_text || '-'}</dd><dt>説明</dt><dd>{event.description || '-'}</dd><dt>確度</dt><dd>{event.confidence ? confidenceLabels[event.confidence] : '-'}</dd><dt>出典</dt><dd>{eventCitation ? (sourceById.get(eventCitation.source_id)?.title ?? '参照先資料なし') : 'なし'}</dd><dt>メモ</dt><dd>{event.note || '-'}</dd></dl>
          <details><summary>編集</summary><EventForm event={event} citation={eventCitation} sources={sources} onSubmit={(form) => saveEvent(form, event)} /></details>
          <button type="button" onClick={() => onDeleteEvent?.(event.id)}>Eventを削除</button>
        </li>;
      })}</ul>}
    </section>
    <section className="citation-section"><h3>出典</h3>
      <p className="help-text">出典は、選択中の人物にどの資料を根拠として紐づけるかを記録します。</p>
      <details><summary>この人物に出典を追加</summary><CitationForm sources={sources} onSubmit={(form) => saveCitation(form)} /></details>
      {personCitations.length === 0 ? <p>この人物に紐づく出典はありません。</p> : <ul className="citation-list">{personCitations.map((citation) => {
        const source = sourceById.get(citation.source_id);
        return <li key={citation.id}><strong>{source?.title ?? '参照先資料なし'}</strong> <span className="badge">{source ? sourceTypeLabels[source.source_type] : '不明'}</span>
          <dl><dt>ページ・位置</dt><dd>{citation.page_or_location || '-'}</dd><dt>引用</dt><dd>{citation.quote_text || '-'}</dd><dt>解釈</dt><dd>{citation.interpretation || '-'}</dd><dt>確度</dt><dd>{citation.confidence ? confidenceLabels[citation.confidence] : '-'}</dd><dt>メモ</dt><dd>{citation.note || '-'}</dd></dl>
          <details><summary>編集</summary><CitationForm citation={citation} sources={sources} onSubmit={(form) => saveCitation(form, citation)} /></details>
          <button type="button" onClick={() => onDeleteCitation(citation.id)}>出典紐づけを削除</button>
        </li>;
      })}</ul>}
    </section>
    <section className="citation-section"><h3>関係の出典</h3>
      <h4>親子関係</h4>
      {relationItems.length === 0 ? <p>この人物に関係する親子関係はありません。</p> : <ul className="citation-list">{relationItems.map((relation) => {
        const relationCitations = citationsForTarget('relation', relation.id);
        const parentName = personById.get(relation.parent_id)?.display_name ?? relation.parent_id;
        const childName = personById.get(relation.child_id)?.display_name ?? relation.child_id;
        return <li key={relation.id}><strong>親子関係：{parentName} → {childName}</strong> {relationCitations.length > 0 ? <span className="badge">出典あり</span> : <span className="badge">出典なし</span>}
          <dl><dt>続柄種別</dt><dd>{relation.relation_type}</dd></dl>
          <button type="button" onClick={() => onDeleteParentChildRelation?.(relation.id)}>この親子関係を削除</button>
          <details><summary>出典を追加</summary><CitationForm sources={sources} allowNewSource={false} onSubmit={(form) => saveTargetCitation(form, 'relation', relation.id)} /></details>
          {relationCitations.length === 0 ? <p>この親子関係に紐づく出典はありません。</p> : <ul className="citation-list">{relationCitations.map((citation) => {
            const source = sourceById.get(citation.source_id);
            return <li key={citation.id}><strong>{source?.title ?? '参照先資料なし'}</strong> <span className="badge">{source ? sourceTypeLabels[source.source_type] : '不明'}</span>
              <dl><dt>ページ・位置</dt><dd>{citation.page_or_location || '-'}</dd><dt>引用</dt><dd>{citation.quote_text || '-'}</dd><dt>解釈</dt><dd>{citation.interpretation || '-'}</dd><dt>確度</dt><dd>{citation.confidence ? confidenceLabels[citation.confidence] : '-'}</dd><dt>メモ</dt><dd>{citation.note || '-'}</dd></dl>
              <details><summary>編集</summary><CitationForm citation={citation} sources={sources} allowNewSource={false} onSubmit={(form) => saveTargetCitation(form, 'relation', relation.id, citation)} /></details>
              <button type="button" onClick={() => onDeleteCitation(citation.id)}>関係出典を削除</button>
            </li>;
          })}</ul>}
        </li>;
      })}</ul>}
      <h4>夫婦関係</h4>
      {unionItems.length === 0 ? <p>この人物に関係する夫婦関係はありません。</p> : <ul className="citation-list">{unionItems.map((union) => {
        const unionCitations = citationsForTarget('union', union.id);
        const p1 = personById.get(union.partner1_id)?.display_name ?? union.partner1_id;
        const p2 = union.partner2_id ? (personById.get(union.partner2_id)?.display_name ?? union.partner2_id) : '未設定';
        return <li key={union.id}><strong>夫婦関係：{p1} ⇔ {p2}</strong> {unionCitations.length > 0 ? <span className="badge">出典あり</span> : <span className="badge">出典なし</span>}
          <dl><dt>種別</dt><dd>{union.union_type}</dd></dl>
          <button type="button" onClick={() => onDeleteUnion?.(union.id)}>この夫婦関係を削除</button>
          <details><summary>出典を追加</summary><CitationForm sources={sources} allowNewSource={false} onSubmit={(form) => saveTargetCitation(form, 'union', union.id)} /></details>
          {unionCitations.length === 0 ? <p>この夫婦関係に紐づく出典はありません。</p> : <ul className="citation-list">{unionCitations.map((citation) => {
            const source = sourceById.get(citation.source_id);
            return <li key={citation.id}><strong>{source?.title ?? '参照先資料なし'}</strong> <span className="badge">{source ? sourceTypeLabels[source.source_type] : '不明'}</span>
              <dl><dt>ページ・位置</dt><dd>{citation.page_or_location || '-'}</dd><dt>引用</dt><dd>{citation.quote_text || '-'}</dd><dt>解釈</dt><dd>{citation.interpretation || '-'}</dd><dt>確度</dt><dd>{citation.confidence ? confidenceLabels[citation.confidence] : '-'}</dd><dt>メモ</dt><dd>{citation.note || '-'}</dd></dl>
              <details><summary>編集</summary><CitationForm citation={citation} sources={sources} allowNewSource={false} onSubmit={(form) => saveTargetCitation(form, 'union', union.id, citation)} /></details>
              <button type="button" onClick={() => onDeleteCitation(citation.id)}>関係出典を削除</button>
            </li>;
          })}</ul>}
        </li>;
      })}</ul>}
    </section>
  </aside>;
}

function CitationForm({ sources, citation, allowNewSource = true, onSubmit }: { sources: Source[]; citation?: Citation; allowNewSource?: boolean; onSubmit: (form: HTMLFormElement) => void }) {
  return <form className="stack-form" onSubmit={(e) => { e.preventDefault(); onSubmit(e.currentTarget); }}>
    <label>既存資料<select name="source_id" defaultValue={citation?.source_id ?? sources[0]?.id ?? (allowNewSource ? '__new__' : '')}>{!allowNewSource && <option value="">選択してください</option>}{sources.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}{allowNewSource && <option value="__new__">新しい簡易Sourceを作成</option>}</select></label>
    {allowNewSource && <><label>新規資料名<input name="new_source_title" placeholder="既存Sourceがない場合のみ" /></label><label>新規資料種別<select name="new_source_type" defaultValue="other">{sourceTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></>}
    <label>ページ・位置<input name="page_or_location" defaultValue={citation?.page_or_location ?? ''} /></label>
    <label>引用<textarea name="quote_text" defaultValue={citation?.quote_text ?? ''} /></label>
    <label>解釈<textarea name="interpretation" defaultValue={citation?.interpretation ?? ''} /></label>
    <label>確度<select name="confidence" defaultValue={citation?.confidence ?? 'confirmed'}>{Object.entries(confidenceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>メモ<textarea name="note" defaultValue={citation?.note ?? ''} /></label>
    <button className="primary" type="submit">保存</button>
  </form>;
}


function EventForm({ sources, event, citation, onSubmit }: { sources: Source[]; event?: Event; citation?: Citation; onSubmit: (form: HTMLFormElement) => void }) {
  return <form className="stack-form" onSubmit={(e) => { e.preventDefault(); onSubmit(e.currentTarget); }}>
    <label>出来事種別<select name="event_type" defaultValue={event?.event_type ?? 'birth'}>{eventTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>日付テキスト<input name="date_text" defaultValue={event?.date_text ?? ''} /></label>
    <label>場所<input name="place_text" defaultValue={event?.place_text ?? ''} /></label>
    <label>説明<textarea name="description" defaultValue={event?.description ?? ''} /></label>
    <label>確度<select name="confidence" defaultValue={event?.confidence ?? 'confirmed'}>{Object.entries(confidenceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>メモ<textarea name="note" defaultValue={event?.note ?? ''} /></label>
    <fieldset><legend>Event出典（任意）</legend>
      <label>資料<select name="event_source_id" defaultValue={citation?.source_id ?? ''}><option value="">作成しない</option>{sources.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
      <label>ページ・位置<input name="page_or_location" defaultValue={citation?.page_or_location ?? ''} /></label>
      <label>引用<textarea name="quote_text" defaultValue={citation?.quote_text ?? ''} /></label>
      <label>解釈<textarea name="interpretation" defaultValue={citation?.interpretation ?? ''} /></label>
      <label>出典確度<select name="citation_confidence" defaultValue={citation?.confidence ?? event?.confidence ?? 'confirmed'}>{Object.entries(confidenceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>出典メモ<textarea name="citation_note" defaultValue={citation?.note ?? ''} /></label>
    </fieldset>
    <button className="primary" type="submit">Eventを保存</button>
  </form>;
}
