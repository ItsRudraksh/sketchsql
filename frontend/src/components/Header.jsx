import React, { useState } from 'react';
import useDiagramStore from '../store/diagramStore';
import useUIStore from '../store/uiStore';
import { exportSQL, exportJSON, exportPNG, exportPDF } from '../utils/exportUtils';
import toast from 'react-hot-toast';
import { Database, Sun, Moon, ChevronDown, Save, Download, Share2 } from 'lucide-react';

export default function Header() {
  const { diagramName, setDiagramName, setDialect } = useDiagramStore();
  const dialect = useDiagramStore((s) => s.dialect);
  const { theme, toggleTheme, openSaveDiagramModal, openShareModal } = useUIStore();
  const generatedSql = useUIStore((s) => s.generatedSql);
  const [exportOpen, setExportOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');

  const handleExport = async (type) => {
    setExportOpen(false);
    const diagram = useDiagramStore.getState().getDiagramJSON();
    try {
      if (type === 'sql') exportSQL(generatedSql || '-- Click Generate SQL first', diagram.name);
      else if (type === 'json') exportJSON(diagram);
      else if (type === 'png') await exportPNG('.react-flow', diagram.name);
      else if (type === 'pdf') await exportPDF('.react-flow', diagram.name);
      toast.success(`Exported as ${type.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    }
  };

  const handleDialect = (d) => {
    setDialect(d);
    toast.success(`Switched to ${d === 'mysql' ? 'MySQL' : 'PostgreSQL'}`);
  };

  const commitName = () => {
    setEditingName(false);
    if (nameVal.trim()) setDiagramName(nameVal.trim());
  };

  return (
    <header className="app-header" data-testid="app-header">
      <div className="header-left">
        <div className="header-logo">
          <Database size={20} style={{ color: '#6366f1' }} />
          <span className="logo-text">SketchSQL</span>
        </div>
        <div className="header-divider" />
        {editingName ? (
          <input
            className="diagram-name-input"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false); }}
            autoFocus
          />
        ) : (
          <span
            className="diagram-name"
            onDoubleClick={() => { setEditingName(true); setNameVal(diagramName); }}
            title="Double-click to rename"
            data-testid="diagram-name"
          >{diagramName}</span>
        )}
      </div>

      <div className="header-center">
        <div className="dialect-toggle" data-testid="dialect-toggle">
          <button
            className={`dialect-btn ${dialect === 'mysql' ? 'active' : ''}`}
            onClick={() => handleDialect('mysql')}
            data-testid="dialect-mysql"
          >MySQL</button>
          <button
            className={`dialect-btn ${dialect === 'postgresql' ? 'active' : ''}`}
            onClick={() => handleDialect('postgresql')}
            data-testid="dialect-postgresql"
          >PostgreSQL</button>
        </div>
      </div>

      <div className="header-right">
        <button className="header-action-btn" onClick={openSaveDiagramModal} data-testid="save-btn">
          <Save size={13} /> Save
        </button>
        <button className="header-action-btn" onClick={openShareModal} data-testid="share-btn" title="Create a public shareable link">
          <Share2 size={13} /> Share
        </button>
        <div className="export-wrap">
          <button className="header-action-btn" onClick={() => setExportOpen(!exportOpen)} data-testid="export-btn">
            <Download size={13} /> Export <ChevronDown size={11} />
          </button>
          {exportOpen && (
            <>
              <div className="dropdown-backdrop" onClick={() => setExportOpen(false)} />
              <div className="dropdown-menu" data-testid="export-menu">
                <button onClick={() => handleExport('sql')}>Export SQL (.sql)</button>
                <button onClick={() => handleExport('json')}>Export JSON (.json)</button>
                <button onClick={() => handleExport('png')}>Export PNG</button>
                <button onClick={() => handleExport('pdf')}>Export PDF</button>
              </div>
            </>
          )}
        </div>
        <button className="header-icon-btn" onClick={toggleTheme} title="Toggle theme" data-testid="theme-toggle">
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
