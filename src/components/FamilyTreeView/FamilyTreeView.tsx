import { useMemo, useState } from 'react';
import type { Citation, Confidence, LayoutEdge, LayoutNode, Person, ReviewStatus, ValidationIssue } from '../../models';
import type { LayoutViewBox } from '../../services/layoutService';

export type FamilyTreeDisplayMode = 'compact' | 'standard' | 'detailed';

interface Props { nodes: LayoutNode[]; edges: LayoutEdge[]; viewBox: LayoutViewBox; issues?: ValidationIssue[]; citations?: Citation[]; citedPersonIds?: Set<string>; selectedPersonId?: string; onSelectPerson?: (person: Person) => void; initialDisplayMode?: FamilyTreeDisplayMode; }

const genderLabel: Record<string, string> = { male: '男', female: '女', unknown: '不明', other: '他' };
const confidenceLabels: Record<Confidence, string> = { confirmed: '確定', likely: '可能性高', uncertain: '要確認', disputed: '異説あり' };
const reviewStatusLabels: Record<ReviewStatus, string> = { reviewed: '確認済', unreviewed: '未確認', rejected: '除外' };
const displayModeLabels: Record<FamilyTreeDisplayMode, string> = { compact: 'コンパクト', standard: '標準', detailed: '詳細' };
const displayModes: FamilyTreeDisplayMode[] = ['compact', 'standard', 'detailed'];
<
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatName = (name: string) => (name.length > 11 ? `${name.slice(0, 10)}…` : name);

export const formatLifeDates = (person?: Pick<Person, 'birth_date_text' | 'death_date_text'>) => {
  const birth = person?.birth_date_text || '?';
  const death = person?.death_date_text || '';
  return `${birth} - ${death}`;
};

export const hasPersonCitation = (personId: string, citations: Pick<Citation, 'target_type' | 'target_id'>[] = []) => citations.some((c) => c.target_type === 'person' && c.target_id === personId);
export const getConfidenceLabel = (confidence?: Confidence) => confidence ? confidenceLabels[confidence] : '確度未設定';
export const getReviewStatusLabel = (reviewStatus?: ReviewStatus) => reviewStatus ? reviewStatusLabels[reviewStatus] : '確認状態未設定';

export function getPersonNodeClassName(person: Person | undefined, hasCitation: boolean, selected: boolean, displayMode: FamilyTreeDisplayMode) {
  const flags = [
    'person-node',
    `display-${displayMode}`,
    selected ? 'selected' : '',
    !hasCitation ? 'missing-citation' : '',
    person?.review_status === 'unreviewed' ? 'unreviewed' : '',
    person?.confidence === 'uncertain' ? 'low-confidence' : '',
    person?.confidence === 'disputed' ? 'disputed-confidence' : '',
  ];
  return flags.filter(Boolean).join(' ');
}

function edgePath(edge: LayoutEdge, from: LayoutNode, to: LayoutNode) {
  const ax = from.x + from.width / 2;
  const ay = edge.type === 'spouse' ? from.y + from.height / 2 : from.y + from.height;
  const bx = to.x + to.width / 2;
  const by = edge.type === 'spouse' ? to.y + to.height / 2 : to.y;
  if (edge.type === 'spouse') return `M ${ax} ${ay} L ${bx} ${by}`;
  const midY = ay + Math.max(28, (by - ay) / 2);
  return `M ${ax} ${ay} V ${midY} H ${bx} V ${by}`;
}

