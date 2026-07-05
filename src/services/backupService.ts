import type { ImportBatch, ParentChildRelation, Person, Union } from '../models';
export interface BackupData { schema_version: '1.0'; exported_at: string; persons: Person[]; unions: Union[]; parent_child_relations: ParentChildRelation[]; import_batches: ImportBatch[]; }
export function createJsonBackup(data: Omit<BackupData,'schema_version'|'exported_at'>) { return JSON.stringify({ schema_version:'1.0', exported_at:new Date().toISOString(), ...data }, null, 2); }
export function parseJsonBackup(json: string): BackupData { const data = JSON.parse(json) as BackupData; if (data.schema_version !== '1.0') throw new Error('Unsupported schema_version'); return data; }
