import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ProjectProvider } from './context/ProjectContext';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { LayoutEditorPage } from './pages/LayoutEditorPage';
import { SimulationStudioPage } from './pages/SimulationStudioPage';
import { ScenarioLabPage } from './pages/ScenarioLabPage';
import { SensitivityPage } from './pages/SensitivityPage';
import { ReportsPage } from './pages/ReportsPage';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
        {activeTab === 'layout_editor' && <LayoutEditorPage />}
        {activeTab === 'simulation' && <SimulationStudioPage />}
        {activeTab === 'scenario_lab' && <ScenarioLabPage />}
        {activeTab === 'sensitivity' && <SensitivityPage />}
        {activeTab === 'reports' && <ReportsPage />}
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 text-center text-xs text-slate-500 font-mono">
        Dynamic Human-Robot Safety Zone Simulator • Industrial Safety Decision Support System • ISO 13849 & SIL 2 Protocol Compliant Design
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </LanguageProvider>
  );
};

export default App;
