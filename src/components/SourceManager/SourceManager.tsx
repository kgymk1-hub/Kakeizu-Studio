import type { Source, SourceType } from '../../models';

export const sourceTypeLabels: Record<SourceType, string> = {
  current_koseki: '現在戸籍',
  joseki: '除籍',
  kaisei_genkoseki: '改製原戸籍',
  website: 'Web',
  book: '書籍',
  interview: '聞き取り',
  ai_generated: 'AI生成',
  other: 'その他',
};

export const sourceTypeOptions = Object.entries(sourceTypeLabels) as [SourceType, string][];

const emptySource = (): Source => {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), source_type: 'other', title: '', created_at: now, updated_at: now };
};

interface Props {
  sources: Source[];
  onSave: (source: Source) => void;
  onDelete: (sourceId: string) => void;
}

export function SourceManager({ sources, onSave, onDelete }: Props) {
  const save = (form: HTMLFormElement, existing?: Source) => {
    const fd = new FormData(form);
    const now = new Date().toISOString();
    onSave({
      ...(existing ?? emptySource()),
      title: String(fd.get('title') ?? '').trim(),
      source_type: String(fd.get('source_type') ?? 'other') as SourceType,
      url: String(fd.get('url') ?? '').trim() || undefined,
      author_or_issuer: String(fd.get('author_or_issuer') ?? '').trim() || undefined,
      issued_date_text: String(fd.get('issued_date_text') ?? '').trim() || undefined,
      obtained_date: String(fd.get('obtained_date') ?? '').trim() || undefined,
      note: String(fd.get('note') ?? '').trim() || undefined,
      updated_at: now,
      created_at: existing?.created_at ?? now,
    });
    form.reset();
  };

  return <section className="panel source-manager"><h2>資料一覧</h2>
    <p className="help-text">資料は、戸籍・Webページ・書籍・聞き取りなど、根拠となる情報源の登録場所です。人物への紐づけは右側の「出典」で行います。</p>
    <details><summary>資料追加</summary><SourceForm onSubmit={(form) => save(form)} /></details>
    {sources.length === 0 ? <p>資料はまだ登録されていません。まず戸籍、Webページ、書籍、聞き取りなどの根拠資料を追加してください。</p> : <ul className="source-list">{sources.map((source) => <li key={source.id}>
      <div><strong>{source.title}</strong><span className="badge">{sourceTypeLabels[source.source_type]}</span></div>
      <small>{source.url ? 'URLあり' : source.note ? 'メモあり' : 'URL/メモなし'} / 登録日 {source.created_at.slice(0, 10)}</small>
      <details><summary>編集</summary><SourceForm source={source} onSubmit={(form) => save(form, source)} /></details>
      <button type="button" onClick={() => { if(confirm('この資料と関連出典を削除します。よろしいですか？')) onDelete(source.id); }}>削除</button>
    </li>)}</ul>}
  </section>;
}

function SourceForm({ source, onSubmit }: { source?: Source; onSubmit: (form: HTMLFormElement) => void }) {
  return <form className="stack-form" onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; onSubmit(form); }}>
    <label>資料名<input name="title" defaultValue={source?.title ?? ''} required /></label>
    <label>資料種別<select name="source_type" defaultValue={source?.source_type ?? 'other'}>{sourceTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>URL<input name="url" type="url" defaultValue={source?.url ?? ''} /></label>
    <label>発行者<input name="author_or_issuer" defaultValue={source?.author_or_issuer ?? ''} /></label>
    <label>発行日<input name="issued_date_text" defaultValue={source?.issued_date_text ?? ''} /></label>
    <label>取得日<input name="obtained_date" type="date" defaultValue={source?.obtained_date ?? ''} /></label>
    <label>メモ<textarea name="note" defaultValue={source?.note ?? ''} /></label>
    <button className="primary" type="submit">保存</button>
  </form>;
}
