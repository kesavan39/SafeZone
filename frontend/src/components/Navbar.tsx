import React, { useState } from 'react';
import { ShieldAlert, Cpu, LayoutGrid, PlayCircle, FlaskConical, Sliders, FileText, Globe, FolderKanban } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProject } from '../context/ProjectContext';
import { ProjectModal } from './ProjectModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { t, language, setLanguage } = useLanguage();
  const { activeProject } = useProject();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Cpu },
    { id: 'layout_editor', label: t('nav.layout_editor'), icon: LayoutGrid },
    { id: 'simulation', label: t('nav.simulation'), icon: PlayCircle },
    { id: 'scenario_lab', label: t('nav.scenario_lab'), icon: FlaskConical },
    { id: 'sensitivity', label: t('nav.sensitivity'), icon: Sliders },
    { id: 'reports', label: t('nav.reports'), icon: FileText },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400">
                SafetyZone AI
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Dynamic Human-Robot Safety Engine
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition"
            >
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              <span className="max-w-[140px] truncate">{activeProject?.name || 'Select Project'}</span>
            </button>

            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-1">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-slate-900 text-slate-200">EN</option>
                <option value="ta" className="bg-slate-900 text-slate-200">தமிழ்</option>
                <option value="hi" className="bg-slate-900 text-slate-200">हिंदी</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {isProjectModalOpen && (
        <ProjectModal onClose={() => setIsProjectModalOpen(false)} />
      )}
    </>
  );
};
