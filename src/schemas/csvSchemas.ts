import { z } from 'zod';
export const csvConfidenceSchema = z.enum(['confirmed','likely','uncertain','disputed']).optional().or(z.literal('').transform(() => undefined));
export const csvGenderSchema = z.enum(['male','female','unknown','other']).optional().or(z.literal('').transform(() => undefined));
const blankToUndefined = z.string().optional().transform((v) => { const t = (v ?? '').trim(); return t ? t : undefined; });
export const rawCsvPersonSchema = z.object({
  person_id: z.string().transform((v) => v.trim()).pipe(z.string().min(1, 'person_id is required')),
  name: z.string().transform((v) => v.trim()).pipe(z.string().min(1, 'name is required')),
  family_name: blankToUndefined, given_name: blankToUndefined, kana: blankToUndefined,
  gender: csvGenderSchema, birth_date: blankToUndefined, death_date: blankToUndefined,
  father_id: blankToUndefined, mother_id: blankToUndefined, spouse_ids: blankToUndefined,
  child_order: blankToUndefined, generation_no: blankToUndefined, title: blankToUndefined,
  note: blankToUndefined, source: blankToUndefined, confidence: csvConfidenceSchema,
}).passthrough();
export type RawCsvPerson = z.infer<typeof rawCsvPersonSchema>;
