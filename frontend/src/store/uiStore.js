import { create } from 'zustand';

const useUIStore = create((set) => ({
  activeTab: 'sql',
  theme: 'dark',
  showMinimap: true,
  showGrid: true,
  selectedNodeId: null,
  selectedEdgeId: null,
  importSqlModalOpen: false,
  saveDiagramModalOpen: false,
  generatedSql: '',
  sqlLoading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),
  openImportSqlModal: () => set({ importSqlModalOpen: true }),
  closeImportSqlModal: () => set({ importSqlModalOpen: false }),
  openSaveDiagramModal: () => set({ saveDiagramModalOpen: true }),
  closeSaveDiagramModal: () => set({ saveDiagramModalOpen: false }),
  setGeneratedSql: (sql) => set({ generatedSql: sql }),
  setSqlLoading: (v) => set({ sqlLoading: v }),
}));

export default useUIStore;
