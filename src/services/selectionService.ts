import type { Event, ParentChildRelation, Person, SelectableTarget, Union, ValidationIssue } from '../models';

export interface SelectableTargetData {
  persons: Pick<Person, 'id'>[];
  events: Pick<Event, 'id' | 'target_type' | 'target_id'>[];
  unions: Pick<Union, 'id' | 'partner1_id' | 'partner2_id'>[];
  relations: Pick<ParentChildRelation, 'id' | 'parent_id' | 'child_id'>[];
}

const hasPerson = (persons: Pick<Person, 'id'>[], personId: string | undefined) => !!personId && persons.some((p) => p.id === personId);

export function resolveSelectableTargetToPersonId(target: SelectableTarget, data: SelectableTargetData): string | undefined {
  if (target.target_type === 'person') return hasPerson(data.persons, target.target_id) ? target.target_id : undefined;

  if (target.target_type === 'event') {
    const event = data.events.find((e) => e.id === target.target_id);
    return event?.target_type === 'person' && hasPerson(data.persons, event.target_id) ? event.target_id : undefined;
  }

  if (target.target_type === 'union') {
    const union = data.unions.find((u) => u.id === target.target_id);
    if (!union) return undefined;
    if (hasPerson(data.persons, union.partner1_id)) return union.partner1_id;
    if (hasPerson(data.persons, union.partner2_id)) return union.partner2_id;
    return undefined;
  }

  if (target.target_type === 'relation') {
    const relation = data.relations.find((r) => r.id === target.target_id);
    if (!relation) return undefined;
    if (hasPerson(data.persons, relation.child_id)) return relation.child_id;
    if (hasPerson(data.persons, relation.parent_id)) return relation.parent_id;
    return undefined;
  }

  // Source / Citation dedicated lists are planned for later v0.6 phases.
  return undefined;
}

const selectableValidationTargetTypes: ReadonlySet<SelectableTarget['target_type']> = new Set(['person', 'event', 'union', 'relation']);

export function validationIssueToSelectableTarget(issue: ValidationIssue | undefined | null): SelectableTarget | undefined {
  if (!issue?.target_type || !issue.target_id) return undefined;
  if (!selectableValidationTargetTypes.has(issue.target_type as SelectableTarget['target_type'])) return undefined;
  return { target_type: issue.target_type as SelectableTarget['target_type'], target_id: issue.target_id };
}
