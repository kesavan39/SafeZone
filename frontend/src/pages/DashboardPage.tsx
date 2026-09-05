import React from 'react';
import { useProject } from '../context/ProjectContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Clock, Bot, ArrowRight, LayoutGrid, PlayCircle, Sliders, AlertTriangle } from 'lucide-react';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { activeProject } = useProject();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>ISO 13849 / SIL 2 Dynamic Decision Support</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100">
            {activeProject ? activeProject.name : 'Contract Manufacturing Workcell'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time adaptive safety zone simulator eliminating unnecessary robot stops while guaranteeing operator proximity protection.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('simulation')}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs px-5 py-3 rounded-2xl flex items-center space-x-2 transition shadow-lg shadow-cyan-600/20 shrink-0"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Launch Realtime Studio</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl glass-panel-hover">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">{t('dashboard.safety_score')}</p>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-100 font-mono mt-2">98.4%</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">Zero Unsafe Breaches</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl glass-panel-hover">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">{t('dashboard.robot_stops')}</p>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-100 font-mono mt-2">0 Halts</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">-4 Unnecessary Halts Saved</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl glass-panel-hover">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">{t('dashboard.downtime_saved')}</p>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-100 font-mono mt-2">+25.7%</p>
          <p className="text-[11px] text-amber-400 mt-1 font-mono">Output Throughput Uplift</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl glass-panel-hover">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">Uncertainty Confidence</p>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-100 font-mono mt-2">±0.15 m</p>
          <p className="text-[11px] text-blue-400 mt-1 font-mono">94.2% System Confidence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('layout_editor')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl cursor-pointer glass-panel-hover group"
        >
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit mb-3 border border-cyan-500/20 group-hover:scale-110 transition">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition">1. Factory Layout Builder</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Drag and drop robots, workstations, conveyors, and set polyline motion trajectories.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('scenario_lab')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl cursor-pointer glass-panel-hover group"
        >
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-3 border border-amber-500/20 group-hover:scale-110 transition">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-400 transition">2. Operating Scenario Lab</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Execute Scenarios 1 (Normal), 2 (Path Crossings), and 3 (Workstation Layout Shift).
          </p>
        </div>

        <div
          onClick={() => setActiveTab('sensitivity')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl cursor-pointer glass-panel-hover group"
        >
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit mb-3 border border-blue-500/20 group-hover:scale-110 transition">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition">3. Sensitivity & Uncertainty</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Vary robot speeds and sensor noise to discover critical safety boundaries.
          </p>
        </div>
      </div>
    </div>
  );
};
