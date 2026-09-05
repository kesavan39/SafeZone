import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, FastForward, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SimulationControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onStep: () => void;
  speedMultiplier: number;
  onSpeedChange: (speed: number) => void;
  mode: 'static' | 'dynamic';
  onModeChange: (mode: 'static' | 'dynamic') => void;
  missingData: string | null;
  onMissingDataChange: (val: string | null) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  onPlayPause,
  onReset,
  onStep,
  speedMultiplier,
  onSpeedChange,
  mode,
  onModeChange,
  missingData,
  onMissingDataChange
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={onPlayPause}
          className={`p-2.5 rounded-xl text-white font-medium flex items-center space-x-2 transition shadow-lg ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          <span className="text-xs font-semibold">{isPlaying ? t('simulation.pause') : t('simulation.start')}</span>
        </button>

        <button
          onClick={onStep}
          disabled={isPlaying}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl border border-slate-700 transition"
          title="Single Step Forward"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
          title={t('simulation.reset')}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <FastForward className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
        {[0.5, 1.0, 2.0, 5.0].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
              speedMultiplier === s ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onModeChange('static')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mode === 'static' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Static 2.5m Baseline</span>
        </button>

        <button
          onClick={() => onModeChange('dynamic')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mode === 'dynamic' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dynamic Safety Zone</span>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-xs text-slate-400 font-mono">Simulate Fault:</span>
        <select
          value={missingData || ''}
          onChange={(e) => onMissingDataChange(e.target.value ? e.target.value : null)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="">None (Nominal Data)</option>
          <option value="human_pos">Human Position Lost</option>
          <option value="robot_speed">Robot Encoder Lost</option>
        </select>
      </div>
    </div>
  );
};
