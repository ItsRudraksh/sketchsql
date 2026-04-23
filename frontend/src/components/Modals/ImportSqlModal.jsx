import React, { useState } from 'react';
import useDiagramStore from '../../store/diagramStore';
import useUIStore from '../../store/uiStore';
import { importSQL } from '../../api/apiClient';
import { autoLayout } from '../../utils/diagramLayout';
import toast from 'react-hot-toast';
import { X, Upload } from 'lucide-react';

const PLACEHOLDER = `-- Paste CREATE TABLE SQL here
CREATE TABLE users (
  id INT AUTO_INCREMENT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`;

export default function ImportSqlModal() {
  const [sql, setSql] = useState('');
  const [loading, setLoading] = useState(false);
  const { closeImportSqlModal } = useUIStore();
  const { loadDiagram } = useDiagramStore();
  const dialect = useDiagramStore((s) => s.dialect);

  const handleImport = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    try {
      const diagram = await importSQL(sql, dialect);
      if (!diagram.tables?.length) {
        toast.error('No tables found in SQL');
        return;
      }
      const laid = autoLayout(diagram.tables, diagram.relationships || []);
      loadDiagram({ ...diagram, tables: laid, dialect });
      toast.success(`Imported ${diagram.tables.length} tables`);
      closeImportSqlModal();
    } catch {
      toast.error('Import failed — check SQL syntax');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="import-sql-modal" onClick={closeImportSqlModal}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Import SQL</span>
          <button className="modal-close" onClick={closeImportSqlModal}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p className="modal-hint">Paste existing CREATE TABLE SQL statements. Foreign key relationships will be detected automatically.</p>
          <textarea
            className="sql-paste-area"
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={14}
            data-testid="sql-import-textarea"
          />
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={closeImportSqlModal}>Cancel</button>
          <button
            className="modal-confirm"
            onClick={handleImport}
            disabled={loading || !sql.trim()}
            data-testid="import-sql-confirm"
          >
            <Upload size={13} /> {loading ? 'Importing...' : 'Import to Canvas'}
          </button>
        </div>
      </div>
    </div>
  );
}
