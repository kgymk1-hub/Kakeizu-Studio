import { db } from '../db/dexieDb';
import type { ExportSetting, PrivacySetting, Project, ViewSetting } from '../models';

export const DEFAULT_PROJECT_ID = 'default-project';
export const DEFAULT_PROJECT_NAME = '既定プロジェクト';
export const DEFAULT_VIEW_SETTING_ID = 'default-view-setting';
export const DEFAULT_EXPORT_SETTING_ID = 'default-export-setting';
export const DEFAULT_PRIVACY_SETTING_ID = 'default-privacy-setting';

const now = () => new Date().toISOString();

export function createDefaultProject(date = now()): Project {
  return { id: DEFAULT_PROJECT_ID, name: DEFAULT_PROJECT_NAME, description: 'v0.8 development default project', created_at: date, updated_at: date };
}
export function createDefaultViewSetting(projectId = DEFAULT_PROJECT_ID, date = now()): ViewSetting {
  return { id: DEFAULT_VIEW_SETTING_ID, project_id: projectId, tree_display_mode: 'standard', show_relation_legend: true, created_at: date, updated_at: date };
}
export function createDefaultExportSetting(projectId = DEFAULT_PROJECT_ID, date = now()): ExportSetting {
  return { id: DEFAULT_EXPORT_SETTING_ID, project_id: projectId, show_title: true, title: '家系図', show_legend: true, background: 'white', created_at: date, updated_at: date };
}
export function createDefaultPrivacySetting(projectId = DEFAULT_PROJECT_ID, date = now()): PrivacySetting {
  return { id: DEFAULT_PRIVACY_SETTING_ID, project_id: projectId, public_output_mode: false, hide_living_persons: false, hide_private_persons: true, hide_hidden_persons: true, hide_honseki: true, mask_living_dates: true, created_at: date, updated_at: date };
}


export function normalizeRestoredProjectSettings(input: { projects?: Project[]; view_settings?: ViewSetting[]; export_settings?: ExportSetting[]; privacy_settings?: PrivacySetting[] }, date = now()) {
  const sourceProject = input.projects?.[0];
  const project: Project = { ...createDefaultProject(date), ...sourceProject, id: DEFAULT_PROJECT_ID, created_at: sourceProject?.created_at ?? date, updated_at: sourceProject?.updated_at ?? date };

  const sourceView = input.view_settings?.[0];
  const viewSetting: ViewSetting = { ...createDefaultViewSetting(DEFAULT_PROJECT_ID, date), ...sourceView, id: DEFAULT_VIEW_SETTING_ID, project_id: DEFAULT_PROJECT_ID, created_at: sourceView?.created_at ?? date, updated_at: sourceView?.updated_at ?? date };

  const sourceExport = input.export_settings?.[0];
  const exportSetting: ExportSetting = { ...createDefaultExportSetting(DEFAULT_PROJECT_ID, date), ...sourceExport, id: DEFAULT_EXPORT_SETTING_ID, project_id: DEFAULT_PROJECT_ID, created_at: sourceExport?.created_at ?? date, updated_at: sourceExport?.updated_at ?? date };

  const sourcePrivacy = input.privacy_settings?.[0];
  const privacySetting: PrivacySetting = { ...createDefaultPrivacySetting(DEFAULT_PROJECT_ID, date), ...sourcePrivacy, id: DEFAULT_PRIVACY_SETTING_ID, project_id: DEFAULT_PROJECT_ID, created_at: sourcePrivacy?.created_at ?? date, updated_at: sourcePrivacy?.updated_at ?? date };

  return { project, viewSetting, exportSetting, privacySetting };
}

export async function ensureDefaultProjectAndSettings() {
  const date = now();
  let project = await db.projects.get(DEFAULT_PROJECT_ID);
  if (!project) { project = createDefaultProject(date); await db.projects.put(project); }
  let viewSetting = await db.viewSettings.get(DEFAULT_VIEW_SETTING_ID);
  if (!viewSetting) { viewSetting = createDefaultViewSetting(project.id, date); await db.viewSettings.put(viewSetting); }
  let exportSetting = await db.exportSettings.get(DEFAULT_EXPORT_SETTING_ID);
  if (!exportSetting) { exportSetting = createDefaultExportSetting(project.id, date); await db.exportSettings.put(exportSetting); }
  let privacySetting = await db.privacySettings.get(DEFAULT_PRIVACY_SETTING_ID);
  if (!privacySetting) { privacySetting = createDefaultPrivacySetting(project.id, date); await db.privacySettings.put(privacySetting); }
  return { project, viewSetting, exportSetting, privacySetting };
}
export const loadProjectSettings = ensureDefaultProjectAndSettings;
export async function saveProject(project: Project) { const next = { ...project, updated_at: now() }; await db.projects.put(next); return next; }
export async function saveViewSetting(setting: ViewSetting) { const next = { ...setting, updated_at: now() }; await db.viewSettings.put(next); return next; }
export async function saveExportSetting(setting: ExportSetting) { const next = { ...setting, updated_at: now() }; await db.exportSettings.put(next); return next; }
export async function savePrivacySetting(setting: PrivacySetting) { const next = { ...setting, updated_at: now() }; await db.privacySettings.put(next); return next; }
