export type Gender = 'male' | 'female' | 'unknown' | 'other';
export type Confidence = 'confirmed' | 'likely' | 'uncertain' | 'disputed';
export type ReviewStatus = 'unreviewed' | 'reviewed' | 'rejected';
export type PrivacyLevel = 'public' | 'private' | 'hidden';
export type UnionType = 'marriage' | 'partner' | 'concubine' | 'unknown' | 'other';
export type RelationType = 'biological' | 'adoptive' | 'special_adoptive' | 'step' | 'recognized' | 'foster' | 'unknown' | 'disputed';
export type ValidationSeverity = 'error' | 'warning' | 'info';
export type ValidationCategory =
  | 'missing_citation'
  | 'unreviewed'
  | 'low_confidence'
  | 'broken_reference'
  | 'self_reference'
  | 'date_inconsistency'
  | 'age_warning';
export type ValidationTargetType = 'person' | 'event' | 'union' | 'relation' | 'citation';
export type SelectableTargetType = 'person' | 'event' | 'union' | 'relation' | 'source' | 'citation';
export interface SelectableTarget { target_type: SelectableTargetType; target_id: string; }
export type EventType = 'birth' | 'death' | 'marriage' | 'divorce' | 'adoption' | 'recognition' | 'entry_registry' | 'removal_registry' | 'transfer_registry' | 'name_change' | 'residence' | 'occupation' | 'title' | 'other';
export type EventTargetType = 'person' | 'union' | 'relation';

export type SourceType = 'current_koseki' | 'joseki' | 'kaisei_genkoseki' | 'website' | 'book' | 'interview' | 'ai_generated' | 'other';
export type CitationTargetType = 'person' | 'event' | 'union' | 'relation' | 'name' | 'place';

export interface Source { id: string; external_id?: string; source_type: SourceType; title: string; author_or_issuer?: string; issued_date_text?: string; obtained_date?: string; repository?: string; honseki_text?: string; head_of_registry?: string; registry_type?: string; source_text?: string; url?: string; privacy_level?: PrivacyLevel; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface Citation { id: string; external_id?: string; source_id: string; target_type: CitationTargetType; target_id: string; page_or_location?: string; quote_text?: string; interpretation?: string; confidence?: Confidence; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface Event { id: string; external_id?: string; event_type: EventType; target_type: EventTargetType; target_id: string; date_text?: string; date_from?: string; date_to?: string; place_text?: string; description?: string; confidence?: Confidence; review_status?: ReviewStatus; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }

export interface Person { id: string; external_id?: string; display_name: string; family_name?: string; given_name?: string; family_name_kana?: string; given_name_kana?: string; birth_family_name?: string; gender?: Gender; birth_date_text?: string; birth_date_from?: string; birth_date_to?: string; death_date_text?: string; death_date_from?: string; death_date_to?: string; birth_place_id?: string; death_place_id?: string; honseki_text?: string; occupation?: string; rank_title?: string; generation_no?: number; is_living?: boolean | 'unknown'; privacy_level?: PrivacyLevel; confidence?: Confidence; review_status?: ReviewStatus; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface Union { id: string; external_id?: string; partner1_id: string; partner2_id?: string; union_type: UnionType; marriage_date_text?: string; divorce_date_text?: string; end_date_text?: string; end_reason?: 'divorce' | 'death' | 'unknown' | 'other'; status?: 'married' | 'divorced' | 'widowed' | 'ended' | 'unknown'; confidence?: Confidence; review_status?: ReviewStatus; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface ParentChildRelation { id: string; external_id?: string; parent_id: string; child_id: string; union_id?: string; relation_type: RelationType; start_date_text?: string; end_date_text?: string; confidence?: Confidence; review_status?: ReviewStatus; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface ImportBatch { id: string; external_id?: string; imported_at: string; import_type: 'csv_simple' | 'csv_standard' | 'json' | 'gedcom' | 'manual'; source_name?: string; imported_count: number; warning_count: number; error_count: number; note?: string; }
export interface ValidationIssue { id?: string; severity: ValidationSeverity; category?: ValidationCategory; target_type?: ValidationTargetType; target_id?: string; title?: string; message: string; related_ids?: string[]; code?: string; row?: number; field?: string; external_id?: string; }
export interface ValidationResult { ok: boolean; issues: ValidationIssue[]; }
export interface LayoutNode { id: string; type: 'person' | 'union'; x: number; y: number; width: number; height: number; label: string; person?: Person; union?: Union; }
export interface LayoutEdge { id: string; type: 'spouse' | 'parent-child' | 'union-child'; from: string; to: string; relation_type?: RelationType; union_type?: UnionType; status?: Union['status']; end_reason?: Union['end_reason']; confidence?: Confidence; review_status?: ReviewStatus; }
