import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import useDiagramStore from '../../store/diagramStore';
import useUIStore from '../../store/uiStore';

const COLORS = {
  blue: '#1e3a5f', green: '#14362a', purple: '#2d1b5e',
  orange: '#3b2200', red: '#3b1212', gray: '#1e293b',
};

const TYPES = [
  'INT','BIGINT','VARCHAR(255)','VARCHAR(100)','VARCHAR(50)',
  'TEXT','BOOLEAN','DATE','DATETIME','TIMESTAMP',
  'DECIMAL(10,2)','UUID','FLOAT','JSON','SMALLINT','TINYINT',
];

function ColEditor({ col, tableId, onClose }) {
  const { updateColumn, deleteColumn } = useDiagramStore();
  const upd = (k, v) => updateColumn(tableId, col.id, { [k]: v });

  return (
    <div className="col-editor nodrag nowheel" onClick={(e) => e.stopPropagation()}>
      <div className="ce-row">
        <label>Name</label>
        <input className="nodrag" value={col.name} onChange={(e) => upd('name', e.target.value)} />
      </div>
      <div className="ce-row">
        <label>Type</label>
        <select className="nodrag" value={col.type} onChange={(e) => upd('type', e.target.value)}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="ce-row">
        <label>Default</label>
        <input className="nodrag" value={col.defaultValue} placeholder="optional" onChange={(e) => upd('defaultValue', e.target.value)} />
      </div>
      <div className="ce-checks">
        <label><input type="checkbox" className="nodrag" checked={col.primaryKey} onChange={(e) => upd('primaryKey', e.target.checked)} />PK</label>
        <label><input type="checkbox" className="nodrag" checked={col.autoIncrement} onChange={(e) => upd('autoIncrement', e.target.checked)} />AI</label>
        <label><input type="checkbox" className="nodrag" checked={!col.nullable} onChange={(e) => upd('nullable', !e.target.checked)} />NN</label>
        <label><input type="checkbox" className="nodrag" checked={col.unique} onChange={(e) => upd('unique', e.target.checked)} />UQ</label>
      </div>
      <div className="ce-actions">
        <button className="ce-delete nodrag" onClick={() => deleteColumn(tableId, col.id)}>
          Delete column
        </button>
        <button className="ce-close nodrag" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

function CtxMenu({ x, y, tableId, color, onRename, onAddCol, onDelete, onColor, onClose }) {
  return (
    <>
      <div className="ctx-backdrop" onClick={onClose} />
      <div className="ctx-menu nodrag" style={{ position: 'fixed', left: x, top: y, zIndex: 9999 }}>
        <button onClick={onRename}>Rename</button>
        <button onClick={onAddCol}>Add Column</button>
        <div className="ctx-sep" />
        <div className="ctx-colors">
          {Object.entries(COLORS).map(([name, hex]) => (
            <button key={name} className={`ctx-dot ${name === color ? 'active' : ''}`}
              style={{ background: hex }} onClick={() => { onColor(name); onClose(); }} title={name} />
          ))}
        </div>
        <div className="ctx-sep" />
        <button className="ctx-danger" onClick={onDelete}>Delete Table</button>
      </div>
    </>
  );
}

export default function TableNode({ id, data, selected }) {
  const [editCol, setEditCol] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [ctxMenu, setCtxMenu] = useState(null);
  const { updateTable, deleteTable, addColumn } = useDiagramStore();
  const { setSelectedNode, setActiveTab } = useUIStore();

  const accentBg = COLORS[data.color] || COLORS.gray;

  const commitName = () => {
    setEditingName(false);
    if (nameVal.trim()) updateTable(id, { name: nameVal.trim() });
  };

  return (
    <div
      className={`table-node${selected ? ' selected' : ''}`}
      onClick={() => { setSelectedNode(id); setActiveTab('properties'); }}
      onContextMenu={(e) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
      data-testid={`table-node-${id}`}
    >
      {/* Table header */}
      <div className="tn-header" style={{ background: accentBg }}
        onDoubleClick={(e) => { e.stopPropagation(); setEditingName(true); setNameVal(data.name); }}>
        {editingName ? (
          <input
            className="tn-name-input nodrag"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false); }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="tn-name">{data.name}</span>
        )}
        <button className="tn-add-col nodrag" onClick={(e) => { e.stopPropagation(); addColumn(id); }} title="Add column">+</button>
      </div>

      {/* Columns */}
      <div className="tn-columns">
        {(data.columns || []).map((col) => (
          <div key={col.id} className="tn-col-wrapper">
            <Handle type="target" position={Position.Left} id={`target-${col.id}`} className="tn-handle" />
            <div
              className={`tn-col nodrag${editCol === col.id ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setSelectedNode(id); setActiveTab('properties'); setEditCol(editCol === col.id ? null : col.id); }}
              data-testid={`col-${col.id}`}
            >
              <div className="tn-badges">
                {col.primaryKey && <span className="badge-pk">PK</span>}
                {!col.primaryKey && col.unique && <span className="badge-uq">UQ</span>}
                {!col.primaryKey && !col.nullable && <span className="badge-nn">NN</span>}
              </div>
              <span className="tn-col-name">{col.name}</span>
              <span className="tn-col-type">{col.type}</span>
            </div>
            {editCol === col.id && (
              <ColEditor col={col} tableId={id} onClose={() => setEditCol(null)} />
            )}
            <Handle type="source" position={Position.Right} id={`source-${col.id}`} className="tn-handle" />
          </div>
        ))}
        {!data.columns?.length && <div className="tn-empty">No columns</div>}
      </div>

      {ctxMenu && (
        <CtxMenu
          x={ctxMenu.x} y={ctxMenu.y}
          tableId={id} color={data.color}
          onRename={() => { setEditingName(true); setNameVal(data.name); setCtxMenu(null); }}
          onAddCol={() => { addColumn(id); setCtxMenu(null); }}
          onDelete={() => { deleteTable(id); setCtxMenu(null); }}
          onColor={(c) => updateTable(id, { color: c })}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
}
