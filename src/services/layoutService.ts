import type { LayoutEdge, LayoutNode, ParentChildRelation, Person, Union } from '../models';
export function buildFamilyLayout(persons: Person[], unions: Union[], relations: ParentChildRelation[]) {
  const gen = new Map<string, number>(); persons.forEach((p) => gen.set(p.id, p.generation_no ?? 1)); relations.forEach((r) => gen.set(r.child_id, Math.max(gen.get(r.child_id) ?? 1, (gen.get(r.parent_id) ?? 1) + 1)));
  const nodes: LayoutNode[] = []; const buckets = new Map<number, number>();
  persons.forEach((p) => { const g = gen.get(p.id) ?? 1; const i = buckets.get(g) ?? 0; buckets.set(g, i+1); nodes.push({ id:p.id, type:'person', x:80+i*190, y:60+(g-1)*170, width:140, height:74, label:p.display_name, person:p }); });
  unions.forEach((u, i) => { const p1 = nodes.find((n) => n.id === u.partner1_id); const p2 = nodes.find((n) => n.id === u.partner2_id); const x = p2 ? (p1!.x + p2.x)/2 + 55 : (p1?.x ?? 80) + 70; const y = (p1?.y ?? 60) + 96; nodes.push({ id:u.id, type:'union', x, y, width:24, height:24, label:u.union_type, union:u }); });
  const edges: LayoutEdge[] = [];
  unions.forEach((u) => { edges.push({ id:`e-${u.partner1_id}-${u.id}`, type:'spouse', from:u.partner1_id, to:u.id }); if (u.partner2_id) edges.push({ id:`e-${u.id}-${u.partner2_id}`, type:'spouse', from:u.id, to:u.partner2_id }); });
  relations.forEach((r) => edges.push({ id:`e-${r.union_id ?? r.parent_id}-${r.child_id}`, type:r.union_id ? 'union-child':'parent-child', from:r.union_id ?? r.parent_id, to:r.child_id, relation_type:r.relation_type, confidence:r.confidence }));
  return { layoutNodes:nodes, layoutEdges:edges };
}
