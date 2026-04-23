import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';
import Editor from '@monaco-editor/react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Database, ExternalLink, GitFork, Eye, Copy, Download, Loader2, AlertCircle } from 'lucide-react';
import TableNode from './Canvas/TableNode';
import RelationshipEdge from './Canvas/RelationshipEdge';
import { getShare } from '../api/apiClient';
import { generateSQL } from '../utils/sqlGenerator';
import { generateDjango, generatePrisma, generateSQLAlchemy } from '../utils/ormGenerator';
import { saveToAutosave } from '../utils/persistence';
import useDiagramStore from '../store/diagramStore';

const nodeTypes = { tableNode: TableNode };
const edgeTypes = { relationshipEdge: RelationshipEdge };

function toRFNodes(diagram) {
  return (diagram?.tables || []).map((t) => ({
    id: t.id,
    type: 'tableNode',
    position: t.position || { x: 100, y: 100 },
    data: { id: t.id, name: t.name, color: t.color || 'gray', columns: t.columns || [] },
    draggable: false,
    selectable: false,
  }));
}
function toRFEdges(diagram) {
  return (diagram?.relationships || []).map((r) => ({
    id: r.id,
    type: 'relationshipEdge',
    source: r.sourceTableId,
    sourceHandle: `source-${r.sourceColumnId}`,
    target: r.targetTableId,
    targetHandle: `target-${r.targetColumnId}`,
    data: { id: r.id, type: r.type || 'one-to-many', onDelete: r.onDelete || 'RESTRICT', onUpdate: r.onUpdate || 'RESTRICT', label: r.label || '' },
    selectable: false,
  }));
}

