import type { Person, PrivacySetting } from '../models';

const isLiving = (person?: Pick<Person, 'is_living'>) => person?.is_living === true;
const isMaskedByPrivacy = (person: Person | undefined, setting: PrivacySetting) => !!person && setting.public_output_mode && ((person.privacy_level === 'hidden' && setting.hide_hidden_persons) || (person.privacy_level === 'private' && setting.hide_private_persons) || (isLiving(person) && setting.hide_living_persons));

export function getPersonDisplayNameForPrivacy(person: Person | undefined, fallback: string, setting?: PrivacySetting) {
  if (!person || !setting?.public_output_mode) return fallback;
  if (isMaskedByPrivacy(person, setting)) return '非公開';
  return fallback;
}

export function getPersonLifeTextForPrivacy(person: Person | undefined, normalLifeText: string, setting?: PrivacySetting) {
  if (!person || !setting?.public_output_mode) return normalLifeText;
  if (isMaskedByPrivacy(person, setting)) return '';
  if (isLiving(person) && setting.mask_living_dates) return '生存中';
  return normalLifeText;
}

export function getPersonRankTitleForPrivacy(person: Person | undefined, fallback: string, setting?: PrivacySetting) {
  if (!person || !setting?.public_output_mode) return fallback;
  if (isMaskedByPrivacy(person, setting)) return '';
  return fallback;
}

export function maskPersonForPublicOutput(person: Person, setting?: PrivacySetting): Person {
  if (!setting?.public_output_mode) return person;
  if (isMaskedByPrivacy(person, setting)) return { ...person, display_name: '非公開', birth_date_text: undefined, death_date_text: undefined, rank_title: undefined, occupation: undefined, honseki_text: undefined, note: undefined };
  if (isLiving(person) && setting.mask_living_dates) return { ...person, birth_date_text: undefined, death_date_text: undefined, honseki_text: setting.hide_honseki ? undefined : person.honseki_text, note: undefined };
  return { ...person, honseki_text: setting.hide_honseki ? undefined : person.honseki_text, note: undefined };
}
