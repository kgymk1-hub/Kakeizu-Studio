// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { afterEach, expect, it, vi } from 'vitest';
import App from '../App';
import { buildStandardCsvSetFiles } from '../services/standardCsvSetService';
import { createDefaultExportSetting, createDefaultPrivacySetting, createDefaultProject, createDefaultViewSetting } from '../services/projectSettingsService';

const mocks = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn(), settings: vi.fn() }));
vi.mock('../db/repositories/familyRepository', async (original) => ({
  ...await original<typeof import('../db/repositories/familyRepository')>(),
  loadFamilyData: mocks.load, saveBackupData: mocks.save,
}));
vi.mock('../services/projectSettingsService', async (original) => ({
  ...await original<typeof import('../services/projectSettingsService')>(),
  loadProjectSettings: mocks.settings,
}));

const host = document.createElement('div');
document.body.append(host);
let root = createRoot(host);
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
afterEach(async () => {
  await act(async () => root.unmount());
  vi.restoreAllMocks();
});

it('標準CSVを反映した直後も再読込後も既存のName/Placeを表示する', async () => {
  const fixture = JSON.parse(readFileSync('samples/kakeizu_studio_v1_sample.json', 'utf8'));
  let stored = {
    persons: fixture.persons, unions: fixture.unions,
    parentChildRelations: fixture.parent_child_relations,
    sources: fixture.sources, citations: fixture.citations, events: fixture.events,
    names: fixture.names, places: fixture.places, importBatches: fixture.import_batches,
  };
  mocks.load.mockImplementation(async () => stored);
  mocks.save.mockImplementation(async (data) => { stored = data; });
  mocks.settings.mockResolvedValue({ project: createDefaultProject(), viewSetting: createDefaultViewSetting(), exportSetting: createDefaultExportSetting(), privacySetting: createDefaultPrivacySetting() });
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  await act(async () => root.render(<App />));
  const panel = () => host.querySelector('.name-place-panel')!;
  expect(panel().textContent).toContain('2 / 2 件');
  expect(panel().textContent).toContain('4 / 4 件');

  const files = Object.entries(buildStandardCsvSetFiles(stored)).map(([name, text]) => ({ name, text: async () => text }));
  const input = host.querySelector<HTMLInputElement>('input[type="file"][multiple]')!;
  Object.defineProperty(input, 'files', { value: files });
  await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
  const apply = Array.from(host.querySelectorAll('button')).find((button) => button.textContent === '標準CSVセットを反映')!;
  expect(apply.disabled).toBe(false);
  await act(async () => apply.click());
  expect(mocks.save).toHaveBeenCalled();
  expect(panel().textContent).toContain('2 / 2 件');
  expect(panel().textContent).toContain('4 / 4 件');
  expect(stored.names).toEqual(fixture.names);
  expect(stored.places).toEqual(fixture.places);

  await act(async () => root.unmount());
  root = createRoot(host);
  await act(async () => root.render(<App />));
  expect(panel().textContent).toContain('2 / 2 件');
  expect(panel().textContent).toContain('4 / 4 件');
});
