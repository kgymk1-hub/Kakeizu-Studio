import { nanoid } from 'nanoid';
import type { ImportBatch, ParentChildRelation, Person, Union, ValidationIssue } from '../models';
import type { RawCsvPerson } from '../schemas/csvSchemas';

export interface NormalizedFamilyData { persons: Person[]; unions: Union[]; parentChildRelations: ParentChildRelation[]; importBatch: ImportBatch; issues: ValidationIssue[]; externalIdMap: Map<string,string>; }
const now = () => new Date().toISOString();
const id = (p: string) => `${p}_${nanoid(10)}`;
const splitIds = (v?: string) => [...new Set((v ?? '').split(';').map((x) => x.trim()).filter(Boolean))];
const pairKey = (a: string, b?: string) => [a, b ?? 'unknown'].sort().join('::');

export function normalizeCsvPersons(rows: RawCsvPerson[], sourceName = 'family_simple.csv'): NormalizedFamilyData {
  const issues: ValidationIssue[] = [];
  const batch: ImportBatch = { id: id('imp'), imported_at: now(), import_type: 'csv_simple', source_name: sourceName, imported_count: rows.length, warning_count: 0, error_count: 0 };
  const seen = new Set<string>();
  rows.forEach((r, i) => { if (seen.has(r.person_id)) issues.push({ severity:'error', code:'duplicate_person_id', message:`CSV内person_idが重複しています: ${r.person_id}`, row:i+2, external_id:r.person_id }); seen.add(r.person_id); });
  const externalIdMap = new Map(rows.map((r) => [r.person_id, id('per')]));
  const persons: Person[] = rows.map((r) => ({ id: externalIdMap.get(r.person_id)!, external_id:r.person_id, display_name:r.name, family_name:r.family_name, given_name:r.given_name, family_name_kana:r.kana, gender:r.gender, birth_date_text:r.birth_date, death_date_text:r.death_date, rank_title:r.title, generation_no:r.generation_no ? Number(r.generation_no) : undefined, confidence:r.confidence, review_status:'reviewed', note:[r.note, r.source ? `出典: ${r.source}` : undefined].filter(Boolean).join('\n') || undefined, import_batch_id: batch.id, created_at:now(), updated_at:now() }));
  const unionMap = new Map<string, Union>();
  const ensureUnion = (aExternal: string, bExternal?: string, type: Union['union_type']='marriage', confidence: Union['confidence']='likely') => {
    const a = externalIdMap.get(aExternal); const b = bExternal ? externalIdMap.get(bExternal) : undefined;
    if (!a) return undefined;
    if (bExternal && !b) { issues.push({ severity:'warning', code:'unknown_spouse_id', message:`存在しない配偶者IDです: ${bExternal}`, external_id:aExternal }); return undefined; }
    if (b && a === b) { issues.push({ severity:'error', code:'self_spouse', message:`自分自身を配偶者に指定しています: ${aExternal}`, external_id:aExternal }); return undefined; }
    const key = pairKey(a, b); let u = unionMap.get(key);
    if (!u) { u = { id:id('uni'), external_id:`U${String(unionMap.size+1).padStart(3,'0')}`, partner1_id:a, partner2_id:b, union_type:type, confidence, review_status:'unreviewed', import_batch_id:batch.id, created_at:now(), updated_at:now() }; unionMap.set(key, u); }
    return u;
  };
  rows.forEach((r) => splitIds(r.spouse_ids).forEach((s) => ensureUnion(r.person_id, s, 'marriage', r.confidence ?? 'likely')));
  const relations: ParentChildRelation[] = [];
  rows.forEach((r) => {
    const child = externalIdMap.get(r.person_id)!; const parentExternals = [r.father_id, r.mother_id].filter(Boolean) as string[];
    if (parentExternals.includes(r.person_id)) issues.push({ severity:'error', code:'self_parent', message:`自分自身を親に指定しています: ${r.person_id}`, external_id:r.person_id });
    let union = r.father_id && r.mother_id ? ensureUnion(r.father_id, r.mother_id, 'unknown', r.confidence ?? 'likely') : undefined;
    if (!union && parentExternals.length === 1) union = ensureUnion(parentExternals[0], undefined, 'unknown', r.confidence ?? 'uncertain');
    parentExternals.forEach((pExt) => {
      const parent = externalIdMap.get(pExt); if (!parent) { issues.push({ severity:'warning', code:'unknown_parent_id', message:`存在しない親IDです: ${pExt}`, external_id:r.person_id }); return; }
      relations.push({ id:id('rel'), external_id:`R${String(relations.length+1).padStart(3,'0')}`, parent_id:parent, child_id:child, union_id:union?.id, relation_type:'biological', confidence:r.confidence, review_status:'unreviewed', import_batch_id:batch.id, created_at:now(), updated_at:now() });
    });
  });
  detectCycles(relations).forEach((external) => issues.push({ severity:'error', code:'parent_cycle', message:`親子関係に循環参照があります: ${external}`, external_id: external }));
  batch.warning_count = issues.filter((i) => i.severity === 'warning').length; batch.error_count = issues.filter((i) => i.severity === 'error').length;
  return { persons, unions:[...unionMap.values()], parentChildRelations:relations, importBatch:batch, issues, externalIdMap };
}
function detectCycles(relations: ParentChildRelation[]) { const children = new Map<string,string[]>(); relations.forEach(r => children.set(r.parent_id, [...(children.get(r.parent_id) ?? []), r.child_id])); const bad = new Set<string>(); const visit=(n:string,path:string[])=>{ if(path.includes(n)){ bad.add(n); return;} (children.get(n)??[]).forEach(c=>visit(c,[...path,n]));}; [...children.keys()].forEach(k=>visit(k,[])); return [...bad]; }
