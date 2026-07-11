import type { Citation, Event, ExportSetting, ImportBatch, Name, ParentChildRelation, Person, Place, PrivacySetting, Project, Source, Union, ViewSetting } from '../models';
import { createDefaultExportSetting, createDefaultPrivacySetting, createDefaultProject, createDefaultViewSetting } from './projectSettingsService';

export interface BackupData {
  schema_version: '1.0' | '1.1' | '1.2' | '1.3' | '1.4';
  exported_at: string;
  persons: Person[];
  unions: Union[];
  parent_child_relations: ParentChildRelation[];
  import_batches: ImportBatch[];
  sources: Source[];
  citations: Citation[];
  events: Event[];
  projects: Project[];
  view_settings: ViewSetting[];
  export_settings: ExportSetting[];
  privacy_settings: PrivacySetting[];
  names: Name[];
  places: Place[];
}

type BackupInput = Omit<BackupData, 'schema_version' | 'exported_at' | 'events' | 'projects' | 'view_settings' | 'export_settings' | 'privacy_settings' | 'names' | 'places'> & { events?: Event[]; projects?: Project[]; view_settings?: ViewSetting[]; export_settings?: ExportSetting[]; privacy_settings?: PrivacySetting[]; names?: Name[]; places?: Place[] };

export function createJsonBackup(data: BackupInput) {
  return JSON.stringify({ schema_version: '1.4', exported_at: new Date().toISOString(), ...data, events: data.events ?? [], projects: data.projects ?? [createDefaultProject()], view_settings: data.view_settings ?? [createDefaultViewSetting()], export_settings: data.export_settings ?? [createDefaultExportSetting()], privacy_settings: data.privacy_settings ?? [createDefaultPrivacySetting()], names: data.names ?? [], places: data.places ?? [] }, null, 2);
}

export function parseJsonBackup(json: string): BackupData {
  const data = JSON.parse(json) as Partial<BackupData>;
  if (data.schema_version !== '1.0' && data.schema_version !== '1.1' && data.schema_version !== '1.2' && data.schema_version !== '1.3' && data.schema_version !== '1.4') throw new Error('Unsupported schema_version');
  return {
    schema_version: data.schema_version,
    exported_at: data.exported_at ?? new Date().toISOString(),
    persons: data.persons ?? [],
    unions: data.unions ?? [],
    parent_child_relations: data.parent_child_relations ?? [],
    import_batches: data.import_batches ?? [],
    sources: data.sources ?? [],
    citations: data.citations ?? [],
    events: data.events ?? [],
    projects: data.projects?.length ? data.projects : [createDefaultProject()],
    view_settings: data.view_settings?.length ? data.view_settings : [createDefaultViewSetting()],
    export_settings: data.export_settings?.length ? data.export_settings : [createDefaultExportSetting()],
    privacy_settings: data.privacy_settings?.length ? data.privacy_settings : [createDefaultPrivacySetting()],
    names: data.names ?? [],
    places: data.places ?? [],
  };
}
