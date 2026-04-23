import { useEffect, useRef } from 'react';
import useDiagramStore from '../store/diagramStore';
import { saveToAutosave } from '../utils/persistence';

export default function useAutoSave() {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const diagram = useDiagramStore.getState().getDiagramJSON();
      saveToAutosave(diagram);
    }, 2000);
    return () => clearTimeout(timer.current);
  }, [nodes, edges]);
}
