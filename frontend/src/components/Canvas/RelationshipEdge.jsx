import React from 'react';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';
import useUIStore from '../../store/uiStore';

const LABELS = {
  'one-to-one': '1:1',
  'one-to-many': '1:N',
  'many-to-many': 'M:N',
  'many-to-one': 'N:1',
};

export default function RelationshipEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const { setSelectedEdge, setActiveTab } = useUIStore();
  const relType = data?.type || 'one-to-many';
  const label = LABELS[relType] || '1:N';
  const stroke = selected ? '#6366f1' : '#818cf8';

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedEdge(id);
    setActiveTab('properties');
  };

  return (
    <>
      {/* Invisible wide path for easier clicking */}
      <path d={edgePath} stroke="transparent" strokeWidth={20} fill="none" onClick={handleClick} style={{ cursor: 'pointer' }} />
      <path
        id={id}
        d={edgePath}
        stroke={stroke}
        strokeWidth={selected ? 2 : 1.5}
        fill="none"
        className="react-flow__edge-path"
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
        data-testid={`edge-${id}`}
      />
      <EdgeLabelRenderer>
        <div
          className="edge-label nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            cursor: 'pointer',
          }}
          onClick={handleClick}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
