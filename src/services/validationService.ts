import type { Citation, Event, ParentChildRelation, Person, Source, Union, ValidationIssue, ValidationSeverity } from '../models';

type ValidatedEntity = Person | Event | ParentChildRelation | Union;
type ValidatedTargetType = 'person' | 'event' | 'relation' | 'union';

export interface ValidateFamilyDataInput {
  persons: Person[];
  unions: Union[];
  parentChildRelations: ParentChildRelation[];
  events: Event[];
  sources: Source[];
  citations: Citation[];
}

const severityRank: Record<ValidationSeverity, number> = { error: 0, warning: 1, info: 2 };
const labels: Record<ValidatedTargetType, string> = { person: '人物', event: '出来事', relation: '親子関係', union: '夫婦関係' };
const citationTargetLabels = { ...labels, citation: 'Citation' } as const;

export function extractYear(value?: string): number | undefined {
  const match = value?.match(/(?:^|[^0-9])([12][0-9]{3})(?:[^0-9]|$)/);
  return match ? Number(match[1]) : undefined;
}

export function validateFamilyData(input: ValidateFamilyDataInput): ValidationIssue[] {
  const { persons, unions, parentChildRelations, events, sources, citations } = input;
  const issues: ValidationIssue[] = [];
  const personIds = new Set(persons.map((p) => p.id));
  const unionIds = new Set(unions.map((u) => u.id));
  const relationIds = new Set(parentChildRelations.map((r) => r.id));
  const eventIds = new Set(events.map((e) => e.id));
  const sourceIds = new Set(sources.map((s) => s.id));
  const citationsByTarget = new Set(citations.map((c) => `${c.target_type}:${c.target_id}`));
  const personById = new Map(persons.map((p) => [p.id, p]));

  const add = (issue: Omit<ValidationIssue, 'id'> & { id?: string }) => {
    issues.push({ id: issue.id ?? `${issue.category}:${issue.target_type}:${issue.target_id}:${issues.length}`, ...issue });
  };

  const checkCommon = (target_type: ValidatedTargetType, entity: ValidatedEntity) => {
    if (!citationsByTarget.has(`${target_type}:${entity.id}`)) {
      add({ severity: 'warning', category: 'missing_citation', target_type, target_id: entity.id, title: `${labels[target_type]}に出典がありません`, message: `この${labels[target_type]}には出典がありません。` });
    }
    if (entity.review_status === 'unreviewed') {
      add({ severity: 'warning', category: 'unreviewed', target_type, target_id: entity.id, title: `${labels[target_type]}が未確認です`, message: `この${labels[target_type]}は未確認です。` });
    }
    if (entity.confidence === 'uncertain' || entity.confidence === 'disputed') {
      add({ severity: 'warning', category: 'low_confidence', target_type, target_id: entity.id, title: `${labels[target_type]}の確度が低いです`, message: `この${labels[target_type]}の確度は ${entity.confidence} です。` });
    }
  };

  persons.forEach((p) => {
    checkCommon('person', p);
    const birthYear = extractYear(p.birth_date_text);
    const deathYear = extractYear(p.death_date_text);
    if (birthYear !== undefined && deathYear !== undefined && deathYear < birthYear) {
      add({ severity: 'error', category: 'date_inconsistency', target_type: 'person', target_id: p.id, title: '死亡年が出生年より前です', message: `死亡年 ${deathYear} が出生年 ${birthYear} より前です。` });
    }
  });

  events.forEach((e) => {
    checkCommon('event', e);
    if (e.target_type === 'person' && !personIds.has(e.target_id)) addBroken('event', e.id, `Event ${e.id} は存在しないPerson ${e.target_id} を参照しています。`, [e.target_id]);
    if (e.target_type === 'union' && !unionIds.has(e.target_id)) addBroken('event', e.id, `Event ${e.id} は存在しないUnion ${e.target_id} を参照しています。`, [e.target_id]);
    if (e.target_type === 'relation' && !relationIds.has(e.target_id)) addBroken('event', e.id, `Event ${e.id} は存在しない親子関係 ${e.target_id} を参照しています。`, [e.target_id]);
  });

  unions.forEach((u) => {
    checkCommon('union', u);
    if (!personIds.has(u.partner1_id)) addBroken('union', u.id, `partner1_id が存在しないPerson ${u.partner1_id} を参照しています。`, [u.partner1_id]);
    if (u.partner2_id && !personIds.has(u.partner2_id)) addBroken('union', u.id, `partner2_id が存在しないPerson ${u.partner2_id} を参照しています。`, [u.partner2_id]);
    if (u.partner2_id && u.partner1_id === u.partner2_id) add({ severity: 'error', category: 'self_reference', target_type: 'union', target_id: u.id, title: '夫婦関係が自己参照しています', message: 'partner1_id と partner2_id が同一です。', related_ids: [u.partner1_id] });
  });

  parentChildRelations.forEach((r) => {
    checkCommon('relation', r);
    if (!personIds.has(r.parent_id)) addBroken('relation', r.id, `parent_id が存在しないPerson ${r.parent_id} を参照しています。`, [r.parent_id]);
    if (!personIds.has(r.child_id)) addBroken('relation', r.id, `child_id が存在しないPerson ${r.child_id} を参照しています。`, [r.child_id]);
    if (r.union_id && !unionIds.has(r.union_id)) addBroken('relation', r.id, `union_id が存在しないUnion ${r.union_id} を参照しています。`, [r.union_id]);
    if (r.parent_id === r.child_id) add({ severity: 'error', category: 'self_reference', target_type: 'relation', target_id: r.id, title: '親子関係が自己参照しています', message: 'parent_id と child_id が同一です。', related_ids: [r.parent_id] });
    const parentYear = extractYear(personById.get(r.parent_id)?.birth_date_text);
    const childYear = extractYear(personById.get(r.child_id)?.birth_date_text);
    if (parentYear !== undefined && childYear !== undefined) {
      if (childYear < parentYear) add({ severity: 'error', category: 'date_inconsistency', target_type: 'relation', target_id: r.id, title: '子の出生年が親の出生年より前です', message: `子の出生年 ${childYear} が親の出生年 ${parentYear} より前です。`, related_ids: [r.parent_id, r.child_id] });
      const age = childYear - parentYear;
      if (age < 10) add({ severity: 'warning', category: 'age_warning', target_type: 'relation', target_id: r.id, title: '親の年齢が低すぎる可能性があります', message: `子の出生時の親の年齢が ${age} 歳です。`, related_ids: [r.parent_id, r.child_id] });
      if (age > 80) add({ severity: 'warning', category: 'age_warning', target_type: 'relation', target_id: r.id, title: '親の年齢が高すぎる可能性があります', message: `子の出生時の親の年齢が ${age} 歳です。`, related_ids: [r.parent_id, r.child_id] });
    }
  });

  citations.forEach((c) => {
    if (!sourceIds.has(c.source_id)) addBroken('citation', c.id, `Citation ${c.id} は存在しないSource ${c.source_id} を参照しています。`, [c.source_id]);
    if (c.target_type === 'person' && !personIds.has(c.target_id)) addBroken('citation', c.id, `Citation ${c.id} は存在しないPerson ${c.target_id} を参照しています。`, [c.target_id]);
    if (c.target_type === 'event' && !eventIds.has(c.target_id)) addBroken('citation', c.id, `Citation ${c.id} は存在しないEvent ${c.target_id} を参照しています。`, [c.target_id]);
    if (c.target_type === 'union' && !unionIds.has(c.target_id)) addBroken('citation', c.id, `Citation ${c.id} は存在しないUnion ${c.target_id} を参照しています。`, [c.target_id]);
    if (c.target_type === 'relation' && !relationIds.has(c.target_id)) addBroken('citation', c.id, `Citation ${c.id} は存在しない親子関係 ${c.target_id} を参照しています。`, [c.target_id]);
    // name/place は現時点で実体モデルが未実装のため、参照先不明エラーにはしない。
  });

  function addBroken(target_type: 'person' | 'event' | 'union' | 'relation' | 'citation', target_id: string, message: string, related_ids?: string[]) {
    add({ severity: 'error', category: 'broken_reference', target_type, target_id, title: `${citationTargetLabels[target_type]}の参照先が見つかりません`, message, related_ids });
  }

  return issues.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || (a.category ?? '').localeCompare(b.category ?? '') || (a.target_type ?? '').localeCompare(b.target_type ?? ''));
}
