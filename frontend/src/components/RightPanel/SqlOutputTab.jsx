import React, { useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import useDiagramStore from '../../store/diagramStore';
import useUIStore from '../../store/uiStore';
import { generateSQL } from '../../utils/sqlGenerator';
import { generateSQL as generateSQLAPI } from '../../api/apiClient';
import { exportSQL } from '../../utils/exportUtils';
import toast from 'react-hot-toast';
import { Copy, Download, RefreshCw } from 'lucide-react';

export default function SqlOutputTab() {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const dialect = useDiagramStore((s) => s.dialect);
  const diagramName = useDiagramStore((s) => s.diagramName);
  const { generatedSql, setGeneratedSql, sqlLoading, setSqlLoading } = useUIStore();
  const debounceRef = useRef(null);

  const regenerate = useCallback(() => {
    const diagram = useDiagramStore.getState().getDiagramJSON();
    const sql = generateSQL(diagram, dialect);
    setGeneratedSql(sql);
  }, [dialect, setGeneratedSql]);

  // Auto-regenerate on diagram/dialect change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(regenerate, 800);
    return () => clearTimeout(debounceRef.current);
  }, [nodes, edges, dialect, regenerate]);

  // Initial generation
  useEffect(() => { regenerate(); }, []); // eslint-disable-line

  const handleGenerateViaAPI = async () => {
    setSqlLoading(true);
    try {
      const diagram = useDiagramStore.getState().getDiagramJSON();
      const sql = await generateSQLAPI(diagram, dialect);
      setGeneratedSql(sql);
      toast.success('SQL generated');
    } catch {
      toast.error('Generation failed — showing local version');
      regenerate();
    } finally {
      setSqlLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSql).then(() => toast.success('Copied to clipboard'));
  };

  const handleDownload = () => {
    exportSQL(generatedSql, diagramName);
    toast.success('SQL file downloaded');
  };

  return (
    <div className="sql-tab" data-testid="sql-tab">
      <div className="sql-toolbar">
        <button
          className="sql-gen-btn"
          onClick={handleGenerateViaAPI}
          disabled={sqlLoading}
          data-testid="generate-sql-btn"
        >
          <RefreshCw size={12} className={sqlLoading ? 'spin' : ''} />
          {sqlLoading ? 'Generating...' : 'Generate SQL'}
        </button>
        <div className="sql-toolbar-right">
          <button className="sql-icon-btn" onClick={handleCopy} title="Copy" data-testid="copy-sql-btn">
            <Copy size={13} />
          </button>
          <button className="sql-icon-btn" onClick={handleDownload} title="Download .sql" data-testid="download-sql-btn">
            <Download size={13} />
          </button>
        </div>
      </div>
      <div className="monaco-wrap" data-testid="monaco-editor">
        <Editor
          height="100%"
          language="sql"
          value={generatedSql}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 12 },
            renderLineHighlight: 'none',
            scrollbar: { useShadows: false },
          }}
        />
      </div>
    </div>
  );
}
