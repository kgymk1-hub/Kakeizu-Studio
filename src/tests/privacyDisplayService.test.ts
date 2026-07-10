import { describe, expect, it } from 'vitest';
import type { Person } from '../models';
import { createDefaultPrivacySetting } from '../services/projectSettingsService';
import { getPersonDisplayNameForPrivacy, getPersonLifeTextForPrivacy, getPersonRankTitleForPrivacy, maskPersonForPublicOutput } from '../services/privacyDisplayService';

const now = '2026-07-10T00:00:00.000Z';
const base: Person = { id: 'p1', display_name: '山田太郎', birth_date_text: '1900', death_date_text: '1970', rank_title: '従五位', occupation: '医師', honseki_text: '東京府', note: 'メモ', created_at: now, updated_at: now };

describe('privacyDisplayService', () => {
  it('public_output_mode OFFでは人物表示を変えない', () => {
    const setting = createDefaultPrivacySetting();
    expect(getPersonDisplayNameForPrivacy(base, base.display_name, setting)).toBe('山田太郎');
    expect(getPersonLifeTextForPrivacy(base, '1900 - 1970', setting)).toBe('1900 - 1970');
    expect(getPersonRankTitleForPrivacy(base, base.rank_title ?? '', setting)).toBe('従五位');
    expect(maskPersonForPublicOutput(base, setting)).toBe(base);
  });

  it('hidden/private人物を設定に応じて非公開表示にできる', () => {
    const setting = { ...createDefaultPrivacySetting(), public_output_mode: true };
    expect(getPersonDisplayNameForPrivacy({ ...base, privacy_level: 'hidden' }, base.display_name, setting)).toBe('非公開');
    expect(getPersonDisplayNameForPrivacy({ ...base, privacy_level: 'private' }, base.display_name, setting)).toBe('非公開');
  });

  it('hidden人物をマスクする場合、詳細補足を消し、元Personを書き換えない', () => {
    const setting = { ...createDefaultPrivacySetting(), public_output_mode: true };
    const hidden = { ...base, privacy_level: 'hidden' as const };
    const masked = maskPersonForPublicOutput(hidden, setting);
    expect(getPersonRankTitleForPrivacy(hidden, hidden.rank_title ?? '', setting)).toBe('');
    expect(masked.rank_title).toBeUndefined();
    expect(masked.occupation).toBeUndefined();
    expect(masked.honseki_text).toBeUndefined();
    expect(masked.note).toBeUndefined();
    expect(hidden.rank_title).toBe('従五位');
  });

  it('private人物をマスクする場合、詳細補足を消し、元Personを書き換えない', () => {
    const setting = { ...createDefaultPrivacySetting(), public_output_mode: true };
    const privatePerson = { ...base, privacy_level: 'private' as const };
    const masked = maskPersonForPublicOutput(privatePerson, setting);
    expect(getPersonRankTitleForPrivacy(privatePerson, privatePerson.rank_title ?? '', setting)).toBe('');
    expect(masked.rank_title).toBeUndefined();
    expect(masked.occupation).toBeUndefined();
    expect(masked.honseki_text).toBeUndefined();
    expect(masked.note).toBeUndefined();
    expect(privatePerson.occupation).toBe('医師');
  });

  it('living人物の日付をマスクし、元Personを書き換えない', () => {
    const setting = { ...createDefaultPrivacySetting(), public_output_mode: true };
    const living = { ...base, is_living: true as const };
    expect(getPersonLifeTextForPrivacy(living, '2000 - ', setting)).toBe('生存中');
    const masked = maskPersonForPublicOutput(living, setting);
    expect(masked).not.toBe(living);
    expect(living.birth_date_text).toBe('1900');
    expect(masked.birth_date_text).toBeUndefined();
  });
});
