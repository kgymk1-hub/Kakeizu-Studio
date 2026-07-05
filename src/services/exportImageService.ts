import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
export async function downloadElementAsPng(element: HTMLElement, filename='kakeizu.png') { const canvas = await html2canvas(element, { backgroundColor:'#ffffff', scale:2 }); const a = document.createElement('a'); a.download = filename; a.href = canvas.toDataURL('image/png'); a.click(); }
export async function downloadElementAsPdf(element: HTMLElement, filename='kakeizu.pdf') { const canvas = await html2canvas(element, { backgroundColor:'#ffffff', scale:2 }); const pdf = new jsPDF({ orientation:'landscape', unit:'px', format:[canvas.width, canvas.height] }); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height); pdf.save(filename); }
