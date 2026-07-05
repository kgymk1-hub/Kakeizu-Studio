import type { Citation, Person, Source } from '../../models';
import { sourceTypeLabels, sourceTypeOptions } from '../SourceManager/SourceManager';

interface Props {
  person?: Person;
  sources: Source[];
  citations: Citation[];
  onChange: (p: Person) => void;
  onSaveCitation: (citation: Citation, newSource?: Source) => void;
  onDeleteCitation: (citationId: string) => void;
}

const confidenceLabels = { confirmed: '確認済み', likely: '有力', uncertain: '不確か', disputed: '異説あり' } as const;

export function PersonDetailPanel({ person, sources, citations, onChange, onSaveCitation, onDeleteCitation }: Props) {
  if (!person) return <aside className="detail"><h2>人物詳細</h2><p>人物ノードをクリックしてください。</p></aside>;
  const personCitations = citations.filter((c) => c.target_type === 'person' && c.target_id === person.id);
  const sourceById = new Map(sources.map((s) => [s.id, s]));
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

  return <aside className="detail"><h2>人物詳細 {personCitations.length > 0 && <span className="badge">出典あり</span>}</h2>
    <label>表示名<input value={person.display_name} onChange={(e)=>update('display_name',e.target.value)}/></label>
    <label>生年月日<input value={person.birth_date_text ?? ''} onChange={(e)=>update('birth_date_text',e.target.value)}/></label>
    <label>没年月日<input value={person.death_date_text ?? ''} onChange={(e)=>update('death_date_text',e.target.value)}/></label>
    <label>称号<input value={person.rank_title ?? ''} onChange={(e)=>update('rank_title',e.target.value)}/></label>
    <label>備考<textarea value={person.note ?? ''} onChange={(e)=>update('note',e.target.value)}/></label>
    <section className="citation-section"><h3>出典</h3>
      <details><summary>この人物に出典を追加</summary><CitationForm sources={sources} onSubmit={(form) => saveCitation(form)} /></details>
      {personCitations.length === 0 ? <p>この人物に紐づく出典はありません。</p> : <ul className="citation-list">{personCitations.map((citation) => {
        const source = sourceById.get(citation.source_id);
        return <li key={citation.id}><strong>{source?.title ?? '不明な資料'}</strong> <span className="badge">{source ? sourceTypeLabels[source.source_type] : '不明'}</span>
          <dl><dt>ページ・位置</dt><dd>{citation.page_or_location || '-'}</dd><dt>引用</dt><dd>{citation.quote_text || '-'}</dd><dt>解釈</dt><dd>{citation.interpretation || '-'}</dd><dt>確度</dt><dd>{citation.confidence ? confidenceLabels[citation.confidence] : '-'}</dd><dt>メモ</dt><dd>{citation.note || '-'}</dd></dl>
          <details><summary>編集</summary><CitationForm citation={citation} sources={sources} onSubmit={(form) => saveCitation(form, citation)} /></details>
          <button type="button" onClick={() => onDeleteCitation(citation.id)}>出典紐づけを削除</button>
        </li>;
      })}</ul>}
    </section>
  </aside>;
}

function CitationForm({ sources, citation, onSubmit }: { sources: Source[]; citation?: Citation; onSubmit: (form: HTMLFormElement) => void }) {
  return <form className="stack-form" onSubmit={(e) => { e.preventDefault(); onSubmit(e.currentTarget); }}>
    <label>既存Source<select name="source_id" defaultValue={citation?.source_id ?? sources[0]?.id ?? '__new__'}>{sources.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}<option value="__new__">新しい簡易Sourceを作成</option></select></label>
    <label>新規資料名<input name="new_source_title" placeholder="既存Sourceがない場合のみ" /></label>
    <label>新規資料種別<select name="new_source_type" defaultValue="other">{sourceTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>ページ・位置<input name="page_or_location" defaultValue={citation?.page_or_location ?? ''} /></label>
    <label>引用<textarea name="quote_text" defaultValue={citation?.quote_text ?? ''} /></label>
    <label>解釈<textarea name="interpretation" defaultValue={citation?.interpretation ?? ''} /></label>
    <label>確度<select name="confidence" defaultValue={citation?.confidence ?? 'confirmed'}>{Object.entries(confidenceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>メモ<textarea name="note" defaultValue={citation?.note ?? ''} /></label>
    <button className="primary" type="submit">保存</button>
  </form>;
}
