import { toPng, toSvg } from 'html-to-image';
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

function prepareExportElement(elementSelector = '.react-flow') {
  const el = document.querySelector(elementSelector);
  if (!el) return { el: null, restore: () => {} };

  const controlsEl = document.querySelector('.react-flow__controls');
  const minimapEl = document.querySelector('.react-flow__minimap');
  const panelEl = document.querySelector('.react-flow__panel');

  const origControls = controlsEl ? controlsEl.style.display : '';
  const origMinimap = minimapEl ? minimapEl.style.display : '';
  const origPanel = panelEl ? panelEl.style.display : '';

  if (controlsEl) controlsEl.style.display = 'none';
  if (minimapEl) minimapEl.style.display = 'none';
  if (panelEl) panelEl.style.display = 'none';

  const restore = () => {
    if (controlsEl) controlsEl.style.display = origControls;
    if (minimapEl) minimapEl.style.display = origMinimap;
    if (panelEl) panelEl.style.display = origPanel;
  };

  return { el, restore };
}

export async function exportPNG(elementSelector = '.react-flow', diagramName = 'schema') {
  const { el, restore } = prepareExportElement(elementSelector);
  if (!el) return;

  try {
    const dataUrl = await toPng(el, {
      backgroundColor: '#0d111a',
      quality: 0.95,
      pixelRatio: 2.5,
      filter: (node) => {
        if (
          node?.classList?.contains('react-flow__controls') ||
          node?.classList?.contains('react-flow__minimap') ||
          node?.classList?.contains('react-flow__panel')
        ) {
          return false;
        }
        return true;
      },
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${diagramName.replace(/\s+/g, '_')}.png`;
    a.click();
  } catch (e) {
    console.error('PNG export failed', e);
    throw e;
  } finally {
    restore();
  }
}

export async function exportPDF(elementSelector = '.react-flow', diagramName = 'schema') {
  const { el, restore } = prepareExportElement(elementSelector);
  if (!el) return;

  try {
    const dataUrl = await toPng(el, {
      backgroundColor: '#0d111a',
      quality: 0.95,
      pixelRatio: 2.5,
      filter: (node) => {
        if (
          node?.classList?.contains('react-flow__controls') ||
          node?.classList?.contains('react-flow__minimap') ||
          node?.classList?.contains('react-flow__panel')
        ) {
          return false;
        }
        return true;
      },
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise((r) => { img.onload = r; });

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
  } finally {
    restore();
  }
}

export async function exportSVG(elementSelector = '.react-flow', diagramName = 'schema') {
  const { el, restore } = prepareExportElement(elementSelector);
  if (!el) return;

  try {
    const dataUrl = await toSvg(el, {
      backgroundColor: '#0d111a',
      filter: (node) => {
        if (
          node?.classList?.contains('react-flow__controls') ||
          node?.classList?.contains('react-flow__minimap') ||
          node?.classList?.contains('react-flow__panel')
        ) {
          return false;
        }
        return true;
      },
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${diagramName.replace(/\s+/g, '_')}.svg`;
    a.click();
  } catch (e) {
    console.error('SVG export failed', e);
    throw e;
  } finally {
    restore();
  }
}
