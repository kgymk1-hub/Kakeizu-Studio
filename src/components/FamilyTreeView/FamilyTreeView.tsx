import { useMemo, useState } from 'react';
import type { Citation, Confidence, LayoutEdge, LayoutNode, Person, RelationType, ReviewStatus, Union, UnionType, ValidationIssue } from '../../models';
import type { LayoutViewBox } from '../../services/layoutService';

export type FamilyTreeDisplayMode = 'compact' | 'standard' | 'detailed';

interface Props { nodes: LayoutNode[]; edges: LayoutEdge[]; viewBox: LayoutViewBox; issues?: ValidationIssue[]; citations?: Citation[]; citedPersonIds?: Set<string>; selectedPersonId?: string; onSelectPerson?: (person: Person) => void; initialDisplayMode?: FamilyTreeDisplayMode; }

const genderLabel: Record<string, string> = { male: '男', female: '女', unknown: '不明', other: '他' };
const confidenceLabels: Record<Confidence, string> = { confirmed: '確定', likely: '可能性高', uncertain: '要確認', disputed: '異説あり' };
const reviewStatusLabels: Record<ReviewStatus, string> = { reviewed: '確認済', unreviewed: '未確認', rejected: '除外' };
const displayModeLabels: Record<FamilyTreeDisplayMode, string> = { compact: 'コンパクト', standard: '標準', detailed: '詳細' };
const displayModes: FamilyTreeDisplayMode[] = ['compact', 'standard', 'detailed'];

const relationTypeLabels: Record<RelationType, string> = { biological: '実親子', adoptive: '養親子', special_adoptive: '特別養親子', step: '継親子', recognized: '認知', foster: '養育', unknown: '不明', disputed: '異説あり' };
const unionTypeLabels: Record<UnionType, string> = { marriage: '婚姻', partner: 'パートナー', concubine: '側室・内縁', unknown: '不明', other: 'その他' };
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


export function getEdgeClassName(edge: LayoutEdge) {
  const flags = ['edge', `edge-${edge.type}`];
  if (edge.type === 'spouse') {
    flags.push(`edge-union-${edge.union_type ?? 'unknown'}`);
    if (edge.status) flags.push(`edge-status-${edge.status}`);
    if (edge.end_reason) flags.push(`edge-end-${edge.end_reason}`);
    if (edge.status === 'divorced' || edge.end_reason === 'divorce') flags.push('edge-union-divorced');
    if (edge.status === 'widowed' || edge.end_reason === 'death') flags.push('edge-union-widowed');
    if (edge.status === 'ended') flags.push('edge-union-ended');
  } else {
    flags.push(`edge-relation-${edge.relation_type ?? 'unknown'}`);
  }
  if (edge.confidence) flags.push(`edge-confidence-${edge.confidence}`);
  if (edge.review_status) flags.push(`edge-review-${edge.review_status}`);
  return flags.filter(Boolean).join(' ');
}

export function getEdgeDashArray(edge: LayoutEdge) {
  if (edge.confidence === 'disputed' || edge.relation_type === 'disputed') return '10 4 2 4';
  if (edge.type === 'spouse') {
    if (edge.status === 'divorced' || edge.end_reason === 'divorce') return '10 5';
    if (edge.status === 'ended') return '8 4';
    if (edge.union_type === 'partner') return '9 5';
    if (edge.union_type === 'concubine') return '3 5';
    return undefined;
  }
  switch (edge.relation_type) {
    case 'adoptive': return '8 5';
    case 'special_adoptive': return '12 4';
    case 'step': return '2 5';
    case 'recognized': return '7 4';
    case 'foster': return '1 5';
    default: return undefined;
  }
}

export function getEdgeStrokeWidth(edge: LayoutEdge) {
  if (edge.relation_type === 'special_adoptive' || edge.confidence === 'disputed') return 3.4;
  if (edge.relation_type === 'foster') return 1.7;
  if (edge.type === 'spouse') return 3;
  return undefined;
}

