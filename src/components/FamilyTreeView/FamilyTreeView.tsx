import { useMemo, useState } from 'react';
import type { LayoutEdge, LayoutNode, Person, ValidationIssue } from '../../models';
import type { LayoutViewBox } from '../../services/layoutService';

interface Props { nodes: LayoutNode[]; edges: LayoutEdge[]; viewBox: LayoutViewBox; issues?: ValidationIssue[]; selectedPersonId?: string; onSelectPerson?: (person: Person) => void; }

const genderLabel: Record<string, string> = { male: '男', female: '女', unknown: '不明', other: '他' };
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatName = (name: string) => (name.length > 11 ? `${name.slice(0, 10)}…` : name);
const formatDates = (person?: Person) => [person?.birth_date_text || '?', person?.death_date_text || ''].filter(Boolean).join(' - ');

function edgePath(edge: LayoutEdge, from: LayoutNode, to: LayoutNode) {
  const ax = from.x + from.width / 2;
  const ay = edge.type === 'spouse' ? from.y + from.height / 2 : from.y + from.height;
  const bx = to.x + to.width / 2;
  const by = edge.type === 'spouse' ? to.y + to.height / 2 : to.y;
  if (edge.type === 'spouse') return `M ${ax} ${ay} L ${bx} ${by}`;
  const midY = ay + Math.max(28, (by - ay) / 2);
  return `M ${ax} ${ay} V ${midY} H ${bx} V ${by}`;
}

export function FamilyTreeView({ nodes, edges, viewBox, issues = [], selectedPersonId, onSelectPerson }: Props) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number; panX: number; panY: number }>();
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const hasMissing = issues.length > 0;
  const actualViewBox = `${viewBox.x + pan.x} ${viewBox.y + pan.y} ${viewBox.width / zoom} ${viewBox.height / zoom}`;
  const fitAll = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  if (nodes.length === 0) return <div className="tree-empty"><h2>家系図データがありません</h2><p>CSVをインポートすると、ここにSVG家系図が表示されます。</p></div>;

  return <div className="tree-view">
    <div className="tree-toolbar" aria-label="家系図操作">
      <button type="button" onClick={() => setZoom((z) => clamp(z * 1.2, 0.5, 2.6))}>＋ 拡大</button>
      <button type="button" onClick={() => setZoom((z) => clamp(z / 1.2, 0.5, 2.6))}>− 縮小</button>
      <button type="button" onClick={fitAll}>全体表示</button>
      <button type="button" onClick={reset}>リセット</button>
    </div>
    {hasMissing && <div className="tree-warning">参照不整合があります。表示可能な人物・関係だけで家系図を描画しています。</div>}
    <svg className="tree-svg" viewBox={actualViewBox} role="img" aria-label="家系図" onMouseDown={(e) => setDragStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y })} onMouseMove={(e) => { if (!dragStart) return; const scaleX = viewBox.width / zoom / e.currentTarget.clientWidth; const scaleY = viewBox.height / zoom / e.currentTarget.clientHeight; setPan({ x: dragStart.panX - (e.clientX - dragStart.x) * scaleX, y: dragStart.panY - (e.clientY - dragStart.y) * scaleY }); }} onMouseUp={() => setDragStart(undefined)} onMouseLeave={() => setDragStart(undefined)}>
      <g>{edges.map((e) => { const a = byId.get(e.from), b = byId.get(e.to); if (!a || !b) return null; const dashed = e.relation_type && e.relation_type !== 'biological'; return <path key={e.id} d={edgePath(e, a, b)} className={`edge edge-${e.type}`} data-relation-type={e.relation_type ?? 'unknown'} strokeDasharray={dashed ? '7 5' : undefined} />; })}</g>
      <g>{nodes.map((n) => n.type === 'union' ? <g key={n.id} transform={`translate(${n.x} ${n.y})`} className="union-node" data-union-type={n.union?.union_type}><rect x="1" y="1" width={n.width - 2} height={n.height - 2} transform={`rotate(45 ${n.width / 2} ${n.height / 2})`} rx="3"/><title>{n.label}</title></g> : <g key={n.id} transform={`translate(${n.x} ${n.y})`} className={`person-node ${selectedPersonId === n.id ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); if (n.person) onSelectPerson?.(n.person); }}>
        <rect width={n.width} height={n.height} rx="14"/>
        <text x="16" y="28" className="name"><title>{n.label}</title>{formatName(n.label)}</text>
        <text x="16" y="52" className="dates">{formatDates(n.person)}</text>
        <text x="16" y="72" className="meta">{genderLabel[n.person?.gender ?? 'unknown'] ?? '不明'}{n.person?.confidence === 'uncertain' ? ' ・ ?' : ''}{n.person?.review_status === 'unreviewed' ? ' ・ 未確認' : ''}</text>
      </g>)}</g>
    </svg>
  </div>;
}
