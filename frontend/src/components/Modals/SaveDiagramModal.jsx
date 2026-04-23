import React, { useState } from 'react';
import useDiagramStore from '../../store/diagramStore';
import useUIStore from '../../store/uiStore';
import { saveDiagram } from '../../utils/persistence';
import toast from 'react-hot-toast';
import { X, Save } from 'lucide-react';

export default function SaveDiagramModal() {
  const diagramName = useDiagramStore((s) => s.diagramName);
  const setDiagramName = useDiagramStore((s) => s.setDiagramName);
  const getDiagramJSON = useDiagramStore((s) => s.getDiagramJSON);
  const { closeSaveDiagramModal } = useUIStore();
  const [name, setName] = useState(diagramName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      setDiagramName(name.trim());
      const diagram = getDiagramJSON();
      await saveDiagram({ ...diagram, name: name.trim() });
      window.dispatchEvent(new Event('diagram-saved'));
      toast.success(`Saved "${name.trim()}"`);
      closeSaveDiagramModal();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="save-diagram-modal" onClick={closeSaveDiagramModal}>
      <div className="modal-box small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Save Diagram</span>
          <button className="modal-close" onClick={closeSaveDiagramModal}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <label className="modal-label">Diagram Name</label>
          <input
            className="modal-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="My Schema"
            autoFocus
            data-testid="save-diagram-name-input"
          />
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={closeSaveDiagramModal}>Cancel</button>
          <button
            className="modal-confirm"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            data-testid="save-diagram-confirm"
          >
            <Save size={13} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
