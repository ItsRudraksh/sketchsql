import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel/LeftPanel';
import CanvasArea from './components/Canvas/CanvasArea';
import RightPanel from './components/RightPanel/RightPanel';
import WelcomeScreen from './components/Modals/WelcomeScreen';
import ImportSqlModal from './components/Modals/ImportSqlModal';
import SaveDiagramModal from './components/Modals/SaveDiagramModal';
import ShareModal from './components/Modals/ShareModal';
import useDiagramStore from './store/diagramStore';
import useUIStore from './store/uiStore';
import useAutoSave from './hooks/useAutoSave';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { loadFromAutosave } from './utils/persistence';

function App() {
  const { loadDiagram, nodes } = useDiagramStore();
  const { importSqlModalOpen, saveDiagramModalOpen, shareModalOpen, theme } = useUIStore();
  const [showWelcome, setShowWelcome] = useState(false);

  useAutoSave();
  useKeyboardShortcuts();

  useEffect(() => {
    const saved = loadFromAutosave();
    if (saved && saved.tables && saved.tables.length > 0) {
      loadDiagram(saved);
    } else {
      setShowWelcome(true);
    }
  }, []); // eslint-disable-line

  return (
    <div className={`app-root ${theme}`} data-testid="app-root">
      <Header />
      <div className="app-body">
        <LeftPanel />
        <div className="canvas-wrapper">
          <CanvasArea />
          {showWelcome && nodes.length === 0 && (
            <WelcomeScreen onDismiss={() => setShowWelcome(false)} />
          )}
        </div>
        <RightPanel />
      </div>

      {importSqlModalOpen && <ImportSqlModal />}
      {saveDiagramModalOpen && <SaveDiagramModal />}
      {shareModalOpen && <ShareModal />}

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#161b27',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            fontSize: '13px',
            borderRadius: '6px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#161b27' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#161b27' } },
        }}
      />
    </div>
  );
}

export default App;
