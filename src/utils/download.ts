export function download(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a');
  a.download = name;
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.click();
  URL.revokeObjectURL(a.href);
}
