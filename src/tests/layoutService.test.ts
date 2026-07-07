import { describe, expect, it } from 'vitest';
import type { ParentChildRelation, Person, Union } from '../models';
import { buildFamilyLayout, calculateLayoutViewBox, sanitizeSelectedPersonId } from '../services/layoutService';

const now = '2026-01-01T00:00:00.000Z';
const person = (id: string, name = id, generation_no?: number): Person => ({ id, external_id: id, display_name: name, generation_no, confidence: 'confirmed', review_status: 'reviewed', created_at: now, updated_at: now });
const union = (id: string, partner1_id: string, partner2_id?: string): Union => ({ id, partner1_id, partner2_id, union_type: 'marriage', created_at: now, updated_at: now });
const relation = (id: string, parent_id: string, child_id: string, union_id?: string): ParentChildRelation => ({ id, parent_id, child_id, union_id, relation_type: 'biological', created_at: now, updated_at: now });

describe('layoutService', () => {
  it('1人だけのデータでlayoutNodesと余白付きviewBoxを生成する', () => {
    const layout = buildFamilyLayout([person('p1', '山田太郎')], [], []);
    expect(layout.layoutNodes).toHaveLength(1);
    expect(layout.layoutNodes[0]).toMatchObject({ id: 'p1', type: 'person' });
    expect(layout.viewBox.x).toBeLessThan(layout.layoutNodes[0].x);
    expect(layout.viewBox.y).toBeLessThan(layout.layoutNodes[0].y);
  });

  it('親子関係から人物ノードとUnionノードを生成する', () => {
    const layout = buildFamilyLayout([person('father'), person('mother'), person('child')], [union('u1', 'father', 'mother')], [relation('r1', 'father', 'child', 'u1')]);
    expect(layout.layoutNodes.filter((n) => n.type === 'person')).toHaveLength(3);
    expect(layout.layoutNodes.some((n) => n.type === 'union' && n.id === 'u1')).toBe(true);
    expect(layout.layoutEdges.some((e) => e.type === 'union-child')).toBe(true);
  });

  it('viewBox計算で上下左右に余白が付く', () => {
    const box = calculateLayoutViewBox([{ id: 'p1', type: 'person', x: 100, y: 200, width: 176, height: 84, label: 'p1' }], 50);
    expect(box).toEqual({ x: 50, y: 150, width: 276, height: 184 });
  });

  it('空データで落ちず、既定viewBoxを返す', () => {
    const layout = buildFamilyLayout([], [], []);
    expect(layout.layoutNodes).toEqual([]);
    expect(layout.layoutEdges).toEqual([]);
    expect(layout.viewBox.width).toBeGreaterThan(0);
  });

  it('存在しない人物参照があっても落ちず、issueに記録する', () => {
    const layout = buildFamilyLayout([person('p1')], [union('u1', 'p1', 'missing-partner')], [relation('r1', 'missing-parent', 'p1', 'missing-union')]);
    expect(layout.layoutNodes.some((n) => n.id === 'p1')).toBe(true);
    expect(layout.issues.map((i) => i.code)).toContain('LAYOUT_MISSING_PARTNER');
    expect(layout.issues.map((i) => i.code)).toContain('LAYOUT_MISSING_PARENT');
    expect(layout.issues.map((i) => i.code)).toContain('LAYOUT_MISSING_UNION');
  });


  it('描画用に親子線とUnion線へ関係状態を渡す', () => {
    const u: Union = { ...union('u1', 'father', 'mother'), union_type: 'partner', status: 'divorced', end_reason: 'divorce', confidence: 'uncertain', review_status: 'unreviewed' };
    const r: ParentChildRelation = { ...relation('r1', 'father', 'child', 'u1'), relation_type: 'adoptive', confidence: 'disputed', review_status: 'unreviewed' };
    const layout = buildFamilyLayout([person('father'), person('mother'), person('child')], [u], [r]);
    expect(layout.layoutEdges.find((e) => e.type === 'spouse')).toMatchObject({ union_type: 'partner', status: 'divorced', end_reason: 'divorce', confidence: 'uncertain', review_status: 'unreviewed' });
    expect(layout.layoutEdges.find((e) => e.type === 'union-child')).toMatchObject({ relation_type: 'adoptive', confidence: 'disputed', review_status: 'unreviewed' });
  });

  it('selected person IDが存在しない場合は安全にundefinedへ正規化する', () => {
    expect(sanitizeSelectedPersonId('p1', [person('p1')])).toBe('p1');
    expect(sanitizeSelectedPersonId('missing', [person('p1')])).toBeUndefined();
  });
});
