import React from 'react';
import useDiagramStore from '../../store/diagramStore';
import useUIStore from '../../store/uiStore';
import { Plus, Upload, Maximize2, Grid3X3, Map, Undo2, Redo2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CanvasToolbar({ rfInstance }) {
  const { addTable, undo, redo, canUndo, canRedo } = useDiagramStore();
  const { showGrid, showMinimap, toggleGrid, toggleMinimap, openImportSqlModal } = useUIStore();

  const fitView = () => rfInstance.current?.fitView({ padding: 0.15, duration: 400 });

  const handleAddTable = () => {
    const pos = rfInstance.current
      ? rfInstance.current.project({ x: 300 + Math.random() * 100, y: 200 + Math.random() * 100 })
      : { x: 300, y: 200 };
    addTable(pos);
    toast.success('Table added to canvas');
  };

  return (
    <div className="canvas-toolbar" data-testid="canvas-toolbar">
      <button className="tb-btn primary" onClick={handleAddTable} data-testid="add-table-btn" title="Add Table">
        <Plus size={13} /><span>Add Table</span>
      </button>
      <div className="tb-sep" />
      <button className="tb-btn" onClick={openImportSqlModal} data-testid="import-sql-btn" title="Import SQL">
        <Upload size={13} /><span>Import SQL</span>
      </button>
      <div className="tb-sep" />
      <button className="tb-btn" onClick={fitView} data-testid="fit-view-btn" title="Fit View"><Maximize2 size={13} /></button>
      <button className={`tb-btn ${showGrid ? 'on' : ''}`} onClick={toggleGrid} data-testid="toggle-grid-btn" title="Toggle Grid"><Grid3X3 size={13} /></button>
      <button className={`tb-btn ${showMinimap ? 'on' : ''}`} onClick={toggleMinimap} data-testid="toggle-minimap-btn" title="Toggle Minimap"><Map size={13} /></button>
      <div className="tb-sep" />
      <button className="tb-btn" onClick={undo} disabled={!canUndo()} data-testid="undo-btn" title="Undo (Ctrl+Z)"><Undo2 size={13} /></button>
      <button className="tb-btn" onClick={redo} disabled={!canRedo()} data-testid="redo-btn" title="Redo (Ctrl+Shift+Z)"><Redo2 size={13} /></button>
    </div>
  );
}
