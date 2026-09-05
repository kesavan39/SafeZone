import React from 'react';
import { SensitivitySweepItem } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Sliders, AlertTriangle } from 'lucide-react';

interface SensitivityChartProps {
  sweepData: SensitivitySweepItem[];
  parameterName: string;
  boundaries: string[];
}

export const SensitivityChart: React.FC<SensitivityChartProps> = ({ sweepData, parameterName, boundaries }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-200">Sensitivity Analysis: {parameterName} Sweep</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {sweepData.length} Evaluation Points
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sweepData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="value" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: parameterName, position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Distance (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="required_separation_m" name="Req Dynamic Separation" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="min_distance_m" name="Simulated Min Distance" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {boundaries.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Decision-Changing Assumption Highlighted</span>
          </div>
          {boundaries.map((b, idx) => (
            <p key={idx} className="text-xs text-amber-200/90 leading-relaxed font-mono pl-5">
              • {b}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
