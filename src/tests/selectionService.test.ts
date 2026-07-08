import { describe, expect, it } from 'vitest';
import type { Event, ParentChildRelation, Person, Union, ValidationIssue } from '../models';
import { resolveSelectableTargetToPersonId, validationIssueToSelectableTarget } from '../services/selectionService';

const now = '2026-07-07T00:00:00.000Z';
const persons: Person[] = [
  { id: 'p1', display_name: '親', created_at: now, updated_at: now },
  { id: 'p2', display_name: '子', created_at: now, updated_at: now },
  { id: 'p3', display_name: '配偶者', created_at: now, updated_at: now },
];
const events: Event[] = [
  { id: 'e1', event_type: 'birth', target_type: 'person', target_id: 'p2', created_at: now, updated_at: now },
  { id: 'e-union', event_type: 'marriage', target_type: 'union', target_id: 'u1', created_at: now, updated_at: now },
];
const unions: Union[] = [{ id: 'u1', partner1_id: 'p1', partner2_id: 'p3', union_type: 'marriage', created_at: now, updated_at: now }];
const relations: ParentChildRelation[] = [{ id: 'r1', parent_id: 'p1', child_id: 'p2', relation_type: 'biological', created_at: now, updated_at: now }];
const data = { persons, events, unions, relations };

describe('resolveSelectableTargetToPersonId', () => {
  it('person targetを人物IDに解決する', () => {
    expect(resolveSelectableTargetToPersonId({ target_type: 'person', target_id: 'p1' }, data)).toBe('p1');
  });

  it('event targetは人物対象Eventの場合に関連人物へ誘導する', () => {
    expect(resolveSelectableTargetToPersonId({ target_type: 'event', target_id: 'e1' }, data)).toBe('p2');
    expect(resolveSelectableTargetToPersonId({ target_type: 'event', target_id: 'e-union' }, data)).toBeUndefined();
  });

  it('union targetはpartner人物へ誘導する', () => {
    expect(resolveSelectableTargetToPersonId({ target_type: 'union', target_id: 'u1' }, data)).toBe('p1');
  });

  it('relation targetは子または親人物へ誘導する', () => {
    expect(resolveSelectableTargetToPersonId({ target_type: 'relation', target_id: 'r1' }, data)).toBe('p2');
  });

  it('存在しないtarget_idでもクラッシュせずundefinedを返す', () => {
    expect(resolveSelectableTargetToPersonId({ target_type: 'person', target_id: 'missing' }, data)).toBeUndefined();
    expect(resolveSelectableTargetToPersonId({ target_type: 'event', target_id: 'missing' }, data)).toBeUndefined();
  });

  it('source / citation targetでもクラッシュせずundefinedを返す', () => {
    expect(resolveSelectableTargetToPersonId({ target_type: 'source', target_id: 's1' }, data)).toBeUndefined();
    expect(resolveSelectableTargetToPersonId({ target_type: 'citation', target_id: 'c1' }, data)).toBeUndefined();
  });
});

describe('validationIssueToSelectableTarget', () => {
  it('person / event / union / relation issueをSelectableTargetへ変換できる', () => {
    expect(validationIssueToSelectableTarget({ severity: 'warning', target_type: 'person', target_id: 'p1', message: 'person' })).toEqual({ target_type: 'person', target_id: 'p1' });
    expect(validationIssueToSelectableTarget({ severity: 'warning', target_type: 'event', target_id: 'e1', message: 'event' })).toEqual({ target_type: 'event', target_id: 'e1' });
    expect(validationIssueToSelectableTarget({ severity: 'warning', target_type: 'union', target_id: 'u1', message: 'union' })).toEqual({ target_type: 'union', target_id: 'u1' });
    expect(validationIssueToSelectableTarget({ severity: 'warning', target_type: 'relation', target_id: 'r1', message: 'relation' })).toEqual({ target_type: 'relation', target_id: 'r1' });
  });

  it('source / citation issueは専用詳細導線がないためSelectableTargetへ変換しない', () => {
    expect(validationIssueToSelectableTarget({ severity: 'warning', target_type: 'source', target_id: 's1', message: 'source' } as unknown as ValidationIssue)).toBeUndefined();
    expect(validationIssueToSelectableTarget({ severity: 'warning', target_type: 'citation', target_id: 'c1', message: 'citation' })).toBeUndefined();
  });

  it('target情報がないValidationIssueはundefinedになる', () => {
    expect(validationIssueToSelectableTarget({ severity: 'info', message: '全体メッセージ' })).toBeUndefined();
    expect(validationIssueToSelectableTarget({ severity: 'warning', target_type: 'person', message: 'idなし' })).toBeUndefined();
  });

  it('未対応target_typeやundefinedでもクラッシュせずundefinedになる', () => {
    expect(validationIssueToSelectableTarget({ severity: 'warning', target_type: 'name', target_id: 'n1', message: '未対応' } as unknown as ValidationIssue)).toBeUndefined();
    expect(validationIssueToSelectableTarget(undefined)).toBeUndefined();
    expect(validationIssueToSelectableTarget(null)).toBeUndefined();
  });
});
