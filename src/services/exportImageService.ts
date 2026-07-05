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
