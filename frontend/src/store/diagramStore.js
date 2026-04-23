import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';

const MAX_HISTORY = 50;
const uid = () => Math.random().toString(36).substr(2, 8);

const snap = (nodes, edges) => ({
  nodes: JSON.parse(JSON.stringify(nodes)),
  edges: JSON.parse(JSON.stringify(edges)),
});

const useDiagramStore = create((set, get) => ({
  nodes: [],
  edges: [],
  diagramId: null,
  diagramName: 'Untitled Diagram',
  createdAt: null,
  updatedAt: null,
  dialect: 'mysql',
  history: [],
  historyIndex: -1,

  // ReactFlow handlers
  onNodesChange: (changes) => set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),
  onEdgesChange: (changes) => set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) => {
    const rel = {
      id: `r_${uid()}`,
      type: 'one-to-many',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
      label: '',
    };
    const newEdge = {
      id: rel.id,
      type: 'relationshipEdge',
      source: connection.source,
      sourceHandle: connection.sourceHandle,
      target: connection.target,
      targetHandle: connection.targetHandle,
      data: rel,
    };
    set((s) => ({ edges: [...s.edges, newEdge] }));
    get().pushHistory();
  },

  // Table ops
  addTable: (position = { x: 200, y: 200 }) => {
    const { nodes } = get();
    const id = `t_${uid()}`;
    const colId = `c_${uid()}`;
    const num = nodes.length + 1;
    const table = {
      id, name: `Table${num}`, color: 'gray',
      columns: [{ id: colId, name: 'id', type: 'INT', primaryKey: true, autoIncrement: true, nullable: false, unique: true, defaultValue: '' }],
    };
    set((s) => ({ nodes: [...s.nodes, { id, type: 'tableNode', position, data: table }] }));
    get().pushHistory();
    return id;
  },

  updateTable: (tableId, updates) => {
    set((s) => ({ nodes: s.nodes.map(n => n.id === tableId ? { ...n, data: { ...n.data, ...updates } } : n) }));
    get().pushHistory();
  },

  deleteTable: (tableId) => {
    set((s) => ({
      nodes: s.nodes.filter(n => n.id !== tableId),
      edges: s.edges.filter(e => e.source !== tableId && e.target !== tableId),
    }));
    get().pushHistory();
  },

  duplicateTable: (tableId) => {
    const { nodes } = get();
    const orig = nodes.find(n => n.id === tableId);
    if (!orig) return;
    const newId = `t_${uid()}`;
    const newCols = orig.data.columns.map(c => ({ ...c, id: `c_${uid()}` }));
    const newTable = {
      id: newId,
      type: 'tableNode',
      position: { x: orig.position.x + 30, y: orig.position.y + 30 },
      data: { ...orig.data, id: newId, name: orig.data.name + '_copy', columns: newCols },
    };
    set((s) => ({ nodes: [...s.nodes, newTable] }));
    get().pushHistory();
  },

  addColumn: (tableId) => {
    const colId = `c_${uid()}`;
    set((s) => ({
      nodes: s.nodes.map(n => n.id === tableId
        ? { ...n, data: { ...n.data, columns: [...n.data.columns, { id: colId, name: 'new_column', type: 'VARCHAR(255)', primaryKey: false, autoIncrement: false, nullable: true, unique: false, defaultValue: '' }] } }
        : n),
    }));
    get().pushHistory();
    return colId;
  },

  updateColumn: (tableId, colId, updates) => {
    set((s) => ({
      nodes: s.nodes.map(n => n.id === tableId
        ? { ...n, data: { ...n.data, columns: n.data.columns.map(c => c.id === colId ? { ...c, ...updates } : c) } }
        : n),
    }));
    get().pushHistory();
  },

  deleteColumn: (tableId, colId) => {
    set((s) => ({
      nodes: s.nodes.map(n => n.id === tableId
        ? { ...n, data: { ...n.data, columns: n.data.columns.filter(c => c.id !== colId) } }
        : n),
      edges: s.edges.filter(e => e.sourceHandle !== `source-${colId}` && e.targetHandle !== `target-${colId}`),
    }));
    get().pushHistory();
  },

  updateRelationship: (edgeId, updates) => {
    set((s) => ({ edges: s.edges.map(e => e.id === edgeId ? { ...e, data: { ...e.data, ...updates } } : e) }));
    get().pushHistory();
  },

  deleteRelationship: (edgeId) => {
    set((s) => ({ edges: s.edges.filter(e => e.id !== edgeId) }));
    get().pushHistory();
  },

  // History
  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHist = [...history.slice(0, historyIndex + 1), snap(nodes, edges)].slice(-MAX_HISTORY);
    set({ history: newHist, historyIndex: newHist.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // Diagram ops
  getDiagramJSON: () => {
    const { nodes, edges, diagramId, diagramName, createdAt, dialect } = get();
    return {
      id: diagramId || `d_${uid()}`,
      name: diagramName,
      dialect,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tables: nodes.map(n => ({ ...n.data, position: n.position })),
      relationships: edges.map(e => ({
        id: e.id,
        sourceTableId: e.source,
        sourceColumnId: (e.sourceHandle || '').replace('source-', ''),
        targetTableId: e.target,
        targetColumnId: (e.targetHandle || '').replace('target-', ''),
        ...e.data,
      })),
    };
  },

  loadDiagram: (diagram) => {
    const nodes = (diagram.tables || []).map(t => ({
      id: t.id, type: 'tableNode',
      position: t.position || { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { id: t.id, name: t.name, color: t.color || 'gray', columns: t.columns || [] },
    }));
    const edges = (diagram.relationships || []).map(r => ({
      id: r.id, type: 'relationshipEdge',
      source: r.sourceTableId, sourceHandle: `source-${r.sourceColumnId}`,
      target: r.targetTableId, targetHandle: `target-${r.targetColumnId}`,
      data: { id: r.id, type: r.type || 'one-to-many', onDelete: r.onDelete || 'RESTRICT', onUpdate: r.onUpdate || 'RESTRICT', label: r.label || '' },
    }));
    set({
      nodes, edges,
      diagramId: diagram.id || null,
      diagramName: diagram.name || 'Untitled Diagram',
      dialect: diagram.dialect || 'mysql',
      createdAt: diagram.createdAt || new Date().toISOString(),
      updatedAt: diagram.updatedAt || null,
      history: [snap(nodes, edges)],
      historyIndex: 0,
    });
  },

  clearDiagram: () => set({ nodes: [], edges: [], diagramId: null, diagramName: 'Untitled Diagram', createdAt: null, updatedAt: null, history: [], historyIndex: -1 }),

  setDiagramName: (name) => set({ diagramName: name }),
  setDialect: (d) => set({ dialect: d }),
}));

export default useDiagramStore;
