import { useEffect } from 'react';
import useDiagramStore from '../store/diagramStore';
import useUIStore from '../store/uiStore';

export default function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e) => {
      const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
      if (inInput) return;

      const { undo, redo, deleteTable, deleteRelationship, duplicateTable } = useDiagramStore.getState();
      const { selectedNodeId, selectedEdgeId, openSaveDiagramModal, clearSelection } = useUIStore.getState();

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.shiftKey ? redo() : undo();
            e.preventDefault();
            break;
          case 'y':
            redo();
            e.preventDefault();
            break;
          case 's':
            openSaveDiagramModal();
            e.preventDefault();
            break;
          case 'd':
            if (selectedNodeId) duplicateTable(selectedNodeId);
            e.preventDefault();
            break;
          case 'a':
            useDiagramStore.getState().selectAll();
            e.preventDefault();
            break;
          default:
            break;
        }
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !inInput) {
        if (selectedNodeId) deleteTable(selectedNodeId);
        if (selectedEdgeId) deleteRelationship(selectedEdgeId);
      }

      if (e.key === 'Escape') clearSelection();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
