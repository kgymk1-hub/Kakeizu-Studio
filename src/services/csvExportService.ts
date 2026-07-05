import Papa from 'papaparse';
import type { ParentChildRelation, Person, Union } from '../models';

function assignParents(parents: Person[]) {
  let father = parents.find((p) => p.gender === 'male');
  let mother = parents.find((p) => p.gender === 'female');
  const notes: string[] = [];
  for (const parent of parents) {
    if (parent.id === father?.id || parent.id === mother?.id) continue;
    if (!father) father = parent;
    else if (!mother) mother = parent;
    else notes.push(`追加親: ${parent.external_id ?? parent.id}`);
  }
  const maleCount = parents.filter((p) => p.gender === 'male').length;
  const femaleCount = parents.filter((p) => p.gender === 'female').length;
  if (maleCount > 1 || femaleCount > 1 || notes.length > 0) notes.unshift('親候補が複数あるためCSV列に収まらない親があります');
  return { father, mother, note: [...new Set(notes)].join(' / ') };
}

export function exportSimpleCsv(persons: Person[], unions: Union[], relations: ParentChildRelation[]) {
  const parentByChild = new Map<string, ParentChildRelation[]>();
  relations.forEach((r) => parentByChild.set(r.child_id, [...(parentByChild.get(r.child_id) ?? []), r]));
  const spouseByPerson = new Map<string, string[]>();
  unions.forEach((u) => { if (u.partner2_id) { spouseByPerson.set(u.partner1_id, [...(spouseByPerson.get(u.partner1_id) ?? []), u.partner2_id]); spouseByPerson.set(u.partner2_id, [...(spouseByPerson.get(u.partner2_id) ?? []), u.partner1_id]); }});
  const byId = new Map(persons.map((p) => [p.id, p]));
  return Papa.unparse(persons.map((p) => {
    const parents = (parentByChild.get(p.id) ?? []).map((r) => byId.get(r.parent_id)).filter((parent): parent is Person => Boolean(parent));
    const assigned = assignParents(parents);
    const note = [p.note, assigned.note].filter(Boolean).join('\n');
    return { person_id:p.external_id ?? p.id, name:p.display_name, gender:p.gender ?? '', birth_date:p.birth_date_text ?? '', death_date:p.death_date_text ?? '', father_id: assigned.father?.external_id ?? '', mother_id: assigned.mother?.external_id ?? '', spouse_ids: (spouseByPerson.get(p.id) ?? []).map((id) => byId.get(id)?.external_id ?? id).join(';'), generation_no:p.generation_no ?? '', title:p.rank_title ?? '', note, source:'', confidence:p.confidence ?? '' };
  }));
}
