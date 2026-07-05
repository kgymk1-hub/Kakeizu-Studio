import Papa from 'papaparse';
import type { ParentChildRelation, Person, Union } from '../models';
export function exportSimpleCsv(persons: Person[], unions: Union[], relations: ParentChildRelation[]) {
  const parentByChild = new Map<string, ParentChildRelation[]>(); relations.forEach((r) => parentByChild.set(r.child_id, [...(parentByChild.get(r.child_id) ?? []), r]));
  const spouseByPerson = new Map<string, string[]>(); unions.forEach((u) => { if (u.partner2_id) { spouseByPerson.set(u.partner1_id, [...(spouseByPerson.get(u.partner1_id) ?? []), u.partner2_id]); spouseByPerson.set(u.partner2_id, [...(spouseByPerson.get(u.partner2_id) ?? []), u.partner1_id]); }});
  const byId = new Map(persons.map((p) => [p.id, p]));
  return Papa.unparse(persons.map((p) => { const parents = parentByChild.get(p.id) ?? []; return { person_id:p.external_id ?? p.id, name:p.display_name, gender:p.gender ?? '', birth_date:p.birth_date_text ?? '', death_date:p.death_date_text ?? '', father_id: byId.get(parents[0]?.parent_id)?.external_id ?? '', mother_id: byId.get(parents[1]?.parent_id)?.external_id ?? '', spouse_ids: (spouseByPerson.get(p.id) ?? []).map((id) => byId.get(id)?.external_id ?? id).join(';'), generation_no:p.generation_no ?? '', title:p.rank_title ?? '', note:p.note ?? '', source:'', confidence:p.confidence ?? '' }; }));
}
