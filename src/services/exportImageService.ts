type Html2CanvasModule = typeof import('html2canvas');
type JsPdfModule = typeof import('jspdf');

async function renderElementToCanvas(element: HTMLElement) {
  const module: Html2CanvasModule = await import('html2canvas');
  const html2canvas = module.default;
  return html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
}

export async function downloadElementAsPng(element: HTMLElement, filename = 'kakeizu.png') {
  const canvas = await renderElementToCanvas(element);
  const a = document.createElement('a');
  a.download = filename;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

export async function downloadElementAsPdf(element: HTMLElement, filename = 'kakeizu.pdf') {
  const canvas = await renderElementToCanvas(element);
  const { jsPDF }: JsPdfModule = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}

const SVG_EXPORT_STYLE = `
.tree-export-title{margin:0 18px 14px;text-align:center;color:#10233f;font-size:28px;line-height:1.3;letter-spacing:.04em;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif}
.tree-svg{width:100%;min-width:980px;height:760px;background:transparent}
.edge{stroke:#31506f;stroke-width:2.4;fill:none;stroke-linecap:round;stroke-linejoin:round}
.edge-spouse{stroke:#f28c28;stroke-width:3}.edge-union-child,.edge-parent-child{stroke:#31506f}
.edge-relation-disputed,.edge-confidence-disputed,.edge-union-divorced,.edge-union-ended{stroke:#b3261e;stroke-width:3}.edge-confidence-uncertain{stroke:#d68910}.edge-union-marriage{stroke:#f28c28}.edge-union-partner{stroke:#c96d12}.edge-union-widowed{stroke:#6b7280}
.person-node rect{fill:#fffaf1;stroke:#31506f;stroke-width:2}.person-node.display-compact rect{fill:#fffdf8}.person-node.display-standard rect{fill:#fffaf1}.person-node.display-detailed rect{fill:#fff7ea}.person-node.missing-citation rect{stroke:#b7791f;stroke-dasharray:6 4}.person-node.unreviewed rect{fill:#fff8df}.person-node.low-confidence rect{stroke:#d68910}.person-node.disputed-confidence rect{stroke:#b3261e;stroke-width:3}.person-node .name{font-size:16px;font-weight:800;fill:#10233f}.person-node .dates,.person-node .meta{font-size:12px;fill:#5c6575}.person-node .citation-mark{font-size:11px;font-weight:800;fill:#c96d12}.person-node .status-ok{fill:#2f6f3e;font-weight:800}.person-node .status-alert{fill:#b3261e;font-weight:900}.person-node .title-line{font-size:11px;font-weight:700;fill:#4b5870}.person-node .status-line{font-size:10.5px;fill:#5c6575}.person-node .gender-mark{font-size:10px;font-weight:800;fill:#8a6a40}
.union-node rect{fill:#fff7ea;stroke:#f28c28;stroke-width:2}.union-node.union-divorced rect,.union-node.union-ended rect{fill:#fff1e8;stroke:#b3261e}.union-node.union-widowed rect{fill:#eef0f3;stroke:#6b7280}.union-node.union-disputed rect{fill:#fff1f0;stroke:#b3261e;stroke-width:3}
.edge-legend{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:8px 10px;border:1px solid #ead8bc;border-radius:14px;background:#fffdf8e6;font-size:12px;color:#10233f;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif}.edge-legend span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.legend-line{display:inline-block;width:30px;border-top:3px solid #31506f}.legend-line.dashed{border-top-style:dashed}.legend-line.dotted{border-top-style:dotted}.legend-line.marriage{border-color:#f28c28}.legend-line.ended{border-color:#b3261e;border-top-style:dashed}.legend-line.disputed{border-color:#b3261e}
`;

const SVG_BACKGROUND: Record<string, string> = {
  white: '#ffffff',
  soft: '#fff7ea',
  transparent: 'transparent',
};

function getExportBackground(element: HTMLElement) {
  if (element.querySelector('.tree-export-bg-soft') || element.classList.contains('tree-export-bg-soft')) return 'soft';
  if (element.querySelector('.tree-export-bg-transparent') || element.classList.contains('tree-export-bg-transparent')) return 'transparent';
  return 'white';
}

function getElementSize(element: HTMLElement) {
  return {
    width: Math.max(1, Math.ceil(element.scrollWidth || element.getBoundingClientRect().width || 1200)),
    height: Math.max(1, Math.ceil(element.scrollHeight || element.getBoundingClientRect().height || 900)),
  };
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function createSvgTextFromElement(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[data-html2canvas-ignore="true"]').forEach((ignored) => ignored.remove());
  clone.querySelectorAll('svg').forEach((svg) => {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });
  const { width, height } = getElementSize(element);
  const background = getExportBackground(element);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  clone.setAttribute('style', `box-sizing:border-box;width:${width}px;min-height:${height}px;padding-top:24px;background:transparent;color:#10233f;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif;`);
  const serialized = new XMLSerializer().serializeToString(clone);
  const backgroundRect = background === 'transparent' ? '' : `<rect width="100%" height="100%" fill="${SVG_BACKGROUND[background]}" data-export-background="${background}"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" data-export-background="${background}">
${backgroundRect}
<style>${escapeXml(SVG_EXPORT_STYLE)}</style>
<foreignObject x="0" y="0" width="${width}" height="${height}">${serialized}</foreignObject>
</svg>
`;
}

export function downloadSvgFromElement(element: HTMLElement, fileName = 'kakeizu.svg'): void {
  const svgText = createSvgTextFromElement(element);
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
