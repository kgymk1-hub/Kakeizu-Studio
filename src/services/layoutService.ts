import type { LayoutEdge, LayoutNode, ParentChildRelation, Person, Union, ValidationIssue } from '../models';

const PERSON_WIDTH = 176;
const PERSON_HEIGHT = 84;
const UNION_SIZE = 18;
const GENERATION_GAP = 220;
const SIBLING_GAP = 236;
const START_X = 96;
const START_Y = 72;
const VIEWBOX_PADDING = 88;

export interface LayoutViewBox { x: number; y: number; width: number; height: number; }
export interface FamilyLayout { layoutNodes: LayoutNode[]; layoutEdges: LayoutEdge[]; viewBox: LayoutViewBox; issues: ValidationIssue[]; }

export function calculateLayoutViewBox(nodes: LayoutNode[], padding = VIEWBOX_PADDING): LayoutViewBox {
  if (nodes.length === 0) return { x: 0, y: 0, width: 1100, height: 760 };
  const minX = Math.min(...nodes.map((n) => n.x));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxX = Math.max(...nodes.map((n) => n.x + n.width));
  const maxY = Math.max(...nodes.map((n) => n.y + n.height));
  return { x: minX - padding, y: minY - padding, width: maxX - minX + padding * 2, height: maxY - minY + padding * 2 };
}

export function sanitizeSelectedPersonId(selectedId: string | undefined, persons: Person[]) {
  return selectedId && persons.some((p) => p.id === selectedId) ? selectedId : undefined;
}

export function buildFamilyLayout(persons: Person[], unions: Union[], relations: ParentChildRelation[]): FamilyLayout {
  const issues: ValidationIssue[] = [];
  const personIds = new Set(persons.map((p) => p.id));
  const unionIds = new Set(unions.map((u) => u.id));
  const gen = new Map<string, number>();

  persons.forEach((p) => gen.set(p.id, p.generation_no ?? 1));
  relations.forEach((r) => {
    if (!personIds.has(r.child_id)) issues.push({ severity: 'warning', code: 'LAYOUT_MISSING_CHILD', message: `親子関係 ${r.id} の子 ${r.child_id} が見つかりません。` });
    if (!personIds.has(r.parent_id)) issues.push({ severity: 'warning', code: 'LAYOUT_MISSING_PARENT', message: `親子関係 ${r.id} の親 ${r.parent_id} が見つかりません。` });
    if (r.union_id && !unionIds.has(r.union_id)) issues.push({ severity: 'warning', code: 'LAYOUT_MISSING_UNION', message: `親子関係 ${r.id} のUnion ${r.union_id} が見つかりません。` });
    if (personIds.has(r.parent_id) && personIds.has(r.child_id)) gen.set(r.child_id, Math.max(gen.get(r.child_id) ?? 1, (gen.get(r.parent_id) ?? 1) + 1));
  });

  const nodes: LayoutNode[] = [];
  const generations = [...new Set(persons.map((p) => gen.get(p.id) ?? 1))].sort((a, b) => a - b);
  generations.forEach((g) => {
    const group = persons.filter((p) => (gen.get(p.id) ?? 1) === g).sort((a, b) => (a.external_id ?? a.id).localeCompare(b.external_id ?? b.id));
    const offset = group.length === 1 ? SIBLING_GAP : 0;
    group.forEach((p, i) => nodes.push({ id: p.id, type: 'person', x: START_X + offset + i * SIBLING_GAP, y: START_Y + (g - 1) * GENERATION_GAP, width: PERSON_WIDTH, height: PERSON_HEIGHT, label: p.display_name, person: p }));
  });

  const byId = new Map(nodes.map((n) => [n.id, n]));
  unions.forEach((u) => {
    const p1 = byId.get(u.partner1_id);
    const p2 = u.partner2_id ? byId.get(u.partner2_id) : undefined;
    if (!p1) issues.push({ severity: 'warning', code: 'LAYOUT_MISSING_PARTNER', message: `Union ${u.id} のpartner1 ${u.partner1_id} が見つかりません。` });
    if (u.partner2_id && !p2) issues.push({ severity: 'warning', code: 'LAYOUT_MISSING_PARTNER', message: `Union ${u.id} のpartner2 ${u.partner2_id} が見つかりません。` });
    if (!p1 && !p2) return;
    const x = p1 && p2 ? (p1.x + p1.width / 2 + p2.x + p2.width / 2) / 2 - UNION_SIZE / 2 : (p1 ?? p2)!.x + (p1 ?? p2)!.width + 24;
    const y = (p1 ?? p2)!.y + PERSON_HEIGHT + 42;
    nodes.push({ id: u.id, type: 'union', x, y, width: UNION_SIZE, height: UNION_SIZE, label: u.union_type, union: u });
  });

  const edges: LayoutEdge[] = [];
  unions.forEach((u) => {
    if (personIds.has(u.partner1_id) && unionIds.has(u.id)) edges.push({ id: `e-${u.partner1_id}-${u.id}`, type: 'spouse', from: u.partner1_id, to: u.id, union_type: u.union_type, status: u.status, end_reason: u.end_reason, confidence: u.confidence, review_status: u.review_status });
    if (u.partner2_id && personIds.has(u.partner2_id) && unionIds.has(u.id)) edges.push({ id: `e-${u.id}-${u.partner2_id}`, type: 'spouse', from: u.id, to: u.partner2_id, union_type: u.union_type, status: u.status, end_reason: u.end_reason, confidence: u.confidence, review_status: u.review_status });
  });
  relations.forEach((r) => {
    const from = r.union_id && unionIds.has(r.union_id) ? r.union_id : r.parent_id;
    if (personIds.has(r.child_id) && (unionIds.has(from) || personIds.has(from))) edges.push({ id: `e-${from}-${r.child_id}`, type: r.union_id ? 'union-child' : 'parent-child', from, to: r.child_id, relation_type: r.relation_type, confidence: r.confidence, review_status: r.review_status });
  });

  return { layoutNodes: nodes, layoutEdges: edges, viewBox: calculateLayoutViewBox(nodes), issues };
}
