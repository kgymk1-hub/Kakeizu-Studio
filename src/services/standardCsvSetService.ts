import Papa from 'papaparse';
import type { Citation, Event, ImportBatch, ParentChildRelation, Person, Source, Union, ValidationIssue } from '../models';

export const STANDARD_CSV_SET_FORMAT = 'kakeizu_standard_csv_set';
export const STANDARD_CSV_SET_FILES = ['persons.csv', 'unions.csv', 'parent_child_relations.csv', 'sources.csv', 'citations.csv', 'events.csv'] as const;
const BOM = '\uFEFF';

export const STANDARD_CSV_COLUMNS = {
  persons: ['id','external_id','name','gender','birth_date','death_date','generation_no','title','note','confidence','created_at','updated_at'],
  unions: ['id','external_id','partner1_id','partner2_id','union_type','start_date','end_date','note','created_at','updated_at'],
  parent_child_relations: ['id','parent_id','child_id','relation_type','confidence','note','created_at','updated_at'],
  sources: ['id','external_id','source_type','title','author_or_issuer','issued_date_text','obtained_date','repository','honseki_text','head_of_registry','registry_type','source_text','url','privacy_level','note','import_batch_id','created_at','updated_at'],
  citations: ['id','external_id','source_id','target_type','target_id','page_or_location','quote_text','interpretation','confidence','note','import_batch_id','created_at','updated_at'],
  events: ['id','external_id','event_type','target_type','target_id','date_text','date_from','date_to','place_text','description','confidence','review_status','note','import_batch_id','created_at','updated_at'],
} as const;

export interface StandardCsvSetData { persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; sources: Source[]; citations: Citation[]; events: Event[]; importBatches: ImportBatch[]; }
export interface StandardCsvSetPreview extends StandardCsvSetData { issues: ValidationIssue[]; counts: { persons:number; unions:number; parent_child_relations:number; sources:number; citations:number; events:number; warnings:number; errors:number }; }
export type StandardCsvSetTextFiles = Record<string, string>;

function csv<T extends Record<string, unknown>>(fields: readonly string[], rows: T[]) { return BOM + Papa.unparse({ fields: [...fields], data: rows }, { columns: [...fields], newline: '\r\n' }); }
const v = (x: unknown) => x == null ? '' : String(x);
const opt = (x: unknown) => v(x) || undefined;
const num = (x: unknown) => v(x) ? Number(v(x)) : undefined;

export function buildStandardCsvSetFiles(data: Omit<StandardCsvSetData, 'importBatches' | 'events'> & { events?: Event[] }): StandardCsvSetTextFiles {
  const manifest = JSON.stringify({ app:'Kakeizu Studio', format:STANDARD_CSV_SET_FORMAT, schema_version:'1.0', exported_at:new Date().toISOString(), files:[...STANDARD_CSV_SET_FILES] }, null, 2);
  return {
    'manifest.json': manifest,
    'persons.csv': csv(STANDARD_CSV_COLUMNS.persons, data.persons.map(p => ({ id:p.id, external_id:p.external_id ?? '', name:p.display_name, gender:p.gender ?? '', birth_date:p.birth_date_text ?? '', death_date:p.death_date_text ?? '', generation_no:p.generation_no ?? '', title:p.rank_title ?? '', note:p.note ?? '', confidence:p.confidence ?? '', created_at:p.created_at, updated_at:p.updated_at }))),
    'unions.csv': csv(STANDARD_CSV_COLUMNS.unions, data.unions.map(u => ({ id:u.id, external_id:u.external_id ?? '', partner1_id:u.partner1_id, partner2_id:u.partner2_id ?? '', union_type:u.union_type, start_date:u.marriage_date_text ?? '', end_date:u.end_date_text ?? u.divorce_date_text ?? '', note:u.note ?? '', created_at:u.created_at, updated_at:u.updated_at }))),
    'parent_child_relations.csv': csv(STANDARD_CSV_COLUMNS.parent_child_relations, data.parentChildRelations.map(r => ({ id:r.id, parent_id:r.parent_id, child_id:r.child_id, relation_type:r.relation_type, confidence:r.confidence ?? '', note:r.note ?? '', created_at:r.created_at, updated_at:r.updated_at }))),
    'sources.csv': csv(STANDARD_CSV_COLUMNS.sources, data.sources.map(s => ({ ...Object.fromEntries(STANDARD_CSV_COLUMNS.sources.map(k => [k, v((s as unknown as Record<string, unknown>)[k])] )) }))),
    'citations.csv': csv(STANDARD_CSV_COLUMNS.citations, data.citations.map(c => ({ ...Object.fromEntries(STANDARD_CSV_COLUMNS.citations.map(k => [k, v((c as unknown as Record<string, unknown>)[k])] )) }))),
    'events.csv': csv(STANDARD_CSV_COLUMNS.events, (data.events ?? []).map(ev => ({ ...Object.fromEntries(STANDARD_CSV_COLUMNS.events.map(k => [k, v((ev as unknown as Record<string, unknown>)[k])] )) }))),
  };
}

