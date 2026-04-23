import React, { useState, useEffect } from 'react';
import useDiagramStore from '../../store/diagramStore';
import { loadAllDiagrams, deleteDiagram, renameDiagram } from '../../utils/persistence';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Database, Clock } from 'lucide-react';

export default function LeftPanel() {
  const [diagrams, setDiagrams] = useState([]);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const { loadDiagram, clearDiagram, diagramId } = useDiagramStore();

  const refresh = async () => {
    const all = await loadAllDiagrams();
    setDiagrams(all);
  };

  useEffect(() => {
    refresh();
    window.addEventListener('diagram-saved', refresh);
    return () => window.removeEventListener('diagram-saved', refresh);
  }, []);

  const handleNew = () => {
    clearDiagram();
    toast.success('New diagram started');
  };

  const handleLoad = (d) => {
    loadDiagram(d);
    toast.success(`Loaded "${d.name}"`);
  };

  const handleDelete = async (id, name) => {
    await deleteDiagram(id);
    setCtxMenu(null);
    refresh();
    toast.success(`Deleted "${name}"`);
  };

  const handleRename = async (id) => {
    if (renameVal.trim()) {
      await renameDiagram(id, renameVal.trim());
      setRenaming(null);
      refresh();
    }
  };

  const fmt = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="left-panel" data-testid="left-panel">
      <div className="left-panel-header">
        <span className="left-panel-title">Saved Diagrams</span>
        <button className="icon-btn" onClick={handleNew} data-testid="new-diagram-btn" title="New Diagram">
          <Plus size={14} />
        </button>
      </div>

      <div className="diagram-list">
        {diagrams.length === 0 && (
          <div className="empty-list">No saved diagrams</div>
        )}
        {diagrams.map((d) => (
          <div
            key={d.id}
            className={`diagram-item ${d.id === diagramId ? 'active' : ''}`}
            onClick={() => handleLoad(d)}
            onContextMenu={(e) => { e.preventDefault(); setCtxMenu({ id: d.id, name: d.name, x: e.clientX, y: e.clientY }); }}
            data-testid={`diagram-item-${d.id}`}
          >
            {renaming === d.id ? (
              <input
                className="rename-input"
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onBlur={() => handleRename(d.id)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(d.id); if (e.key === 'Escape') setRenaming(null); }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <Database size={12} className="di-icon" />
                <div className="di-info">
                  <span className="di-name">{d.name}</span>
                  <div className="di-meta">
                    <Clock size={9} />
                    <span>{fmt(d.updatedAt)}</span>
                    <span className="di-tables">{d.tables?.length || 0}t</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {ctxMenu && (
        <>
          <div className="ctx-backdrop" onClick={() => setCtxMenu(null)} />
          <div className="ctx-menu" style={{ position: 'fixed', left: ctxMenu.x, top: ctxMenu.y }}>
            <button onClick={() => { setRenaming(ctxMenu.id); setRenameVal(ctxMenu.name); setCtxMenu(null); }}>
              <Edit2 size={11} /> Rename
            </button>
            <button className="danger" onClick={() => handleDelete(ctxMenu.id, ctxMenu.name)}>
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
