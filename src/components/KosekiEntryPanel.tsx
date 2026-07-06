import { useEffect, useState } from 'react';
import type { Citation, Confidence, Event, Gender, ParentChildRelation, Person, Source, SourceType, Union } from '../models';
import { sourceTypeLabels } from './SourceManager/SourceManager';
import { applyKosekiPersonEntry, createKosekiSource, kosekiSourceTypes, type KosekiEntryResult } from '../services/kosekiEntryService';

interface Props {
  persons: Person[];
  sources: Source[];
  citations: Citation[];
  relations: ParentChildRelation[];
  unions: Union[];
  events: Event[];
  onCreateSource: (source: Source) => Promise<void> | void;
  onApply: (result: KosekiEntryResult) => Promise<void> | void;
}

export function KosekiEntryPanel({ persons, sources, citations, relations, unions, events, onCreateSource, onApply }: Props) {
  const kosekiSources = sources.filter((s) => kosekiSourceTypes.includes(s.source_type));
  const [sourceId, setSourceId] = useState(kosekiSources[0]?.id ?? '');
  const [mode, setMode] = useState<'create' | 'update'>('create');
  const [personId, setPersonId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (sourceId && kosekiSources.some((source) => source.id === sourceId)) return;
    setSourceId(kosekiSources[0]?.id ?? '');
  }, [kosekiSources, sourceId]);

  const makeSource = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    try {
      const source = createKosekiSource({ title: String(fd.get('title') ?? ''), source_type: String(fd.get('source_type') ?? 'other') as SourceType, honseki_text: String(fd.get('honseki_text') ?? ''), head_of_registry: String(fd.get('head_of_registry') ?? ''), issued_date_text: String(fd.get('issued_date_text') ?? ''), obtained_date: String(fd.get('obtained_date') ?? ''), note: String(fd.get('note') ?? '') });
      await onCreateSource(source);
      setSourceId(source.id);
      setMessage('戸籍資料を作成しました。'); setError(''); form.reset();
    } catch (e) { setError(e instanceof Error ? e.message : '戸籍資料を作成できませんでした。'); }
  };

  const submitPerson = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    try {
      const result = applyKosekiPersonEntry({ persons, sources, citations, parentChildRelations: relations, unions, events }, { mode, sourceId, personId: mode === 'update' ? personId : undefined, display_name: String(fd.get('display_name') ?? ''), gender: String(fd.get('gender') ?? 'unknown') as Gender, birth_date_text: String(fd.get('birth_date_text') ?? ''), death_date_text: String(fd.get('death_date_text') ?? ''), generation_no: String(fd.get('generation_no') ?? '').trim() ? Number(fd.get('generation_no')) : undefined, rank_title: String(fd.get('rank_title') ?? ''), note: String(fd.get('note') ?? ''), confidence: String(fd.get('confidence') ?? 'confirmed') as Confidence, page_or_location: String(fd.get('page_or_location') ?? ''), quote_text: String(fd.get('quote_text') ?? ''), interpretation: String(fd.get('interpretation') ?? ''), citation_note: String(fd.get('citation_note') ?? ''), fatherId: String(fd.get('fatherId') ?? '') || undefined, motherId: String(fd.get('motherId') ?? '') || undefined, spouseId: String(fd.get('spouseId') ?? '') || undefined, createBirthEvent: fd.get('createBirthEvent') === 'on', createDeathEvent: fd.get('createDeathEvent') === 'on' });
      await onApply(result);
      setPersonId(result.person.id);
      setMode('update');
      setMessage(result.createdPerson ? '戸籍資料に基づいて人物を登録しました。' : '人物情報を更新し、出典を紐づけました。'); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : '登録できませんでした。'); }
  };

  const selectedPerson = persons.find((p) => p.id === personId);
  const relationCandidates = persons.filter((p) => p.id !== selectedPerson?.id);
  return <section className="panel koseki-entry"><h2>戸籍入力モード</h2>
    <p className="help-text">戸籍・除籍・改製原戸籍などの資料を見ながら手入力する支援モードです。OCRやAI読み取りは行わず、人物と任意作成した出生・死亡EventにCitationを紐づけます。</p>
    <p className="help-text">親子関係・配偶者関係へのCitation付与は未対応です。既存人物更新では、空欄の項目は既存値を保持します。出生Event / 死亡EventのチェックがONでも、対応する日付テキストが空の場合はEventを作成しません。</p>
    <p className="notice">v0.2 development: 戸籍入力モード最小版</p>
    {message && <p className="notice">{message}</p>}{error && <p className="error">{error}</p>}
    <label>使用する戸籍資料<select value={sourceId} onChange={(e)=>setSourceId(e.target.value)}><option value="">選択してください</option>{kosekiSources.map((s)=><option key={s.id} value={s.id}>{s.title}（{sourceTypeLabels[s.source_type]}）</option>)}</select></label>
    <details><summary>簡易Sourceを作成</summary><form className="stack-form" onSubmit={(e)=>{e.preventDefault(); void makeSource(e.currentTarget);}}>
      <label>資料名<input name="title" required /></label><label>資料種別<select name="source_type" defaultValue="current_koseki">{kosekiSourceTypes.map((t)=><option key={t} value={t}>{sourceTypeLabels[t]}</option>)}</select></label><label>本籍<input name="honseki_text" /></label><label>筆頭者<input name="head_of_registry" /></label><label>発行日・作成日<input name="issued_date_text" /></label><label>取得日<input name="obtained_date" type="date" /></label><label>メモ<textarea name="note" /></label><button className="primary" type="submit">戸籍資料を作成</button>
    </form></details>
    <form key={`${mode}-${personId}`} className="stack-form" onSubmit={(e)=>{e.preventDefault(); void submitPerson(e.currentTarget);}}>
      <label>入力モード<select value={mode} onChange={(e)=>setMode(e.target.value as 'create'|'update')}><option value="create">新規人物を追加</option><option value="update">既存人物を更新</option></select></label>
      {mode === 'update' && <label>既存人物選択<select value={personId} onChange={(e)=>setPersonId(e.target.value)}><option value="">選択してください</option>{persons.map((p)=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select></label>}
      <label>氏名<input name="display_name" defaultValue={selectedPerson?.display_name ?? ''} required={mode==='create'} /></label><label>性別<select name="gender" defaultValue={selectedPerson?.gender ?? 'unknown'}><option value="unknown">不明</option><option value="male">男性</option><option value="female">女性</option><option value="other">その他</option></select></label><label>生年月日・生年テキスト<input name="birth_date_text" defaultValue={selectedPerson?.birth_date_text ?? ''} /></label><label>没年月日・没年テキスト<input name="death_date_text" defaultValue={selectedPerson?.death_date_text ?? ''} /></label><label>世代<input name="generation_no" type="number" defaultValue={selectedPerson?.generation_no ?? ''} /></label><label>肩書・続柄メモ<input name="rank_title" defaultValue={selectedPerson?.rank_title ?? ''} /></label><label>備考<textarea name="note" defaultValue={selectedPerson?.note ?? ''} /></label><label>確度<select name="confidence" defaultValue={selectedPerson?.confidence ?? 'confirmed'}><option value="confirmed">confirmed</option><option value="likely">likely</option><option value="uncertain">uncertain</option><option value="disputed">disputed</option></select></label>
      <label>父<select name="fatherId"><option value="">選択しない</option>{relationCandidates.map((p)=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select></label><label>母<select name="motherId"><option value="">選択しない</option>{relationCandidates.map((p)=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select></label><label>配偶者<select name="spouseId"><option value="">選択しない</option>{relationCandidates.map((p)=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select></label>
      <label><input type="checkbox" name="createBirthEvent" /> 出生Eventを作成する</label><label><input type="checkbox" name="createDeathEvent" /> 死亡Eventを作成する</label><label>戸籍内の記載位置<input name="page_or_location" /></label><label>原文メモ<textarea name="quote_text" /></label><label>解釈<textarea name="interpretation" /></label><label>出典メモ<textarea name="citation_note" /></label><button className="primary" type="submit">戸籍資料に基づいて登録</button>
    </form>
  </section>;
}
