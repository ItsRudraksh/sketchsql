import React, { useEffect, useState } from 'react';
import useDiagramStore from '../../store/diagramStore';
import useUIStore from '../../store/uiStore';
import { shareDiagram } from '../../api/apiClient';
import toast from 'react-hot-toast';
import { X, Copy, Share2, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';

export default function ShareModal() {
  const getDiagramJSON = useDiagramStore((s) => s.getDiagramJSON);
  const nodes = useDiagramStore((s) => s.nodes);
  const { closeShareModal } = useUIStore();
  const [creating, setCreating] = useState(false);
  const [shareId, setShareId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState('');

  const shareUrl = shareId ? `${window.location.origin}/share/${shareId}` : '';

  const handleCreate = async () => {
    setCreating(true);
    setErr('');
    try {
      const diagram = getDiagramJSON();
      const id = await shareDiagram(diagram);
      setShareId(id);
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Failed to create share link');
    } finally {
      setCreating(false);
    }
  };

  // Auto-create on open if diagram has tables
  useEffect(() => {
    if (nodes.length > 0 && !shareId && !creating) {
      handleCreate();
    }
    // eslint-disable-next-line
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  const isEmpty = nodes.length === 0;

  return (
    <div className="modal-overlay" data-testid="share-modal" onClick={closeShareModal}>
      <div className="modal-box" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span><Share2 size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />Share Diagram</span>
          <button className="modal-close" onClick={closeShareModal}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {isEmpty ? (
            <div style={{ padding: '16px 0', color: '#94a3b8', fontSize: 13 }}>
              Add at least one table to your canvas before sharing.
            </div>
          ) : creating ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: '#94a3b8', fontSize: 13 }}>
              <Loader2 size={16} className="spin" /> Creating public link…
            </div>
          ) : err ? (
            <div style={{ color: '#f87171', fontSize: 13, padding: '12px 0' }} data-testid="share-error">
              {err}
              <button
                className="modal-confirm"
                onClick={handleCreate}
                style={{ marginLeft: 12 }}
                data-testid="share-retry-btn"
              >Retry</button>
            </div>
          ) : shareId ? (
            <>
              <label className="modal-label">Public read-only link</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="modal-input"
                  value={shareUrl}
                  readOnly
                  onFocus={(e) => e.target.select()}
                  data-testid="share-url-input"
                  style={{ flex: 1, fontFamily: 'Menlo, monospace', fontSize: 12 }}
                />
                <button
                  className="modal-confirm"
                  onClick={handleCopy}
                  data-testid="share-copy-btn"
                  style={{ padding: '0 12px' }}
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ marginTop: 14, padding: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, fontSize: 12, color: '#c7d2fe', lineHeight: 1.5 }}>
                Anyone with this link can view the ERD, generated SQL (MySQL & PostgreSQL), and ORM models.
                They can also fork the diagram to edit their own copy. Edits in this editor will <b>not</b> update the shared snapshot — generate a new link to share updates.
              </div>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-preview-link"
                data-testid="share-open-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 12, color: '#818cf8', textDecoration: 'none' }}
              >
                Open preview <ExternalLink size={12} />
              </a>
            </>
          ) : (
            <button
              className="modal-confirm"
              onClick={handleCreate}
              data-testid="share-create-btn"
            >
              Create public link
            </button>
          )}
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={closeShareModal} data-testid="share-close-btn">Close</button>
        </div>
      </div>
    </div>
  );
}
