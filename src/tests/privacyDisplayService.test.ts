import { describe, expect, it } from 'vitest';
import type { Person } from '../models';
import { createDefaultPrivacySetting } from '../services/projectSettingsService';
import { getPersonDisplayNameForPrivacy, getPersonLifeTextForPrivacy, maskPersonForPublicOutput } from '../services/privacyDisplayService';

const now = '2026-07-10T00:00:00.000Z';
const base: Person = { id: 'p1', display_name: '山田太郎', birth_date_text: '1900', death_date_text: '1970', honseki_text: '東京府', note: 'メモ', created_at: now, updated_at: now };

describe('privacyDisplayService', () => {
  it('public_output_mode OFFでは人物表示を変えない', () => {
    const setting = createDefaultPrivacySetting();
    expect(getPersonDisplayNameForPrivacy(base, base.display_name, setting)).toBe('山田太郎');
    expect(getPersonLifeTextForPrivacy(base, '1900 - 1970', setting)).toBe('1900 - 1970');
    expect(maskPersonForPublicOutput(base, setting)).toBe(base);
  });

  it('hidden/private人物を設定に応じて非公開表示にできる', () => {
    const setting = { ...createDefaultPrivacySetting(), public_output_mode: true };
    expect(getPersonDisplayNameForPrivacy({ ...base, privacy_level: 'hidden' }, base.display_name, setting)).toBe('非公開');
    expect(getPersonDisplayNameForPrivacy({ ...base, privacy_level: 'private' }, base.display_name, setting)).toBe('非公開');
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
