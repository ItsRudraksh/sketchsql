import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import useDiagramStore from '../../store/diagramStore';
import { generateDjango, generatePrisma, generateSQLAlchemy, generateSpringJPA } from '../../utils/ormGenerator';
import { downloadFile } from '../../utils/exportUtils';
import toast from 'react-hot-toast';
import { Copy, Download } from 'lucide-react';

const FORMATS = [
  { id: 'jpa', label: 'Spring JPA', ext: '.java', lang: 'java' },
  { id: 'django', label: 'Django', ext: '.py', lang: 'python' },
  { id: 'prisma', label: 'Prisma', ext: '.prisma', lang: 'typescript' },
  { id: 'sqlalchemy', label: 'SQLAlchemy', ext: '.py', lang: 'python' },
];

export default function OrmOutputTab() {
  const [format, setFormat] = useState('jpa');
  const [code, setCode] = useState('');
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const debounceRef = useRef(null);

  const generate = () => {
    const diagram = useDiagramStore.getState().getDiagramJSON();
    let result = '';
    if (format === 'jpa') result = generateSpringJPA(diagram);
    else if (format === 'django') result = generateDjango(diagram);
    else if (format === 'prisma') result = generatePrisma(diagram);
    else result = generateSQLAlchemy(diagram);
    setCode(result);
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(generate, 600);
    return () => clearTimeout(debounceRef.current);
  }, [nodes, edges, format]); // eslint-disable-line

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => toast.success('Copied to clipboard'));
  };

  const handleDownload = () => {
    const fmt = FORMATS.find((f) => f.id === format);
    const name = useDiagramStore.getState().diagramName || 'models';
    downloadFile(code, `${name.replace(/\s+/g, '_')}${fmt.ext}`, 'text/plain');
    toast.success(`Downloaded ${fmt.ext} file`);
  };

  const currentLang = FORMATS.find((f) => f.id === format)?.lang || 'python';

  return (
    <div className="orm-tab" data-testid="orm-tab">
      <div className="orm-toolbar">
        <div className="orm-select-wrap">
          <span className="orm-select-label">Target ORM:</span>
          <select
            className="orm-select-dropdown"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            data-testid="orm-format-select"
          >
            {FORMATS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label} ({f.ext})
              </option>
            ))}
          </select>
        </div>
        <div className="orm-toolbar-right">
          <button className="sql-icon-btn" onClick={handleCopy} title="Copy" data-testid="copy-orm-btn">
            <Copy size={13} />
          </button>
          <button className="sql-icon-btn" onClick={handleDownload} title="Download" data-testid="download-orm-btn">
            <Download size={13} />
          </button>
        </div>
      </div>
      <div className="monaco-wrap" data-testid="orm-monaco-editor">
        <Editor
          height="100%"
          language={currentLang}
          value={code}
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