export default function ShareView() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const loadDiagram = useDiagramStore((s) => s.loadDiagram);

  const [state, setState] = useState({ status: 'loading', diagram: null, err: '', views: 0 });
  const [dialect, setDialect] = useState('mysql');
  const [tab, setTab] = useState('sql');
  const [ormFmt, setOrmFmt] = useState('django');

  useEffect(() => {
    let cancelled = false;
    getShare(shareId)
      .then((data) => {
        if (cancelled) return;
        setState({ status: 'ok', diagram: data.diagram, err: '', views: data.views || 1 });
        setDialect(data.diagram?.dialect || 'mysql');
      })
      .catch((e) => {
        if (cancelled) return;
        const code = e?.response?.status;
        setState({
          status: 'error',
          diagram: null,
          err: code === 404 ? 'This share link does not exist or has been removed.' : (e?.message || 'Failed to load share'),
          views: 0,
        });
      });
    return () => { cancelled = true; };
  }, [shareId]);

  const nodes = useMemo(() => toRFNodes(state.diagram), [state.diagram]);
  const edges = useMemo(() => toRFEdges(state.diagram), [state.diagram]);

  const sql = useMemo(() => {
    if (!state.diagram) return '';
    return generateSQL(state.diagram, dialect);
  }, [state.diagram, dialect]);

  const orm = useMemo(() => {
    if (!state.diagram) return '';
    if (ormFmt === 'django') return generateDjango(state.diagram);
    if (ormFmt === 'prisma') return generatePrisma(state.diagram);
    return generateSQLAlchemy(state.diagram);
  }, [state.diagram, ormFmt]);

  const handleFork = () => {
    if (!state.diagram) return;
    const forked = {
      ...state.diagram,
      id: null,
      name: `${state.diagram.name || 'Forked Diagram'} (fork)`,
      createdAt: null,
      updatedAt: null,
    };
    // Persist BEFORE navigate so App's useEffect hydrates from the fork, not the previous autosave.
    saveToAutosave(forked);
    loadDiagram(forked);
    toast.success('Forked to editor');
    navigate('/');
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const download = (text, ext, mime) => {
    const name = state.diagram?.name || 'diagram';
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (state.status === 'loading') {
    return (
      <div className="app-root dark" style={{ display: 'grid', placeItems: 'center', height: '100vh' }} data-testid="share-loading">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8' }}>
          <Loader2 size={18} className="spin" /> Loading shared diagram…
        </div>
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="app-root dark" style={{ display: 'grid', placeItems: 'center', height: '100vh' }} data-testid="share-error-view">
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <AlertCircle size={42} style={{ color: '#f87171', margin: '0 auto 12px' }} />
          <div style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Share not available</div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 18 }}>{state.err}</div>
          <button className="modal-confirm" onClick={() => navigate('/')} data-testid="share-goto-editor">
            Go to Editor
          </button>
        </div>
      </div>
    );
  }

  const { diagram } = state;

  return (
    <div className="app-root dark" data-testid="share-view">
      <header className="app-header">
        <div className="header-left">
          <div className="header-logo">
            <Database size={20} style={{ color: '#6366f1' }} />
            <span className="logo-text">SketchSQL</span>
          </div>
          <div className="header-divider" />
          <span className="diagram-name" data-testid="share-diagram-name">{diagram.name || 'Shared Diagram'}</span>
          <span
            style={{
              marginLeft: 10, padding: '2px 8px', borderRadius: 4, fontSize: 10,
              background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.35)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600,
            }}
          >Read-only · Shared</span>
        </div>

        <div className="header-center">
          <div className="dialect-toggle">
            <button
              className={`dialect-btn ${dialect === 'mysql' ? 'active' : ''}`}
              onClick={() => setDialect('mysql')}
              data-testid="share-dialect-mysql"
            >MySQL</button>
            <button
              className={`dialect-btn ${dialect === 'postgresql' ? 'active' : ''}`}
              onClick={() => setDialect('postgresql')}
              data-testid="share-dialect-postgresql"
            >PostgreSQL</button>
          </div>
        </div>

        <div className="header-right">
          <span style={{ color: '#64748b', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }} data-testid="share-views">
            <Eye size={12} /> {state.views} view{state.views === 1 ? '' : 's'}
          </span>
          <button className="header-action-btn" onClick={handleFork} data-testid="share-fork-btn" title="Open an editable copy in the editor">
            <GitFork size={13} /> Fork to edit
          </button>
          <a href="/" className="header-action-btn" data-testid="share-open-editor" style={{ textDecoration: 'none' }}>
            Editor <ExternalLink size={12} />
          </a>
        </div>
      </header>

      <div className="app-body">
        <div className="canvas-wrapper" style={{ flex: 1 }}>
          <div className="canvas-container" data-testid="share-canvas">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              zoomOnDoubleClick={false}
              proOptions={{ hideAttribution: true }}
              fitView
              fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
              minZoom={0.05}
              maxZoom={2.5}
            >
              <Background variant={BackgroundVariant.Dots} color="#1e293b" size={1} gap={24} style={{ opacity: 0.5 }} />
              <Controls style={{ background: '#161b27', border: '1px solid #1e293b', borderRadius: 6 }} showInteractive={false} />
              <MiniMap
                style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 6 }}
                nodeColor={(n) => {
                  const c = { blue: '#1e3a5f', green: '#14362a', purple: '#2d1b5e', orange: '#3b2200', red: '#3b1212', gray: '#1e293b' };
                  return c[n.data?.color] || '#1e293b';
                }}
                maskColor="rgba(6,9,18,0.7)"
              />
            </ReactFlow>
          </div>
        </div>

        <aside className="right-panel" style={{ width: 380, minWidth: 380, maxWidth: 380, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div className="right-panel-tabs">
            <button
              className={`rp-tab ${tab === 'sql' ? 'active' : ''}`}
              onClick={() => setTab('sql')}
              data-testid="share-tab-sql"
            >SQL</button>
            <button
              className={`rp-tab ${tab === 'orm' ? 'active' : ''}`}
              onClick={() => setTab('orm')}
              data-testid="share-tab-orm"
            >ORM</button>
          </div>

          {tab === 'sql' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '8px 10px', display: 'flex', gap: 6, borderBottom: '1px solid #1e293b' }}>
                <button className="header-action-btn" onClick={() => copy(sql)} data-testid="share-copy-sql"><Copy size={12} /> Copy</button>
                <button className="header-action-btn" onClick={() => download(sql, 'sql', 'text/plain')} data-testid="share-download-sql"><Download size={12} /> Download .sql</button>
              </div>
              <div style={{ flex: 1 }}>
                <Editor
                  height="100%"
                  defaultLanguage="sql"
                  value={sql}
                  theme="vs-dark"
                  options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false }}
                />
              </div>
            </div>
          )}

          {tab === 'orm' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '8px 10px', display: 'flex', gap: 6, borderBottom: '1px solid #1e293b', flexWrap: 'wrap' }}>
                {[
                  ['django', 'Django'],
                  ['prisma', 'Prisma'],
                  ['sqlalchemy', 'SQLAlchemy'],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    className={`dialect-btn ${ormFmt === k ? 'active' : ''}`}
                    onClick={() => setOrmFmt(k)}
                    data-testid={`share-orm-${k}`}
                  >{label}</button>
                ))}
                <div style={{ flex: 1 }} />
                <button className="header-action-btn" onClick={() => copy(orm)} data-testid="share-copy-orm"><Copy size={12} /></button>
                <button
                  className="header-action-btn"
                  onClick={() => download(orm, ormFmt === 'prisma' ? 'prisma' : 'py', 'text/plain')}
                  data-testid="share-download-orm"
                ><Download size={12} /></button>
              </div>
              <div style={{ flex: 1 }}>
                <Editor
                  height="100%"
                  defaultLanguage={ormFmt === 'prisma' ? 'javascript' : 'python'}
                  value={orm}
                  theme="vs-dark"
                  options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false }}
                />
              </div>
            </div>
          )}
        </aside>
      </div>

      <Toaster position="bottom-right" toastOptions={{
        duration: 2500,
        style: { background: '#161b27', color: '#f1f5f9', border: '1px solid #1e293b', fontSize: 13, borderRadius: 6 },
      }} />
    </div>
  );
}
