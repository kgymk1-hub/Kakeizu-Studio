import { describe, expect, it, vi } from 'vitest';
import { copyTextToClipboard } from '../components/CsvImport/CsvImport';

describe('copyTextToClipboard', () => {
  it('クリップボードAPIでテキストをコピーできる', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await copyTextToClipboard('prompt');

    expect(writeText).toHaveBeenCalledWith('prompt');
  });

  it('クリップボードAPIがない場合はエラーにできる', async () => {
    Object.assign(navigator, { clipboard: undefined });

    await expect(copyTextToClipboard('prompt')).rejects.toThrow('クリップボードAPI');
  });
});
