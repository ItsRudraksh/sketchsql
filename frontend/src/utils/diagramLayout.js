// Auto-layout algorithm: layered left-to-right based on FK dependencies

export function autoLayout(tables, relationships = [], startX = 80, startY = 80) {
  if (!tables.length) return tables;

  const COL_GAP = 320;
  const ROW_GAP = 220;
  const COLS = Math.max(1, Math.ceil(Math.sqrt(tables.length)));

  // Try dependency-based layering
  const tmap = Object.fromEntries(tables.map(t => [t.id, t]));
  const deps = Object.fromEntries(tables.map(t => [t.id, new Set()]));

  for (const r of relationships) {
    if (r.type !== 'many-to-many' && deps[r.sourceTableId]) {
      deps[r.sourceTableId].add(r.targetTableId);
    }
  }

  // Assign layers
  const layers = {};
  const visited = new Set();

  const assignLayer = (id, layer) => {
    if (visited.has(id)) return;
    visited.add(id);
    layers[id] = Math.max(layers[id] || 0, layer);
    // Children get layer + 1
    for (const tid of Object.keys(deps)) {
      if (deps[tid].has(id)) assignLayer(tid, layer + 1);
    }
  };

  // Find roots (tables not referenced by others)
  const referenced = new Set(relationships.map(r => r.targetTableId));
  const roots = tables.filter(t => !referenced.has(t.id));
  if (!roots.length) roots.push(tables[0]);

  roots.forEach(t => assignLayer(t.id, 0));
  tables.forEach(t => { if (layers[t.id] === undefined) layers[t.id] = 0; });

  // Group by layer
  const layerGroups = {};
  for (const [id, layer] of Object.entries(layers)) {
    if (!layerGroups[layer]) layerGroups[layer] = [];
    layerGroups[layer].push(id);
  }

  // If too many layers (>5), fall back to grid
  const maxLayer = Math.max(...Object.values(layers));
  if (maxLayer > 4 || Object.keys(layerGroups).length < 2) {
    return tables.map((t, i) => ({
      ...t,
      position: {
        x: startX + (i % COLS) * COL_GAP,
        y: startY + Math.floor(i / COLS) * ROW_GAP,
      },
    }));
  }

  // Layered layout
  const positions = {};
  for (const [layer, ids] of Object.entries(layerGroups)) {
    ids.forEach((id, idx) => {
      positions[id] = {
        x: startX + parseInt(layer) * COL_GAP,
        y: startY + idx * ROW_GAP,
      };
    });
  }

  return tables.map(t => ({ ...t, position: positions[t.id] || { x: startX, y: startY } }));
}
