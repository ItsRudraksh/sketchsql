import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSQL(sql, diagramName = 'schema') {
  downloadFile(sql, `${diagramName.replace(/\s+/g, '_')}.sql`, 'text/plain');
}

export function exportJSON(diagram) {
  const name = diagram.name || 'diagram';
  downloadFile(JSON.stringify(diagram, null, 2), `${name.replace(/\s+/g, '_')}.json`, 'application/json');
}

export async function exportPNG(elementSelector = '.react-flow', diagramName = 'schema') {
  const el = document.querySelector(elementSelector);
  if (!el) return;
  try {
    const dataUrl = await toPng(el, {
      backgroundColor: '#0d111a',
      quality: 0.95,
      pixelRatio: 2,
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${diagramName.replace(/\s+/g, '_')}.png`;
    a.click();
  } catch (e) {
    console.error('PNG export failed', e);
    throw e;
  }
}

export async function exportPDF(elementSelector = '.react-flow', diagramName = 'schema') {
  const el = document.querySelector(elementSelector);
  if (!el) return;
  try {
    const dataUrl = await toPng(el, { backgroundColor: '#0d111a', pixelRatio: 1.5 });
    const img = new Image();
    img.src = dataUrl;
    await new Promise(r => { img.onload = r; });
    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [img.width, img.height],
    });
    pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
    pdf.save(`${diagramName.replace(/\s+/g, '_')}.pdf`);
  } catch (e) {
    console.error('PDF export failed', e);
    throw e;
  }
}
