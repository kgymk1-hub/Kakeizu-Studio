import { useMemo, useState } from 'react';
import type { Citation, CitationTargetType, Event, Name, ParentChildRelation, Person, Place, SelectableTarget, Source, SourceType, Union } from '../../models';
import { citationTargetTypeOptions, filterCitations, filterSources, resolveCitationTargetSummary, sourceTypeOptions } from './sourceCitationFilter';

interface Props { sources: Source[]; citations: Citation[]; persons: Person[]; events: Event[]; unions: Union[]; relations: ParentChildRelation[]; names?: Name[]; places?: Place[]; onSelectTarget: (target: SelectableTarget) => void; }
const labelAll = (value: string) => value === 'all' ? 'すべて' : value;
const trim = (value = '', length = 56) => value.length > length ? `${value.slice(0, length)}…` : value;
const targetToSelectable = (citation: Citation): SelectableTarget | undefined => ['person', 'event', 'union', 'relation', 'name', 'place'].includes(citation.target_type) ? { target_type: citation.target_type as SelectableTarget['target_type'], target_id: citation.target_id } : undefined;

export function SourceCitationPanel({ sources, citations, persons, events, unions, relations, names = [], places = [], onSelectTarget }: Props) {
  const [query, setQuery] = useState('');
  const [sourceType, setSourceType] = useState<'all' | SourceType>('all');
  const [targetType, setTargetType] = useState<'all' | CitationTargetType>('all');
  const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>();
  const data = useMemo(() => ({ sources, persons, events, unions, relations, names, places }), [sources, persons, events, unions, relations, names, places]);
  const filteredSources = useMemo(() => filterSources(sources, { query, source_type: sourceType }), [sources, query, sourceType]);
  const filteredCitations = useMemo(() => filterCitations(citations, data, { query, target_type: targetType, source_id: selectedSourceId }), [citations, data, query, targetType, selectedSourceId]);

  return <section className="panel list-panel source-citation-panel" aria-labelledby="source-citation-heading">
    <h2 id="source-citation-heading">Source / Citation一覧</h2>
    <div className="list-panel-controls source-citation-controls">
      <label className="source-citation-search-label">検索<input type="text" value={query} placeholder="資料タイトル・メモ・URL・引用文・解釈・対象名" onInput={(e) => setQuery(e.currentTarget.value)} /></label>
      <label>source_type<select value={sourceType} onChange={(e) => setSourceType(e.target.value as 'all' | SourceType)}>{sourceTypeOptions.map((value) => <option key={value} value={value}>{labelAll(value)}</option>)}</select></label>
      <label>target_type<select value={targetType} onChange={(e) => setTargetType(e.target.value as 'all' | CitationTargetType)}>{citationTargetTypeOptions.map((value) => <option key={value} value={value}>{labelAll(value)}</option>)}</select></label>
    </div>
    <div className="source-citation-section"><h3>Source一覧</h3><p className="list-panel-count source-citation-count">{filteredSources.length} / {sources.length} 件のSourceを表示</p>{filteredSources.length === 0 ? <p className="notice list-panel-empty">条件に一致するSourceがありません。</p> : <ul className="list-card-list source-citation-cards">{filteredSources.map((source) => <li key={source.id}><button type="button" className={`list-card list-card-clickable source-citation-card${selectedSourceId === source.id ? ' selected-list' : ''}`} onClick={() => setSelectedSourceId((current) => current === source.id ? undefined : source.id)}><span className="source-citation-main"><strong>{source.title}</strong><span>{source.source_type} / {source.author_or_issuer || '作成者未入力'} / {source.issued_date_text || '発行日未入力'}</span></span><span className="list-card-meta source-citation-meta">保管: {source.repository || '未入力'} / 本籍: {source.honseki_text || '未入力'} / 筆頭者: {source.head_of_registry || '未入力'} / URL: {source.url ? 'あり' : 'なし'}</span>{source.note && <span className="source-citation-note">{trim(source.note)}</span>}</button></li>)}</ul>}</div>
    <div className="source-citation-section"><h3>Citation一覧</h3>{selectedSourceId && <p><button type="button" onClick={() => setSelectedSourceId(undefined)}>Source絞り込みを解除</button></p>}<p className="list-panel-count source-citation-count">{filteredCitations.length} / {citations.length} 件のCitationを表示</p>{filteredCitations.length === 0 ? <p className="notice list-panel-empty">条件に一致するCitationがありません。</p> : <ul className="list-card-list source-citation-cards">{filteredCitations.map((citation) => { const source = sources.find((item) => item.id === citation.source_id); const target = resolveCitationTargetSummary(citation, data); const selectable = targetToSelectable(citation); return <li key={citation.id}><button type="button" className={`list-card ${selectable ? 'list-card-clickable' : 'list-card-disabled'} source-citation-card`} disabled={!selectable} aria-label={selectable ? 'Citationの対象へ移動' : '対象へ移動不可'} onClick={() => { if (selectable) onSelectTarget(selectable); }}><span className="source-citation-main"><strong>{source?.title ?? '参照先資料なし'}</strong><span>{citation.target_type} / {target.label} / {citation.page_or_location || '位置未入力'}</span></span><span className="list-card-meta source-citation-meta">confidence: {citation.confidence ?? '未入力'}</span>{target.broken && <span className="source-citation-warning">参照状態を確認してください</span>}{citation.quote_text && <span className="source-citation-note">引用: {trim(citation.quote_text)}</span>}{citation.interpretation && <span className="source-citation-note">解釈: {trim(citation.interpretation)}</span>}{citation.note && <span className="source-citation-note">備考: {trim(citation.note)}</span>}</button></li>; })}</ul>}</div>
  </section>;
}
