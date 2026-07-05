import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PersonDetailPanel } from '../components/PersonDetailPanel/PersonDetailPanel';
import type { Citation, Person } from '../models';

const now = '2026-07-05T00:00:00.000Z';
const person: Person = { id: 'p1', external_id: 'P001', display_name: '人物A', gender: 'unknown', confidence: 'confirmed', review_status: 'reviewed', created_at: now, updated_at: now };
const missingSourceCitation: Citation = { id: 'c1', source_id: 'missing', target_type: 'person', target_id: 'p1', created_at: now, updated_at: now };

describe('PersonDetailPanel Source/Citation display', () => {
  it('Sourceが存在しないCitationでも安全な表示で落ちない', () => {
    const html = renderToStaticMarkup(<PersonDetailPanel person={person} sources={[]} citations={[missingSourceCitation]} onChange={() => undefined} onSaveCitation={() => undefined} onDeleteCitation={() => undefined} />);

    expect(html).toContain('参照先資料なし');
    expect(html).toContain('出典あり');
  });
});
