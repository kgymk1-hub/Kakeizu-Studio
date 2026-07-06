import type { Citation, Event, ImportBatch, ParentChildRelation, Person, Source, Union } from '../models';

export interface BackupData {
  schema_version: '1.0' | '1.1' | '1.2';
  exported_at: string;
  persons: Person[];
  unions: Union[];
  parent_child_relations: ParentChildRelation[];
  import_batches: ImportBatch[];
  sources: Source[];
  citations: Citation[];
  events: Event[];
}

type BackupInput = Omit<BackupData, 'schema_version' | 'exported_at' | 'events'> & { events?: Event[] };

export function createJsonBackup(data: BackupInput) {
  return JSON.stringify({ schema_version: '1.2', exported_at: new Date().toISOString(), ...data, events: data.events ?? [] }, null, 2);
}

export function parseJsonBackup(json: string): BackupData {
  const data = JSON.parse(json) as Partial<BackupData>;
  if (data.schema_version !== '1.0' && data.schema_version !== '1.1' && data.schema_version !== '1.2') throw new Error('Unsupported schema_version');
  return {
    schema_version: data.schema_version,
    exported_at: data.exported_at ?? new Date().toISOString(),
    persons: data.persons ?? [],
    unions: data.unions ?? [],
    parent_child_relations: data.parent_child_relations ?? [],
    import_batches: data.import_batches ?? [],
    sources: data.sources ?? [],
    citations: data.citations ?? [],
    events: data.events ?? [],
  };
}