const te = new TextEncoder(); const td = new TextDecoder();
let crcTable: Uint32Array | undefined;
function crc32(buf: Uint8Array) { crcTable ??= Uint32Array.from({length:256},(_,n)=>{let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1); return c>>>0;}); let c=0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function u16(n:number){ const b=new Uint8Array(2); new DataView(b.buffer).setUint16(0,n,true); return b; } function u32(n:number){ const b=new Uint8Array(4); new DataView(b.buffer).setUint32(0,n,true); return b; }
function concat(parts: Uint8Array[]) { const out = new Uint8Array(parts.reduce((s,p)=>s+p.length,0)); let o=0; for (const p of parts){ out.set(p,o); o+=p.length; } return out; }

export function createStoredZip(files: StandardCsvSetTextFiles) {
  const locals: Uint8Array[] = []; const centrals: Uint8Array[] = []; let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const nameBytes = te.encode(name), data = te.encode(text), crc = crc32(data);
    const local = concat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nameBytes.length),u16(0),nameBytes,data]);
    locals.push(local);
    centrals.push(concat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nameBytes.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nameBytes]));
    offset += local.length;
  }
  const central = concat(centrals); const end = concat([u32(0x06054b50),u16(0),u16(0),u16(centrals.length),u16(centrals.length),u32(central.length),u32(offset),u16(0)]);
  return new Blob([concat([...locals, central, end])], { type:'application/zip' });
}

export async function createStandardCsvSetZip(data: Omit<StandardCsvSetData, 'importBatches' | 'events'> & { events?: Event[] }) { return createStoredZip(buildStandardCsvSetFiles(data)); }

export function readStoredZip(bytes: Uint8Array): StandardCsvSetTextFiles {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); const files: StandardCsvSetTextFiles = {}; let p = 0;
  while (p + 30 <= bytes.length && dv.getUint32(p,true) === 0x04034b50) {
    const method = dv.getUint16(p+8,true), comp = dv.getUint32(p+18,true), uncomp = dv.getUint32(p+22,true), nlen = dv.getUint16(p+26,true), xlen = dv.getUint16(p+28,true);
    const name = td.decode(bytes.slice(p+30,p+30+nlen)); const start = p+30+nlen+xlen; if (method !== 0) throw new Error('圧縮されたZIPは未対応です。標準CSVセットは無圧縮ZIPで読み込んでください。');
    files[name] = td.decode(bytes.slice(start, start + comp)).replace(/^\uFEFF/, ''); p = start + comp; if (comp !== uncomp) throw new Error('ZIPサイズ情報が不正です。');
  }
  return files;
}

function parseRows(text: string) { const parsed = Papa.parse<Record<string,string>>(text.replace(/^\uFEFF/, ''), { header:true, skipEmptyLines:true, transformHeader:h=>h.trim() }); return { rows: parsed.data, errors: parsed.errors }; }
function req(row: Record<string,string>, field:string, file:string, rowNo:number, issues:ValidationIssue[]) { const value = v(row[field]).trim(); if (!value) issues.push({ severity:'error', code:'required', message:`${file} ${field} は必須です。`, row:rowNo, field }); return value; }

