import React from 'react';
import useDiagramStore from '../../store/diagramStore';
import useUIStore from '../../store/uiStore';
import { Trash2, GitMerge } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = {
  blue: '#1e3a5f', green: '#14362a', purple: '#2d1b5e',
  orange: '#3b2200', red: '#3b1212', gray: '#1e293b',
};

const REL_TYPES = ['one-to-one', 'one-to-many', 'many-to-many', 'many-to-one'];
const FK_ACTIONS = ['RESTRICT', 'CASCADE', 'SET NULL', 'NO ACTION'];
const COL_TYPES = [
  'INT','BIGINT','VARCHAR(255)','VARCHAR(100)','TEXT','BOOLEAN',
  'DATE','DATETIME','TIMESTAMP','DECIMAL(10,2)','UUID','FLOAT','JSON',
];

function TableProps({ node }) {
  const { updateTable, addColumn, deleteColumn, updateColumn, deleteTable } = useDiagramStore();
  const { clearSelection } = useUIStore();
  const table = node.data;

  return (
    <div className="props-panel" data-testid="table-props">
      <div className="props-section">
        <div className="props-row">
          <label>Table Name</label>
          <input
            value={table.name}
            onChange={(e) => updateTable(node.id, { name: e.target.value })}
            data-testid="props-table-name"
          />
        </div>
        <div className="props-row">
          <label>Color</label>
          <div className="color-swatches">
            {Object.entries(COLORS).map(([name, hex]) => (
              <button
                key={name}
                className={`swatch ${table.color === name ? 'active' : ''}`}
                style={{ background: hex }}
                onClick={() => updateTable(node.id, { color: name })}
                title={name}
                data-testid={`color-swatch-${name}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="props-section">
        <div className="props-section-title">Columns
          <button className="mini-btn" onClick={() => addColumn(node.id)}>+ Add</button>
        </div>
        {(table.columns || []).map((col) => (
          <div key={col.id} className="props-col" data-testid={`props-col-${col.id}`}>
            <div className="props-row">
              <input
                placeholder="Name"
                value={col.name}
                onChange={(e) => updateColumn(node.id, col.id, { name: e.target.value })}
              />
              <select value={col.type} onChange={(e) => updateColumn(node.id, col.id, { type: e.target.value })}>
                {COL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button className="del-btn" onClick={() => deleteColumn(node.id, col.id)}>
                <Trash2 size={11} />
              </button>
            </div>
            <div className="props-checks">
              <label><input type="checkbox" checked={col.primaryKey} onChange={(e) => updateColumn(node.id, col.id, { primaryKey: e.target.checked })} />PK</label>
              <label><input type="checkbox" checked={col.autoIncrement} onChange={(e) => updateColumn(node.id, col.id, { autoIncrement: e.target.checked })} />AI</label>
              <label><input type="checkbox" checked={!col.nullable} onChange={(e) => updateColumn(node.id, col.id, { nullable: !e.target.checked })} />NN</label>
              <label><input type="checkbox" checked={col.unique} onChange={(e) => updateColumn(node.id, col.id, { unique: e.target.checked })} />UQ</label>
            </div>
          </div>
        ))}
      </div>

      <div className="props-danger">
        <button className="danger-btn" onClick={() => { deleteTable(node.id); clearSelection(); }} data-testid="delete-table-btn">
          <Trash2 size={12} /> Delete Table
        </button>
      </div>
    </div>
  );
}

function EdgeProps({ edge }) {
  const { updateRelationship, deleteRelationship, createJunctionTable } = useDiagramStore();
  const { clearSelection } = useUIStore();
  const rel = edge.data || {};

  const handleTypeChange = (newType) => {
    updateRelationship(edge.id, { type: newType });
    if (newType === 'many-to-many') {
      toast(
        (t) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            M:N detected
            <button
              onClick={() => {
                const name = createJunctionTable(edge.id);
                toast.dismiss(t.id);
                if (name) toast.success(`Junction table "${name}" created`);
              }}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}
            >
              Auto-create junction table
            </button>
          </span>
        ),
        { duration: 8000, id: `mn-${edge.id}` }
      );
    }
  };

  return (
    <div className="props-panel" data-testid="edge-props">
      <div className="props-section">
        <div className="props-section-title">Relationship</div>
        <div className="props-row">
          <label>Type</label>
          <select value={rel.type || 'one-to-many'} onChange={(e) => handleTypeChange(e.target.value)} data-testid="rel-type-select">
            {REL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="props-row">
          <label>ON DELETE</label>
          <select value={rel.onDelete || 'RESTRICT'} onChange={(e) => updateRelationship(edge.id, { onDelete: e.target.value })} data-testid="rel-on-delete">
            {FK_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="props-row">
          <label>ON UPDATE</label>
          <select value={rel.onUpdate || 'RESTRICT'} onChange={(e) => updateRelationship(edge.id, { onUpdate: e.target.value })} data-testid="rel-on-update">
            {FK_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div className="props-danger">
        <button className="danger-btn" onClick={() => { deleteRelationship(edge.id); clearSelection(); }} data-testid="delete-rel-btn">
          <Trash2 size={12} /> Delete Relationship
        </button>
      </div>
    </div>
  );
}

export default function PropertiesTab() {
  const { selectedNodeId, selectedEdgeId } = useUIStore();
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);

  if (selectedNodeId) {
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (node) return <TableProps node={node} />;
  }

  if (selectedEdgeId) {
    const edge = edges.find((e) => e.id === selectedEdgeId);
    if (edge) return <EdgeProps edge={edge} />;
  }

  return (
    <div className="props-empty" data-testid="properties-empty-state">
      <p>Select a table or relationship to edit its properties.</p>
    </div>
  );
}
