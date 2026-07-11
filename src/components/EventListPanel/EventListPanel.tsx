import { useMemo, useState } from 'react';
import type { Event, EventType, ParentChildRelation, Person, SelectableTarget, Union } from '../../models';
import { EmptyState } from '../common/EmptyState';
import { eventTypeOptions, filterEvents, resolveEventTargetSummary } from './eventListFilter';

interface Props {
  events: Event[];
  persons: Person[];
  unions: Union[];
  relations: ParentChildRelation[];
  onSelectTarget: (target: SelectableTarget) => void;
}

const labelAll = (value: string) => value === 'all' ? 'すべて' : value;
const trimNote = (note: string) => note.length > 64 ? `${note.slice(0, 64)}…` : note;

export function EventListPanel({ events, persons, unions, relations, onSelectTarget }: Props) {
  const [query, setQuery] = useState('');
  const [eventType, setEventType] = useState<'all' | EventType>('all');
  const data = useMemo(() => ({ persons, unions, relations }), [persons, unions, relations]);
  const filteredEvents = useMemo(() => filterEvents(events, data, { query, event_type: eventType }), [events, data, query, eventType]);

  return <section className="panel list-panel event-list-panel" aria-labelledby="event-list-heading">
    <h2 id="event-list-heading">出来事（Event）一覧</h2>
    <div className="list-panel-controls event-list-controls">
      <label className="event-search-label">検索<input type="text" value={query} placeholder="種別・日付・説明・備考・関連人物名" onInput={(e) => setQuery(e.currentTarget.value)} /></label>
      <label>出来事種別<select value={eventType} onChange={(e) => setEventType(e.target.value as 'all' | EventType)}>{eventTypeOptions.map((value) => <option key={value} value={value}>{labelAll(value)}</option>)}</select></label>
    </div>
    <p className="list-panel-count event-list-count">{filteredEvents.length} / {events.length} 件を表示</p>
    {filteredEvents.length === 0 ? <EmptyState className="notice list-panel-empty">条件に一致する出来事がありません。</EmptyState> : <ul className="list-card-list event-list-cards">
      {filteredEvents.map((event) => {
        const target = resolveEventTargetSummary(event, data);
        return <li key={event.id}>
          <button type="button" className="list-card list-card-clickable event-list-card" onClick={() => onSelectTarget({ target_type: 'event', target_id: event.id })}>
            <span className="event-card-main"><strong>{event.event_type}</strong><span>{event.date_text || '日付未入力'} / {target.label}</span></span>
            <span className="list-card-meta event-card-meta"><span>{event.description || '説明未入力'}</span><span>{event.confidence ?? 'confirmed'} / {event.review_status ?? 'unreviewed'} / {event.target_type}</span></span>
            {target.broken && <span className="event-card-warning">参照状態を確認してください</span>}
            {event.note && <span className="event-card-note">{trimNote(event.note)}</span>}
          </button>
        </li>;
      })}
    </ul>}
  </section>;
}
