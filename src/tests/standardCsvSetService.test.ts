import { describe, expect, it } from 'vitest';
import type { Citation, Person, Source } from '../models';
import { buildStandardCsvSetFiles, createStandardCsvSetZip, parseStandardCsvSetFiles, readStoredZip } from '../services/standardCsvSetService';

const now = '2026-07-06T00:00:00.000Z';
const person: Person = { id:'p1', external_id:'P-1', display_name:'山田 太郎', gender:'male', created_at:now, updated_at:now };
const source: Source = { id:'s1', source_type:'book', title:'本', created_at:now, updated_at:now };
const citation: Citation = { id:'c1', source_id:'s1', target_type:'person', target_id:'p1', created_at:now, updated_at:now };
const base = { persons:[person], unions:[], parentChildRelations:[], sources:[source], citations:[citation] };

async function zipFiles(data = base) {
  return readStoredZip(new Uint8Array(await (await createStandardCsvSetZip(data)).arrayBuffer()));
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

  it('warningのみの場合はインポート可能', () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...base, citations:[{ ...citation, target_type:'event', target_id:'e1' }] }));
    expect(preview.counts.errors).toBe(0);
    expect(preview.counts.warnings).toBe(1);
  });

  it('errorありの場合はインポート不可', () => {
    const preview = parseStandardCsvSetFiles(buildStandardCsvSetFiles({ ...base, citations:[{ ...citation, source_id:'missing' }] }));
    expect(preview.counts.errors).toBeGreaterThan(0);
  });
});
