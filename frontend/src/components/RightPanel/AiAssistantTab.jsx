import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useDiagramStore from '../../store/diagramStore';
import useUIStore from '../../store/uiStore';
import { aiGenerateSchema, aiAnalyzeSchema, aiChat } from '../../api/apiClient';
import { autoLayout } from '../../utils/diagramLayout';
import toast from 'react-hot-toast';
import { Send, Sparkles, BarChart2, Trash2, User, Bot } from 'lucide-react';

const CHIPS = ['E-commerce store', 'Blog with comments', 'University management', 'Hospital system'];

function ChatMessage({ msg }) {
  const isAI = msg.role === 'assistant';
  return (
    <div className={`chat-msg ${isAI ? 'ai' : 'user'}`} data-testid={`chat-msg-${msg.role}`}>
      <div className="chat-avatar">{isAI ? <Bot size={13} /> : <User size={13} />}</div>
      <div className="chat-bubble">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="chat-msg ai">
      <div className="chat-avatar"><Bot size={13} /></div>
      <div className="chat-bubble thinking">
        <span className="dot" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  );
}

export default function AiAssistantTab() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const { loadDiagram, getDiagramJSON } = useDiagramStore();
  const dialect = useDiagramStore((s) => s.dialect);
  const { setActiveTab } = useUIStore();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    const currentNodes = useDiagramStore.getState().nodes;
    if (currentNodes.length > 0) {
      const confirmed = window.confirm('Canvas has content. Replace with new schema?');
      if (!confirmed) return;
    }
    setLoading(true);
    try {
      const diagram = await aiGenerateSchema(prompt);
      const laid = autoLayout(diagram.tables || [], diagram.relationships || []);
      loadDiagram({ ...diagram, tables: laid });
      toast.success(`Schema generated — ${diagram.tables?.length || 0} tables added`);
      setPrompt('');
      setActiveTab('sql');
    } catch (e) {
      toast.error('AI unavailable, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (loading) return;
    const diagram = getDiagramJSON();
    if (!diagram.tables?.length) { toast.error('Add tables to the canvas first'); return; }
    const userMsg = { role: 'user', content: 'Please analyze my current database schema and suggest improvements.' };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const analysis = await aiAnalyzeSchema(diagram, dialect);
      setMessages((m) => [...m, { role: 'assistant', content: analysis }]);
    } catch {
      toast.error('AI unavailable, please try again');
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || loading) return;
    const userMsg = { role: 'user', content: chatInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput('');
    setLoading(true);
    try {
      const diagram = getDiagramJSON();
      const reply = await aiChat(newMessages, diagram, dialect);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      toast.error('AI unavailable, please try again');
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tab" data-testid="ai-assistant-tab">
      {/* NL Generate */}
      <div className="ai-gen-section">
        <div className="ai-gen-label"><Sparkles size={12} /> Generate from description</div>
        <div className="ai-gen-row">
          <input
            className="ai-gen-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Describe a schema in plain English..."
            disabled={loading}
            data-testid="ai-prompt-input"
          />
          <button
            className="ai-gen-btn"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            data-testid="ai-generate-btn"
          >
            {loading ? '...' : 'Build'}
          </button>
        </div>
        <div className="ai-chips">
          {CHIPS.map((c) => (
            <button key={c} className="ai-chip" onClick={() => setPrompt(c)} data-testid={`chip-${c}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="ai-actions">
        <button className="ai-analyze-btn" onClick={handleAnalyze} disabled={loading} data-testid="analyze-schema-btn">
          <BarChart2 size={12} /> Analyze My Schema
        </button>
        {messages.length > 0 && (
          <button className="ai-clear-btn" onClick={() => setMessages([])} data-testid="clear-chat-btn">
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {/* Chat */}
      <div className="chat-area" data-testid="chat-area">
        {messages.length === 0 && !loading && (
          <div className="chat-empty">
            <Bot size={28} style={{ color: '#64748b', marginBottom: 8 }} />
            <p>Ask about your schema or request SQL queries</p>
          </div>
        )}
        {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
        {loading && <Thinking />}
        <div ref={chatEndRef} />
      </div>

      {/* Chat input */}
      <div className="chat-input-row">
        <input
          className="chat-input"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
          placeholder="Ask about your schema or request a query..."
          disabled={loading}
          data-testid="chat-input"
        />
        <button
          className="chat-send-btn"
          onClick={handleChatSend}
          disabled={loading || !chatInput.trim()}
          data-testid="chat-send-btn"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
