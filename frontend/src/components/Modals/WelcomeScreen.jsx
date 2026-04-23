import React, { useState } from 'react';
import useDiagramStore from '../../store/diagramStore';
import useUIStore from '../../store/uiStore';
import { EXAMPLE_SCHEMAS } from '../../utils/exampleSchemas';
import { Database, Sparkles, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WelcomeScreen({ onDismiss }) {
  const [showExamples, setShowExamples] = useState(false);
  const { loadDiagram, addTable } = useDiagramStore();
  const { setActiveTab } = useUIStore();

  const handleScratch = () => {
    addTable({ x: 300, y: 200 });
    onDismiss();
    toast.success('Add tables by double-clicking the canvas');
  };

  const handleExample = (key) => {
    const schema = EXAMPLE_SCHEMAS[key];
    if (schema) {
      loadDiagram(schema);
      toast.success(`Loaded "${schema.name}" example schema`);
      onDismiss();
    }
  };

  const handleAI = () => {
    setActiveTab('ai');
    onDismiss();
    toast.success('Describe your schema in the AI Assistant tab');
  };

  const examples = [
    { key: 'ecommerce', label: 'E-Commerce Store', tables: 6 },
    { key: 'blog', label: 'Blog Platform', tables: 5 },
    { key: 'university', label: 'University System', tables: 5 },
    { key: 'hospital', label: 'Hospital Management', tables: 6 },
  ];

  return (
    <div className="welcome-overlay" data-testid="welcome-screen">
      <div className="welcome-box">
        <div className="welcome-logo">
          <Database size={36} style={{ color: '#6366f1' }} />
        </div>
        <h1 className="welcome-title">SketchSQL</h1>
        <p className="welcome-tagline">Draw your database. Get your SQL. Ask AI anything about it.</p>

        {!showExamples ? (
          <div className="welcome-cards">
            <button className="welcome-card" onClick={handleScratch} data-testid="start-scratch-btn">
              <Database size={22} style={{ color: '#818cf8' }} />
              <strong>Start from scratch</strong>
              <span>Begin with a blank canvas</span>
            </button>
            <button className="welcome-card" onClick={() => setShowExamples(true)} data-testid="try-example-btn">
              <BookOpen size={22} style={{ color: '#4ade80' }} />
              <strong>Try an example</strong>
              <span>Load a ready-made schema</span>
            </button>
            <button className="welcome-card" onClick={handleAI} data-testid="describe-ai-btn">
              <Sparkles size={22} style={{ color: '#fbbf24' }} />
              <strong>Describe with AI</strong>
              <span>Generate schema from text</span>
            </button>
          </div>
        ) : (
          <div className="example-list">
            <p className="example-list-title">Choose an example schema:</p>
            {examples.map((ex) => (
              <button key={ex.key} className="example-item" onClick={() => handleExample(ex.key)} data-testid={`example-${ex.key}`}>
                <span>{ex.label}</span>
                <span className="example-tables">{ex.tables} tables</span>
              </button>
            ))}
            <button className="back-link" onClick={() => setShowExamples(false)}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
