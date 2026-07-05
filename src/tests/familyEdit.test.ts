import { describe, expect, it } from 'vitest';
import { addRelative, createEmptyPerson } from '../services/familyEditService';

describe('familyEditService', () => {
  const base = createEmptyPerson({
    display_name: '基準人物',
    generation_no: 2,
  });

  it('父を追加すると親子関係を作成する', () => {
    const next = addRelative(
      { persons: [base], unions: [], parentChildRelations: [] },
      { basePersonId: base.id, kind: 'father', displayName: '新規父' },
    );

    expect(next.persons).toHaveLength(2);
    expect(next.parentChildRelations).toHaveLength(1);
    expect(next.parentChildRelations[0].parent_id).toBe(next.persons[1].id);
    expect(next.parentChildRelations[0].child_id).toBe(base.id);
  });

  it('配偶者を追加するとUnionを作成する', () => {
    const next = addRelative(
      { persons: [base], unions: [], parentChildRelations: [] },
      { basePersonId: base.id, kind: 'spouse', displayName: '新規配偶者' },
    );

    expect(next.persons).toHaveLength(2);
    expect(next.unions).toHaveLength(1);
    expect(next.unions[0].partner1_id).toBe(base.id);
    expect(next.unions[0].partner2_id).toBe(next.persons[1].id);
  });

  it('子を追加すると片親Unionと親子関係を作成する', () => {
    const next = addRelative(
      { persons: [base], unions: [], parentChildRelations: [] },
      { basePersonId: base.id, kind: 'child', displayName: '新規子' },
    );

    expect(next.persons).toHaveLength(2);
    expect(next.unions).toHaveLength(1);
    expect(next.parentChildRelations).toHaveLength(1);
    expect(next.parentChildRelations[0].union_id).toBe(next.unions[0].id);
  });
});