export function getEdgeTitle(edge: LayoutEdge) {
  const confidence = edge.confidence ? ` / 確度: ${getConfidenceLabel(edge.confidence)}` : '';
  const review = edge.review_status ? ` / 確認: ${getReviewStatusLabel(edge.review_status)}` : '';
  if (edge.type === 'spouse') {
    const union = unionTypeLabels[edge.union_type ?? 'unknown'];
    const state = edge.status || edge.end_reason ? ` / 状態: ${edge.status ?? '-'} / 終了理由: ${edge.end_reason ?? '-'}` : '';
    return `夫婦・パートナー関係: ${union}${state}${confidence}${review}`;
  }
  return `親子関係: ${relationTypeLabels[edge.relation_type ?? 'unknown']}${confidence}${review}`;
}

export function getUnionNodeClassName(union?: Union) {
  const flags = [
    'union-node',
    `union-type-${union?.union_type ?? 'unknown'}`,
    union?.status ? `union-status-${union.status}` : '',
    union?.end_reason ? `union-end-${union.end_reason}` : '',
    union?.confidence ? `union-confidence-${union.confidence}` : '',
    union?.status === 'divorced' || union?.end_reason === 'divorce' ? 'union-ended-divorce' : '',
    union?.status === 'widowed' || union?.end_reason === 'death' ? 'union-ended-death' : '',
  ];
  return flags.filter(Boolean).join(' ');
}

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
    <div className="tree-legend" aria-label="関係線の凡例"><strong>凡例:</strong><span className="legend-sample relation-biological">実親子 = 実線</span><span className="legend-sample relation-adoptive">養親子 = 破線</span><span className="legend-sample relation-step">継親子 = 点線</span><span className="legend-sample union-marriage">婚姻 = 橙の実線</span><span className="legend-sample union-ended">離婚/終了 = 警告色・破線</span><span className="legend-sample relation-disputed">異説あり = 警告色</span></div>
    <svg className={`tree-svg display-${displayMode}`} viewBox={actualViewBox} role="img" aria-label="家系図" onMouseDown={(e) => setDragStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y })} onMouseMove={(e) => { if (!dragStart) return; const scaleX = viewBox.width / zoom / e.currentTarget.clientWidth; const scaleY = viewBox.height / zoom / e.currentTarget.clientHeight; setPan({ x: dragStart.panX - (e.clientX - dragStart.x) * scaleX, y: dragStart.panY - (e.clientY - dragStart.y) * scaleY }); }} onMouseUp={() => setDragStart(undefined)} onMouseLeave={() => setDragStart(undefined)}>
      <g>{edges.map((e) => { const a = byId.get(e.from), b = byId.get(e.to); if (!a || !b) return null; return <path key={e.id} d={edgePath(e, a, b)} className={getEdgeClassName(e)} data-relation-type={e.relation_type ?? 'unknown'} data-union-type={e.union_type ?? 'unknown'} data-union-status={e.status ?? 'unknown'} data-end-reason={e.end_reason ?? 'unknown'} strokeDasharray={getEdgeDashArray(e)} strokeWidth={getEdgeStrokeWidth(e)} aria-label={getEdgeTitle(e)}><title>{getEdgeTitle(e)}</title></path>; })}</g>
      <g>{nodes.map((n) => {
        if (n.type === 'union') return <g key={n.id} transform={`translate(${n.x} ${n.y})`} className={getUnionNodeClassName(n.union)} data-union-type={n.union?.union_type} data-union-status={n.union?.status} data-end-reason={n.union?.end_reason}><rect x="1" y="1" width={n.width - 2} height={n.height - 2} transform={`rotate(45 ${n.width / 2} ${n.height / 2})`} rx="3"/><title>{getEdgeTitle({ id: n.id, type: 'spouse', from: n.id, to: n.id, union_type: n.union?.union_type, status: n.union?.status, end_reason: n.union?.end_reason, confidence: n.union?.confidence, review_status: n.union?.review_status })}</title></g>;
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
