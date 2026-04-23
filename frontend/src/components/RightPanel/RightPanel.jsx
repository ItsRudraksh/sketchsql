import React from 'react';
import useUIStore from '../../store/uiStore';
import SqlOutputTab from './SqlOutputTab';
import AiAssistantTab from './AiAssistantTab';
import PropertiesTab from './PropertiesTab';
import OrmOutputTab from './OrmOutputTab';
import { Code2, Bot, Settings, Layers } from 'lucide-react';

const TABS = [
  { id: 'sql', label: 'SQL', icon: Code2 },
  { id: 'orm', label: 'ORM', icon: Layers },
  { id: 'ai', label: 'AI', icon: Bot },
  { id: 'properties', label: 'Properties', icon: Settings },
];

export default function RightPanel() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <aside className="right-panel" data-testid="right-panel">
      <div className="right-panel-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`rp-tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
            data-testid={`tab-${id}`}
          >
            <Icon size={13} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="right-panel-content">
        {activeTab === 'sql' && <SqlOutputTab />}
        {activeTab === 'orm' && <OrmOutputTab />}
        {activeTab === 'ai' && <AiAssistantTab />}
        {activeTab === 'properties' && <PropertiesTab />}
      </div>
    </aside>
  );
}
