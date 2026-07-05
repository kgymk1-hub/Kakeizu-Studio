import type { LayoutEdge, LayoutNode, Person } from '../../models';
interface Props { nodes: LayoutNode[]; edges: LayoutEdge[]; selectedPersonId?: string; onSelectPerson?: (person: Person) => void; }
export function FamilyTreeView({ nodes, edges, selectedPersonId, onSelectPerson }: Props) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return <svg className="tree-svg" viewBox="0 0 1100 760" role="img" aria-label="家系図">
    <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#876445" /></marker></defs>
    <g>{edges.map((e) => { const a=byId.get(e.from), b=byId.get(e.to); if(!a||!b) return null; const dashed=e.relation_type&&e.relation_type!=='biological'; return <line key={e.id} x1={a.x+a.width/2} y1={a.y+a.height/2} x2={b.x+b.width/2} y2={b.y+b.height/2} className={`edge edge-${e.type}`} strokeDasharray={dashed?'6 4':undefined} markerEnd={e.type.includes('child')?'url(#arrow)':undefined}/>; })}</g>
    <g>{nodes.map((n) => n.type === 'union' ? <g key={n.id} transform={`translate(${n.x} ${n.y})`}><circle r="12" cx="12" cy="12" className="union-node"/><text x="12" y="17" textAnchor="middle">∞</text></g> : <g key={n.id} transform={`translate(${n.x} ${n.y})`} className={`person-node ${selectedPersonId===n.id?'selected':''}`} onClick={() => n.person && onSelectPerson?.(n.person)}><rect width={n.width} height={n.height} rx="12"/><text x="14" y="26" className="name">{n.label}</text><text x="14" y="48" className="dates">{[n.person?.birth_date_text, n.person?.death_date_text].filter(Boolean).join(' - ')}</text><text x="14" y="65" className="meta">{n.person?.rank_title ?? n.person?.confidence ?? ''}</text></g>)}</g>
  </svg>;
}