export function validateStandardCsvSet(files: StandardCsvSetTextFiles): StandardCsvSetPreview {
  const issues: ValidationIssue[] = [];
  if (!files['manifest.json']) issues.push({ severity:'error', code:'missing_manifest', message:'manifest.json がありません。' });
  else { try { const m = JSON.parse(files['manifest.json']); if (m.format !== STANDARD_CSV_SET_FORMAT) issues.push({ severity:'error', code:'invalid_format', message:'manifest.json のformatが標準CSVセットではありません。' }); } catch { issues.push({ severity:'error', code:'invalid_manifest', message:'manifest.json を読み込めません。' }); } }
  for (const f of STANDARD_CSV_SET_FILES) if (!files[f] && f !== 'events.csv') issues.push({ severity:'error', code:'missing_csv', message:`${f} がありません。` });
  const now = new Date().toISOString();
  const prs = files['persons.csv'] ? parseRows(files['persons.csv']) : { rows:[], errors:[] }; prs.errors.forEach(e=>issues.push({severity:'error',code:'csv_parse_error',message:e.message,row:e.row}));
  const persons = prs.rows.map((r,i): Person => ({ id:req(r,'id','persons.csv',i+2,issues), external_id:opt(r.external_id), display_name:req(r,'name','persons.csv',i+2,issues), gender:opt(r.gender) as Person['gender'], birth_date_text:opt(r.birth_date), death_date_text:opt(r.death_date), generation_no:num(r.generation_no), rank_title:opt(r.title), note:opt(r.note), confidence:opt(r.confidence) as Person['confidence'], created_at:opt(r.created_at) ?? now, updated_at:opt(r.updated_at) ?? now }));
  const personIds = new Set(persons.map(p=>p.id));
  const urs = files['unions.csv'] ? parseRows(files['unions.csv']) : { rows:[], errors:[] }; const unions = urs.rows.map((r,i): Union => ({ id:req(r,'id','unions.csv',i+2,issues), external_id:opt(r.external_id), partner1_id:req(r,'partner1_id','unions.csv',i+2,issues), partner2_id:opt(r.partner2_id), union_type:(opt(r.union_type) as Union['union_type']) ?? 'unknown', marriage_date_text:opt(r.start_date), end_date_text:opt(r.end_date), note:opt(r.note), created_at:opt(r.created_at) ?? now, updated_at:opt(r.updated_at) ?? now })); urs.errors.forEach(e=>issues.push({severity:'error',code:'csv_parse_error',message:e.message,row:e.row}));
  const unionIds = new Set(unions.map(u=>u.id));
  const rrs = files['parent_child_relations.csv'] ? parseRows(files['parent_child_relations.csv']) : { rows:[], errors:[] }; const parentChildRelations = rrs.rows.map((r,i): ParentChildRelation => ({ id:req(r,'id','parent_child_relations.csv',i+2,issues), parent_id:req(r,'parent_id','parent_child_relations.csv',i+2,issues), child_id:req(r,'child_id','parent_child_relations.csv',i+2,issues), relation_type:(opt(r.relation_type) as ParentChildRelation['relation_type']) ?? 'unknown', confidence:opt(r.confidence) as ParentChildRelation['confidence'], note:opt(r.note), created_at:opt(r.created_at) ?? now, updated_at:opt(r.updated_at) ?? now })); rrs.errors.forEach(e=>issues.push({severity:'error',code:'csv_parse_error',message:e.message,row:e.row}));
  const relationIds = new Set(parentChildRelations.map(r=>r.id));
  const srs = files['sources.csv'] ? parseRows(files['sources.csv']) : { rows:[], errors:[] }; const sources = srs.rows.map((r,i): Source => ({ id:req(r,'id','sources.csv',i+2,issues), external_id:opt(r.external_id), source_type:(opt(r.source_type) as Source['source_type']) ?? 'other', title:req(r,'title','sources.csv',i+2,issues), author_or_issuer:opt(r.author_or_issuer), issued_date_text:opt(r.issued_date_text), obtained_date:opt(r.obtained_date), repository:opt(r.repository), honseki_text:opt(r.honseki_text), head_of_registry:opt(r.head_of_registry), registry_type:opt(r.registry_type), source_text:opt(r.source_text), url:opt(r.url), privacy_level:opt(r.privacy_level) as Source['privacy_level'], note:opt(r.note), import_batch_id:opt(r.import_batch_id), created_at:opt(r.created_at) ?? now, updated_at:opt(r.updated_at) ?? now })); srs.errors.forEach(e=>issues.push({severity:'error',code:'csv_parse_error',message:e.message,row:e.row}));
  const sourceIds = new Set(sources.map(s=>s.id));
  const ers = files['events.csv'] ? parseRows(files['events.csv']) : { rows:[], errors:[] }; const events = ers.rows.map((r,i): Event => ({ id:req(r,'id','events.csv',i+2,issues), external_id:opt(r.external_id), event_type:(req(r,'event_type','events.csv',i+2,issues) as Event['event_type']), target_type:(req(r,'target_type','events.csv',i+2,issues) as Event['target_type']), target_id:req(r,'target_id','events.csv',i+2,issues), date_text:opt(r.date_text), date_from:opt(r.date_from), date_to:opt(r.date_to), place_text:opt(r.place_text), description:opt(r.description), confidence:opt(r.confidence) as Event['confidence'], review_status:opt(r.review_status) as Event['review_status'], note:opt(r.note), import_batch_id:opt(r.import_batch_id), created_at:opt(r.created_at) ?? now, updated_at:opt(r.updated_at) ?? now })); ers.errors.forEach(e=>issues.push({severity:'error',code:'csv_parse_error',message:e.message,row:e.row}));
  const eventIds = new Set(events.map(e=>e.id));
  const crs = files['citations.csv'] ? parseRows(files['citations.csv']) : { rows:[], errors:[] }; const citations = crs.rows.map((r,i): Citation => ({ id:req(r,'id','citations.csv',i+2,issues), external_id:opt(r.external_id), source_id:req(r,'source_id','citations.csv',i+2,issues), target_type:(req(r,'target_type','citations.csv',i+2,issues) as Citation['target_type']), target_id:req(r,'target_id','citations.csv',i+2,issues), page_or_location:opt(r.page_or_location), quote_text:opt(r.quote_text), interpretation:opt(r.interpretation), confidence:opt(r.confidence) as Citation['confidence'], note:opt(r.note), import_batch_id:opt(r.import_batch_id), created_at:opt(r.created_at) ?? now, updated_at:opt(r.updated_at) ?? now })); crs.errors.forEach(e=>issues.push({severity:'error',code:'csv_parse_error',message:e.message,row:e.row}));
  unions.forEach((u,i)=>{ if(u.partner1_id && !personIds.has(u.partner1_id)) issues.push({severity:'error',code:'missing_person_ref',message:`unions.partner1_id ${u.partner1_id} が存在しません。`,row:i+2,field:'partner1_id'}); if(u.partner2_id && !personIds.has(u.partner2_id)) issues.push({severity:'error',code:'missing_person_ref',message:`unions.partner2_id ${u.partner2_id} が存在しません。`,row:i+2,field:'partner2_id'}); });
  parentChildRelations.forEach((r,i)=>{ if(r.parent_id && !personIds.has(r.parent_id)) issues.push({severity:'error',code:'missing_person_ref',message:`parent_id ${r.parent_id} が存在しません。`,row:i+2,field:'parent_id'}); if(r.child_id && !personIds.has(r.child_id)) issues.push({severity:'error',code:'missing_person_ref',message:`child_id ${r.child_id} が存在しません。`,row:i+2,field:'child_id'}); });
  events.forEach((e,i)=>{ if(e.target_type==='person' && !personIds.has(e.target_id)) issues.push({severity:'error',code:'missing_person_ref',message:`event.target_id ${e.target_id} が存在しません。`,row:i+2,field:'target_id'}); else if(e.target_type==='union' && !unionIds.has(e.target_id)) issues.push({severity:'error',code:'missing_union_ref',message:`event.target_id ${e.target_id} が存在しません。`,row:i+2,field:'target_id'}); else if(e.target_type==='relation' && !relationIds.has(e.target_id)) issues.push({severity:'error',code:'missing_relation_ref',message:`event.target_id ${e.target_id} が存在しません。`,row:i+2,field:'target_id'}); });
  citations.forEach((c,i)=>{ if(c.source_id && !sourceIds.has(c.source_id)) issues.push({severity:'error',code:'missing_source_ref',message:`citation.source_id ${c.source_id} が存在しません。`,row:i+2,field:'source_id'}); if(c.target_type==='person' && !personIds.has(c.target_id)) issues.push({severity:'error',code:'missing_person_ref',message:`citation.target_id ${c.target_id} が存在しません。`,row:i+2,field:'target_id'}); else if(c.target_type==='union' && !unionIds.has(c.target_id)) issues.push({severity:'error',code:'missing_union_ref',message:`citation.target_id ${c.target_id} が存在しません。`,row:i+2,field:'target_id'}); else if(c.target_type==='relation' && !relationIds.has(c.target_id)) issues.push({severity:'error',code:'missing_relation_ref',message:`citation.target_id ${c.target_id} が存在しません。`,row:i+2,field:'target_id'}); else if(c.target_type==='event' && !eventIds.has(c.target_id)) issues.push({severity:'error',code:'missing_event_ref',message:`citation.target_id ${c.target_id} が存在しません。`,row:i+2,field:'target_id'}); else if(['name','place'].includes(c.target_type)) issues.push({severity:'warning',code:'unsupported_target_type',message:`${c.target_type} は将来用target_typeとして読み込みますが、参照先データは未実装です。`,row:i+2,field:'target_type'}); });
  const importBatch: ImportBatch = { id:`csv-standard-${Date.now()}`, imported_at:now, import_type:'csv_standard', source_name:'kakeizu_standard_csv_set.zip', imported_count:persons.length, warning_count:issues.filter(i=>i.severity==='warning').length, error_count:issues.filter(i=>i.severity==='error').length };
  return { persons, unions, parentChildRelations, sources, citations, events, importBatches:[importBatch], issues, counts:{ persons:persons.length, unions:unions.length, parent_child_relations:parentChildRelations.length, sources:sources.length, citations:citations.length, events:events.length, warnings:issues.filter(i=>i.severity==='warning').length, errors:issues.filter(i=>i.severity==='error').length } };
}

export function parseStandardCsvSetFiles(files: StandardCsvSetTextFiles) { return validateStandardCsvSet(files); }

export async function readStandardCsvSetFromZip(file: Blob) { return readStoredZip(new Uint8Array(await file.arrayBuffer())); }

function standardCsvSetFileName(file: File) { return file.name.split(/[\\/]/).pop() ?? file.name; }

export async function readStandardCsvSetFromFiles(fileList: FileList | File[] | Iterable<File>): Promise<StandardCsvSetTextFiles> {
  const files: StandardCsvSetTextFiles = {};
  for (const file of Array.from(fileList)) {
    const name = standardCsvSetFileName(file);
    if (name === 'manifest.json' || (STANDARD_CSV_SET_FILES as readonly string[]).includes(name)) files[name] = (await file.text()).replace(/^\uFEFF/, '');
  }
  return files;
}

export async function parseStandardCsvSetZip(file: Blob) { return validateStandardCsvSet(await readStandardCsvSetFromZip(file)); }
export async function parseStandardCsvSetFileList(fileList: FileList | File[] | Iterable<File>) { return validateStandardCsvSet(await readStandardCsvSetFromFiles(fileList)); }
