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
export type ValidationTargetType = 'person' | 'event' | 'union' | 'relation' | 'citation' | 'source' | 'name' | 'place';
export type SelectableTargetType = 'person' | 'event' | 'union' | 'relation' | 'source' | 'citation' | 'name' | 'place';
export interface SelectableTarget { target_type: SelectableTargetType; target_id: string; }
export type EventType = 'birth' | 'death' | 'marriage' | 'divorce' | 'adoption' | 'recognition' | 'entry_registry' | 'removal_registry' | 'transfer_registry' | 'name_change' | 'residence' | 'occupation' | 'title' | 'other';
export type EventTargetType = 'person' | 'union' | 'relation';
export type NameType = 'primary' | 'birth' | 'maiden' | 'alias' | 'childhood' | 'posthumous' | 'courtesy' | 'legal' | 'other';
export type PlaceType = 'honseki' | 'birth' | 'death' | 'residence' | 'marriage' | 'burial' | 'repository' | 'event' | 'other';

export type TreeDisplayMode = 'compact' | 'standard' | 'detailed';
export type ExportBackground = 'white' | 'transparent' | 'soft';
export interface Project { id: string; name: string; description?: string; created_at: string; updated_at: string; }
export interface ViewSetting { id: string; project_id: string; tree_display_mode: TreeDisplayMode; show_relation_legend: boolean; created_at: string; updated_at: string; }
export interface ExportSetting { id: string; project_id: string; show_title: boolean; title: string; show_legend: boolean; background: ExportBackground; created_at: string; updated_at: string; }
export interface PrivacySetting { id: string; project_id: string; public_output_mode: boolean; hide_living_persons: boolean; hide_private_persons: boolean; hide_hidden_persons: boolean; hide_honseki: boolean; mask_living_dates: boolean; created_at: string; updated_at: string; }

export type SourceType = 'current_koseki' | 'joseki' | 'kaisei_genkoseki' | 'website' | 'book' | 'interview' | 'ai_generated' | 'other';
export type CitationTargetType = 'person' | 'event' | 'union' | 'relation' | 'name' | 'place';

export interface Source { id: string; external_id?: string; source_type: SourceType; title: string; author_or_issuer?: string; issued_date_text?: string; obtained_date?: string; repository?: string; honseki_text?: string; place_id?: string; head_of_registry?: string; registry_type?: string; source_text?: string; url?: string; privacy_level?: PrivacyLevel; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface Citation { id: string; external_id?: string; source_id: string; target_type: CitationTargetType; target_id: string; page_or_location?: string; quote_text?: string; interpretation?: string; confidence?: Confidence; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface Event { id: string; external_id?: string; event_type: EventType; target_type: EventTargetType; target_id: string; date_text?: string; date_from?: string; date_to?: string; place_text?: string; place_id?: string; description?: string; confidence?: Confidence; review_status?: ReviewStatus; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }

export interface Name { id: string; external_id?: string; person_id: string; name_type: NameType; name_text: string; family_name?: string; given_name?: string; family_name_kana?: string; given_name_kana?: string; valid_from_text?: string; valid_to_text?: string; confidence?: Confidence; review_status?: ReviewStatus; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface Place { id: string; external_id?: string; place_type?: PlaceType; name: string; normalized_name?: string; address_text?: string; country?: string; prefecture?: string; municipality?: string; district?: string; privacy_level?: PrivacyLevel; confidence?: Confidence; review_status?: ReviewStatus; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }

export interface Person { id: string; external_id?: string; display_name: string; family_name?: string; given_name?: string; family_name_kana?: string; given_name_kana?: string; birth_family_name?: string; gender?: Gender; birth_date_text?: string; birth_date_from?: string; birth_date_to?: string; death_date_text?: string; death_date_from?: string; death_date_to?: string; birth_place_id?: string; death_place_id?: string; honseki_text?: string; occupation?: string; rank_title?: string; generation_no?: number; is_living?: boolean | 'unknown'; privacy_level?: PrivacyLevel; confidence?: Confidence; review_status?: ReviewStatus; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface Union { id: string; external_id?: string; partner1_id: string; partner2_id?: string; union_type: UnionType; marriage_date_text?: string; divorce_date_text?: string; end_date_text?: string; end_reason?: 'divorce' | 'death' | 'unknown' | 'other'; status?: 'married' | 'divorced' | 'widowed' | 'ended' | 'unknown'; confidence?: Confidence; review_status?: ReviewStatus; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface ParentChildRelation { id: string; external_id?: string; parent_id: string; child_id: string; union_id?: string; relation_type: RelationType; start_date_text?: string; end_date_text?: string; confidence?: Confidence; review_status?: ReviewStatus; note?: string; import_batch_id?: string; created_at: string; updated_at: string; }
export interface ImportBatch { id: string; external_id?: string; imported_at: string; import_type: 'csv_simple' | 'csv_standard' | 'json' | 'gedcom' | 'manual'; source_name?: string; imported_count: number; warning_count: number; error_count: number; mode?: 'simple_csv' | 'standard_csv_set'; import_policy?: import('../services/importPreviewService').ImportPolicy; placeholder_person_policy?: import('../services/importPreviewService').PlaceholderPersonPolicy; status?: 'completed' | 'completed_with_warnings' | 'failed' | 'preview_only'; source_label?: string; file_names?: string[]; total_rows?: number; imported_counts?: { persons: number; unions: number; relations: number; events: number; sources: number; citations: number; }; unresolved_reference_count?: number; placeholder_person_candidate_count?: number; created_at?: string; note?: string; }
export interface ValidationIssue { id?: string; severity: ValidationSeverity; category?: ValidationCategory; target_type?: ValidationTargetType; target_id?: string; title?: string; message: string; related_ids?: string[]; code?: string; row?: number; field?: string; external_id?: string; }
export interface ValidationResult { ok: boolean; issues: ValidationIssue[]; }
export interface LayoutNode { id: string; type: 'person' | 'union'; x: number; y: number; width: number; height: number; label: string; person?: Person; union?: Union; }
export interface LayoutEdge { id: string; type: 'spouse' | 'parent-child' | 'union-child'; from: string; to: string; relation_type?: RelationType; union_type?: UnionType; status?: Union['status']; end_reason?: Union['end_reason']; confidence?: Confidence; review_status?: ReviewStatus; }
