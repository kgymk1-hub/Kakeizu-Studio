import Dexie, { type Table } from 'dexie';
import type { ImportBatch, ParentChildRelation, Person, Union } from '../models';
export class KakeizuDb extends Dexie { persons!: Table<Person,string>; unions!: Table<Union,string>; parentChildRelations!: Table<ParentChildRelation,string>; importBatches!: Table<ImportBatch,string>; constructor(){ super('kakeizu_studio'); this.version(1).stores({ persons:'id, external_id, display_name, import_batch_id', unions:'id, external_id, partner1_id, partner2_id, import_batch_id', parentChildRelations:'id, external_id, parent_id, child_id, union_id, import_batch_id', importBatches:'id, imported_at, import_type' }); }}
export const db = new KakeizuDb();
