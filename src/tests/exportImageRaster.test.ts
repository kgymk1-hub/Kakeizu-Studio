import { afterEach, describe, expect, it, vi } from 'vitest';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { downloadElementAsPdf } from '../services/exportImageService';

vi.mock('html2canvas', () => ({ default: vi.fn() }));
vi.mock('jspdf', () => ({ jsPDF: vi.fn(function () { return { addImage: vi.fn(), save: vi.fn() }; }) }));

afterEach(() => { vi.clearAllMocks(); });

describe('PDF output bounds', () => {
  it.each([{ width: 1960, height: 2000, orientation: 'portrait' }, { width: 2400, height: 1800, orientation: 'landscape' }])(
    '画像全体がページに収まる向きを選ぶ: $orientation',
    async ({ width, height, orientation }) => {
      const wrapper = document.createElement('section');
      const tree = document.createElement('div');
      tree.className = 'tree-export-preview';
      wrapper.append(tree);
      Object.defineProperties(wrapper, { scrollWidth: { value: 1200 }, scrollHeight: { value: 9000 } });
      Object.defineProperties(tree, { scrollWidth: { value: width / 2 }, scrollHeight: { value: height / 2 } });
      vi.mocked(html2canvas).mockResolvedValue({ width, height, toDataURL: () => 'data:image/png;base64,example' } as HTMLCanvasElement);
      await downloadElementAsPdf(wrapper);
      expect(html2canvas).toHaveBeenCalledWith(tree, expect.objectContaining({ width: width / 2, height: height / 2 }));
      const clonedTree = tree.cloneNode(true) as HTMLElement;
      await vi.mocked(html2canvas).mock.calls[0][1]!.onclone!(document, clonedTree);
      expect(clonedTree.style.width).toBe(`${width / 2}px`);
      expect(clonedTree.style.overflow).toBe('visible');
      expect(jsPDF).toHaveBeenCalledWith(expect.objectContaining({ orientation, format: [width, height], compress: true }));
    },
  );
});
