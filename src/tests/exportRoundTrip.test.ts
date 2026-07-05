import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { importSimpleCsv } from '../services/csvImportService';
import { exportSimpleCsv } from '../services/csvExportService';
import { buildFamilyLayout } from '../services/layoutService';
describe('round trip and layout', () => { it('CSV→正規化→CSV→再インポートで人物数を維持する', () => { const data=importSimpleCsv(readFileSync('src/tests/sample_family.csv','utf8')); const exported=exportSimpleCsv(data.persons,data.unions,data.parentChildRelations); const again=importSimpleCsv(exported); expect(again.persons).toHaveLength(data.persons.length); }); it('Unionノード方式の描画ノード・エッジを生成できる', () => { const data=importSimpleCsv(readFileSync('src/tests/sample_family.csv','utf8')); const layout=buildFamilyLayout(data.persons,data.unions,data.parentChildRelations); expect(layout.layoutNodes.some(n=>n.type==='union')).toBe(true); expect(layout.layoutEdges.some(e=>e.type==='union-child')).toBe(true); }); });
