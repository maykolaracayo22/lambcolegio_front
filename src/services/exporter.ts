// src/services/exporter.ts
// Utilidades para descargar contenido como archivo (CSV/JSON/etc)

export function downloadFile(opts: { filename: string; mime?: string; content: string | Uint8Array }) {
  const mime = opts.mime || "text/plain;charset=utf-8";
  const blob = new Blob([opts.content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCSV(filename: string, content: string) {
  return downloadFile({ filename, mime: "text/csv;charset=utf-8", content });
}

export function downloadJSON(filename: string, data: unknown) {
  const content = JSON.stringify(data, null, 2);
  return downloadFile({ filename, mime: "application/json;charset=utf-8", content });
}
