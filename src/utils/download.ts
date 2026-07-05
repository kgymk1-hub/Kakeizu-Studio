export function download(name: string, content: string | Blob, type = 'text/plain') {
  const a = document.createElement('a');
  a.download = name;
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
}
