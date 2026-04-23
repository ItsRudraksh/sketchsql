import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useDiagramStore from '../../store/diagramStore';
import useUIStore from '../../store/uiStore';
import TableNode from './TableNode';
import RelationshipEdge from './RelationshipEdge';
import CanvasToolbar from './CanvasToolbar';

const nodeTypes = { tableNode: TableNode };
const edgeTypes = { relationshipEdge: RelationshipEdge };

export default function CanvasArea() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addTable } = useDiagramStore();
  const { showMinimap, showGrid, clearSelection, snapToGrid } = useUIStore();
  const wrapperRef = useRef(null);
  const rfInstance = useRef(null);

  const onInit = useCallback((inst) => { rfInstance.current = inst; }, []);

  const onDoubleClick = useCallback((e) => {
    if (!rfInstance.current || !wrapperRef.current) return;
    if (e.target.closest('.react-flow__node') || e.target.closest('.react-flow__edge')) return;
    const bounds = wrapperRef.current.getBoundingClientRect();
    const pos = rfInstance.current.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    addTable(pos);
  }, [addTable]);

  const onPaneClick = useCallback(() => clearSelection(), [clearSelection]);

  return (
    <div className="canvas-container" ref={wrapperRef} data-testid="canvas-area">
      <CanvasToolbar rfInstance={rfInstance} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDoubleClick={onDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
        defaultEdgeOptions={{ type: 'relationshipEdge' }}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.05}
        maxZoom={2.5}
        selectNodesOnDrag={false}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
      >
        <Background
          variant={showGrid ? BackgroundVariant.Dots : BackgroundVariant.Lines}
          color="#1e293b"
          size={1}
          gap={24}
          style={{ opacity: showGrid ? 0.5 : 0 }}
        />
        <Controls
          style={{ background: '#161b27', border: '1px solid #1e293b', borderRadius: 6 }}
          showInteractive={false}
        />
        {showMinimap && (
          <MiniMap
            style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 6 }}
            nodeColor={(n) => {
              const c = { blue: '#1e3a5f', green: '#14362a', purple: '#2d1b5e', orange: '#3b2200', red: '#3b1212', gray: '#1e293b' };
              return c[n.data?.color] || '#1e293b';
            }}
            maskColor="rgba(6,9,18,0.7)"
          />
        )}
      </ReactFlow>
    </div>
  );
}
