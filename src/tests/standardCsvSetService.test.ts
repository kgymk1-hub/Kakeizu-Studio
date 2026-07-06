import { describe, expect, it } from 'vitest';
import type { Citation, Event, ParentChildRelation, Person, Source, Union } from '../models';
import { buildStandardCsvSetFiles, createStandardCsvSetZip, parseStandardCsvSetFileList, parseStandardCsvSetFiles, parseStandardCsvSetZip, readStandardCsvSetFromFiles, readStandardCsvSetFromZip, readStoredZip } from '../services/standardCsvSetService';

const now = '2026-07-06T00:00:00.000Z';
const person: Person = { id:'p1', external_id:'P-1', display_name:'山田 太郎', gender:'male', created_at:now, updated_at:now };
const source: Source = { id:'s1', source_type:'book', title:'本', created_at:now, updated_at:now };
const citation: Citation = { id:'c1', source_id:'s1', target_type:'person', target_id:'p1', created_at:now, updated_at:now };
const event: Event = { id:'e1', event_type:'birth', target_type:'person', target_id:'p1', date_text:'明治1年', created_at:now, updated_at:now };
const spouse: Person = { id:'p2', display_name:'山田 花子', created_at:now, updated_at:now };
const union: Union = { id:'u1', partner1_id:'p1', partner2_id:'p2', union_type:'marriage', created_at:now, updated_at:now };
const relation: ParentChildRelation = { id:'r1', parent_id:'p1', child_id:'p2', relation_type:'biological', created_at:now, updated_at:now };
const base = { persons:[person], unions:[], parentChildRelations:[], sources:[source], citations:[citation] };
const relationBase = { persons:[person, spouse], unions:[union], parentChildRelations:[relation], sources:[source], citations:[] as Citation[] };

async function zipFiles(data = base) {
  return readStoredZip(new Uint8Array(await (await createStandardCsvSetZip(data)).arrayBuffer()));
}

function asSelectedFiles(files: Record<string, string>) {
  return Object.entries(files).map(([name, text]) => new File([text], name, { type: name.endsWith('.json') ? 'application/json' : 'text/csv' }));
}

