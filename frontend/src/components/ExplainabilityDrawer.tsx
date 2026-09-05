import React from 'react';
import { TimestepData, RiskEvent } from '../types';
import { HelpCircle, Info, ShieldAlert, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ExplainabilityDrawerProps {
  currentFrame: TimestepData | null;
  activeEvent?: RiskEvent | null;
}

export const ExplainabilityDrawer: React.FC<ExplainabilityDrawerProps> = ({ currentFrame, activeEvent }) => {
  const { t } = useLanguage();

  if (!currentFrame && !activeEvent) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-3 h-full">
        <HelpCircle className="w-10 h-10 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-300">Safety Decision Explainability</h3>
        <p className="text-xs text-slate-500">Run or step through the simulation to view transparent real-time mathematical risk reasoning.</p>
      </div>
    );
  }

  const risk = activeEvent?.risk_level || currentFrame?.risk_level || 'SAFE';
  const actualDist = activeEvent?.distance_actual ?? currentFrame?.actual_distance ?? 0;
  const reqSep = activeEvent?.distance_required ?? currentFrame?.required_separation ?? 0;
  const confidence = activeEvent?.confidence ?? currentFrame?.confidence ?? 95;
  const explanation = activeEvent?.explanation || '';
  const recommendedAction = activeEvent?.recommended_action || 'Continue normal operation.';

  const breakdown = currentFrame?.breakdown || {};

  let riskBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  if (risk === 'WARNING') riskBg = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  if (risk === 'HIGH_RISK') riskBg = 'bg-orange-500/10 border-orange-500/30 text-orange-400';
  if (risk === 'CRITICAL') riskBg = 'bg-rose-500/10 border-rose-500/30 text-rose-400';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col space-y-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-200">{t('simulation.explainability')}</h3>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${riskBg}`}>
          {risk}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400">{t('simulation.actual_dist')}</p>
          <p className="text-base font-bold text-slate-100 font-mono">{actualDist.toFixed(2)} m</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400">{t('simulation.req_sep')}</p>
          <p className="text-base font-bold text-cyan-400 font-mono">{reqSep.toFixed(2)} m</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dynamic Separation Breakdown</span>
        </h4>

        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Robot Stopping Dist (D_stop)</span>
            <span className="font-mono text-slate-200">{breakdown.robot_stopping_distance || '1.80'} m</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Human Move Distance (D_move)</span>
            <span className="font-mono text-slate-200">{breakdown.human_movement_distance || '0.90'} m</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Safety Margin (M_margin)</span>
            <span className="font-mono text-slate-200">{breakdown.safety_margin || '0.30'} m</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Uncertainty Margin (U_total)</span>
            <span className="font-mono text-slate-200">{breakdown.uncertainty_margin || '0.24'} m</span>
          </div>
          {breakdown.fallback_buffer > 0 && (
            <div className="flex justify-between text-amber-400 font-semibold">
              <span>Missing Data Fallback Buffer</span>
              <span className="font-mono">+{breakdown.fallback_buffer} m</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Recommended Engineering Response</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed pl-5 font-medium">{recommendedAction}</p>
      </div>

      {explanation && (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
          {explanation}
        </div>
      )}

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Decision Confidence Score</span>
        <span className="font-mono font-bold text-emerald-400">{confidence}%</span>
      </div>
    </div>
  );
};
