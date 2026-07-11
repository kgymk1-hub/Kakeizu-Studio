import type { ImportBatch } from '../models';

type ImportHistoryPanelProps = {
  batches: ImportBatch[];
};

const importBatchDate = (batch: ImportBatch) => new Date(batch.created_at ?? batch.imported_at).toLocaleString();
const importBatchCounts = (batch: ImportBatch) => batch.imported_counts ?? { persons: batch.imported_count, unions: 0, relations: 0, events: 0, sources: 0, citations: 0 };
const importBatchPolicyLabel = (batch: ImportBatch) => batch.import_policy === 'replace_all' ? '全置換' : batch.import_policy ?? '-';

export function ImportHistoryPanel({ batches }: ImportHistoryPanelProps) {
  return <section className="panel"><h2>インポート履歴</h2>{batches.length === 0 ? <p>インポート履歴はまだありません。</p> : <ul className="compact-list import-history">{batches.map((batch)=>{ const counts = importBatchCounts(batch); return <li key={batch.id}><strong>{importBatchDate(batch)}</strong><br/>{batch.source_label ?? batch.source_name ?? batch.import_type} / {importBatchPolicyLabel(batch)} / {batch.status ?? 'completed'}<br/>Person {counts.persons} / Union {counts.unions} / Relation {counts.relations} / Source {counts.sources} / Citation {counts.citations} / Event {counts.events}<br/>warning {batch.warning_count} / error {batch.error_count} / 参照先不明 {batch.unresolved_reference_count ?? 0} / 仮人物候補 {batch.placeholder_person_candidate_count ?? 0}{batch.file_names?.length ? <><br/>ファイル: {batch.file_names.join(', ')}</> : null}</li>; })}</ul>}</section>;
}