export function FamilyTreeView({ nodes, edges, viewBox, issues = [], citations = [], citedPersonIds = new Set(), selectedPersonId, onSelectPerson, initialDisplayMode = 'standard' }: Props) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [displayMode, setDisplayMode] = useState<FamilyTreeDisplayMode>(initialDisplayMode);
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
      <label className="display-mode-control">表示密度:<select aria-label="表示密度" value={displayMode} onChange={(e) => setDisplayMode(e.target.value as FamilyTreeDisplayMode)}>{displayModes.map((mode) => <option key={mode} value={mode}>{displayModeLabels[mode]}</option>)}</select></label>
    </div>
    {hasMissing && <div className="tree-warning">参照不整合があります。表示可能な人物・関係だけで家系図を描画しています。</div>}
    <svg className={`tree-svg display-${displayMode}`} viewBox={actualViewBox} role="img" aria-label="家系図" onMouseDown={(e) => setDragStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y })} onMouseMove={(e) => { if (!dragStart) return; const scaleX = viewBox.width / zoom / e.currentTarget.clientWidth; const scaleY = viewBox.height / zoom / e.currentTarget.clientHeight; setPan({ x: dragStart.panX - (e.clientX - dragStart.x) * scaleX, y: dragStart.panY - (e.clientY - dragStart.y) * scaleY }); }} onMouseUp={() => setDragStart(undefined)} onMouseLeave={() => setDragStart(undefined)}>
      <g>{edges.map((e) => { const a = byId.get(e.from), b = byId.get(e.to); if (!a || !b) return null; const dashed = e.relation_type && e.relation_type !== 'biological'; return <path key={e.id} d={edgePath(e, a, b)} className={`edge edge-${e.type}`} data-relation-type={e.relation_type ?? 'unknown'} strokeDasharray={dashed ? '7 5' : undefined} />; })}</g>
      <g>{nodes.map((n) => {
        if (n.type === 'union') return <g key={n.id} transform={`translate(${n.x} ${n.y})`} className="union-node" data-union-type={n.union?.union_type}><rect x="1" y="1" width={n.width - 2} height={n.height - 2} transform={`rotate(45 ${n.width / 2} ${n.height / 2})`} rx="3"/><title>{n.label}</title></g>;
        const personHasCitation = citedPersonIds.has(n.id) || hasPersonCitation(n.id, citations);
        return <g key={n.id} transform={`translate(${n.x} ${n.y})`} className={getPersonNodeClassName(n.person, personHasCitation, selectedPersonId === n.id, displayMode)} onClick={(e) => { e.stopPropagation(); if (n.person) onSelectPerson?.(n.person); }}>
          <rect width={n.width} height={n.height} rx="14"/>
          <text x="16" y={displayMode === 'compact' ? 45 : 24} className="name"><title>{n.label}</title>{formatName(n.label)}</text>
          {displayMode !== 'compact' && <text x="16" y="41" className="dates">{formatLifeDates(n.person)}</text>}
          {displayMode === 'standard' && <text x="16" y="63" className="status-line"><tspan className={personHasCitation ? 'status-ok' : 'status-alert'}>{personHasCitation ? '出典あり' : '出典なし'}</tspan><tspan> ・ </tspan><tspan className={n.person?.confidence === 'uncertain' || n.person?.confidence === 'disputed' ? 'status-alert' : 'status-ok'}>{getConfidenceLabel(n.person?.confidence)}</tspan></text>}
          {displayMode === 'detailed' && <>
            <text x="16" y="56" className="title-line">{n.person?.rank_title || '称号・肩書なし'}</text>
            <text x="16" y="70" className="status-line">確度: <tspan className={n.person?.confidence === 'uncertain' || n.person?.confidence === 'disputed' ? 'status-alert' : 'status-ok'}>{getConfidenceLabel(n.person?.confidence)}</tspan></text>
            <text x="16" y="82" className="status-line">確認: <tspan className={n.person?.review_status === 'unreviewed' ? 'status-alert' : 'status-ok'}>{getReviewStatusLabel(n.person?.review_status)}</tspan> / <tspan className={personHasCitation ? 'status-ok' : 'status-alert'}>{personHasCitation ? '出典あり' : '出典なし'}</tspan></text>
          </>}
          {displayMode !== 'detailed' && <text x={n.width - 44} y="24" className={`citation-mark ${personHasCitation ? 'status-ok' : 'status-alert'}`}>{personHasCitation ? '出典' : '無出典'}</text>}
          {displayMode !== 'compact' && <text x={n.width - 28} y="78" className="gender-mark">{genderLabel[n.person?.gender ?? 'unknown'] ?? '不明'}</text>}
        </g>;
      })}</g>
    </svg>
  </div>;
}