describe('standardCsvSetService', () => {
  it('標準CSVセットエクスポートでmanifest.jsonが含まれる', async () => {
    const files = await zipFiles();
    expect(files['manifest.json']).toContain('kakeizu_standard_csv_set');
  });

  it('persons.csvにヘッダーが含まれる', () => {
    const files = buildStandardCsvSetFiles(base);
    expect(files['persons.csv']).toContain('id,external_id,name,gender,birth_date,death_date,generation_no,title,note,confidence,created_at,updated_at');
  });

  it('sources.csv / citations.csv にヘッダーが含まれる', () => {
    const files = buildStandardCsvSetFiles(base);
    expect(files['sources.csv']).toContain('id,external_id,source_type,title,author_or_issuer');
    expect(files['citations.csv']).toContain('id,external_id,source_id,target_type,target_id');
  });

  it('空データでもヘッダーのみCSVが出力される', () => {
    const files = buildStandardCsvSetFiles({ persons:[], unions:[], parentChildRelations:[], sources:[], citations:[] });
    expect(files['persons.csv'].replace(/\r?\n$/, '')).toBe('\uFEFFid,external_id,name,gender,birth_date,death_date,generation_no,title,note,confidence,created_at,updated_at');
    expect(files['sources.csv']).toContain('id,external_id,source_type,title');
    expect(files['citations.csv']).toContain('id,external_id,source_id,target_type,target_id');
  });

  it('標準CSVセットエクスポートにevents.csvが含まれる', () => {
    const files = buildStandardCsvSetFiles({ ...base, events:[event] });
    expect(files['events.csv']).toContain('id,external_id,event_type,target_type,target_id,date_text');
  });

  it('events.csvがない旧標準CSVセットでもインポートできる', () => {
    const files = buildStandardCsvSetFiles(base);
    delete (files as Record<string,string>)['events.csv'];
    const preview = parseStandardCsvSetFiles(files);
    expect(preview.counts.errors).toBe(0);
    expect(preview.events).toEqual([]);
  });

  it('events.csvのperson target_id不整合はerror', () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...base, events:[{ id:'e1', event_type:'birth', target_type:'person', target_id:'missing', created_at:now, updated_at:now }] }));
    expect(preview.issues.some(i => i.code === 'missing_person_ref')).toBe(true);
  });


  it('manifest.jsonのfilesにevents.csvが含まれる', () => {
    const files = buildStandardCsvSetFiles(base);
    const manifest = JSON.parse(files['manifest.json']);
    expect(manifest.files).toContain('events.csv');
  });

  it("Event Citationがcitations.csvにtarget_type='event'で出力される", () => {
    const files = buildStandardCsvSetFiles({ ...base, events:[event], citations:[{ ...citation, target_type:'event', target_id:'e1' }] });
    expect(files['citations.csv']).toContain('event,e1');
  });

  it('events.csvのunion target_id不整合はerror', () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...base, events:[{ ...event, target_type:'union', target_id:'missing' }] }));
    expect(preview.issues.some(i => i.code === 'missing_union_ref')).toBe(true);
  });

  it('events.csvのrelation target_id不整合はerror', () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...base, events:[{ ...event, target_type:'relation', target_id:'missing' }] }));
    expect(preview.issues.some(i => i.code === 'missing_relation_ref')).toBe(true);
  });

  it('標準CSVセットインポートでpersons / sources / citationsが復元される', () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles(base));
    expect(preview.counts.errors).toBe(0);
    expect(preview.persons[0].display_name).toBe('山田 太郎');
    expect(preview.sources[0].title).toBe('本');
    expect(preview.citations[0].source_id).toBe('s1');
  });

  it('manifest.jsonがない場合はerror', () => {
    const files = buildStandardCsvSetFiles(base); delete (files as Record<string,string>)['manifest.json'];
    expect(parseStandardCsvSetFiles(files).counts.errors).toBeGreaterThan(0);
  });

  it('必須CSVがない場合はerror', () => {
    const files = buildStandardCsvSetFiles(base); delete (files as Record<string,string>)['sources.csv'];
    expect(parseStandardCsvSetFiles(files).issues.some(i => i.code === 'missing_csv')).toBe(true);
  });

  it('citation.source_id が存在しない場合はerror', () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...base, citations:[{ ...citation, source_id:'missing' }] }));
    expect(preview.issues.some(i => i.code === 'missing_source_ref')).toBe(true);
  });

  it('person targetのcitation.target_id が存在しない場合はerror', () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...base, citations:[{ ...citation, target_id:'missing' }] }));
    expect(preview.issues.some(i => i.code === 'missing_person_ref')).toBe(true);
  });

  it('event targetのcitation.target_id が存在しない場合はerror', () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...base, citations:[{ ...citation, target_type:'event', target_id:'e1' }] }));
    expect(preview.issues.some(i => i.code === 'missing_event_ref')).toBe(true);
  });

  it("citations.csvにtarget_type='relation' / 'union'が出力され参照検証できる", () => {
    const relationCitation: Citation = { ...citation, id:'cr1', target_type:'relation', target_id:'r1' };
    const unionCitation: Citation = { ...citation, id:'cu1', target_type:'union', target_id:'u1' };
    const files = buildStandardCsvSetFiles({ ...relationBase, citations:[relationCitation, unionCitation] });
    expect(files['citations.csv']).toContain('relation,r1');
    expect(files['citations.csv']).toContain('union,u1');
    expect(parseStandardCsvSetFiles(files).counts.errors).toBe(0);
  });

  it("citation target_type='relation' のtarget_id不整合はerror", () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...relationBase, citations:[{ ...citation, target_type:'relation', target_id:'missing' }] }));
    expect(preview.issues.some(i => i.code === 'missing_relation_ref')).toBe(true);
  });

  it("citation target_type='union' のtarget_id不整合はerror", () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...relationBase, citations:[{ ...citation, target_type:'union', target_id:'missing' }] }));
    expect(preview.issues.some(i => i.code === 'missing_union_ref')).toBe(true);
  });

  it('errorありの場合はインポート不可', () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...base, citations:[{ ...citation, source_id:'missing' }] }));
    expect(preview.counts.errors).toBeGreaterThan(0);
  });


  it('複数ファイル形式から標準CSVセットを読み込める', async () => {
    const preview = await parseStandardCsvSetFileList(asSelectedFiles(buildStandardCsvSetFiles(base)));
    expect(preview.counts.errors).toBe(0);
    expect(preview.counts.persons).toBe(1);
    expect(preview.counts.sources).toBe(1);
    expect(preview.counts.citations).toBe(1);
  });

  it('複数ファイル直接インポートでもpersons / sources / citationsが復元される', async () => {
    const preview = await parseStandardCsvSetFileList(asSelectedFiles(buildStandardCsvSetFiles(base)));
    expect(preview.persons[0].display_name).toBe('山田 太郎');
    expect(preview.sources[0].title).toBe('本');
    expect(preview.citations[0].target_id).toBe('p1');
  });

  it('ZIP読込と複数ファイル読込で同じ検証結果になる', async () => {
    const files = buildStandardCsvSetFiles({ ...base, citations:[{ ...citation, target_type:'event', target_id:'missing' }] });
    const zip = await createStandardCsvSetZip({ ...base, citations:[{ ...citation, target_type:'event', target_id:'missing' }] });
    const zipPreview = await parseStandardCsvSetZip(zip);
    const filePreview = await parseStandardCsvSetFileList(asSelectedFiles(files));
    expect(filePreview.counts).toEqual(zipPreview.counts);
    expect(filePreview.issues.map(({ severity, code, message }) => ({ severity, code, message }))).toEqual(zipPreview.issues.map(({ severity, code, message }) => ({ severity, code, message })));
  });

  it('ZIP読込と複数ファイル読込はファイル抽出後に同じ検証関数へ渡せる', async () => {
    const zipFiles = await readStandardCsvSetFromZip(await createStandardCsvSetZip(base));
    const selectedFiles = await readStandardCsvSetFromFiles(asSelectedFiles(buildStandardCsvSetFiles(base)));
    expect(parseStandardCsvSetFiles(selectedFiles).counts).toEqual(parseStandardCsvSetFiles(zipFiles).counts);
  });

  it('外部圧縮ZIP非対応時のエラーメッセージが存在する', () => {
    const compressedLocalHeader = new Uint8Array(30);
    const view = new DataView(compressedLocalHeader.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(8, 8, true);
    expect(() => readStoredZip(compressedLocalHeader)).toThrow('圧縮されたZIPは未対応です。標準CSVセットは無圧縮ZIPで読み込んでください。');
  });
});
