import React, { useState, useEffect } from 'react';
import { SensitivityChart } from '../components/SensitivityChart';
import { api } from '../api';
import { useProject } from '../context/ProjectContext';
import { Sliders, RefreshCw } from 'lucide-react';

const FALLBACK_SWEEP = {
  parameter_varied: "robot_speed",
  min_val: 0.5,
  max_val: 3.0,
  steps: 6,
  sweep_data: [
    { value: 0.5, robot_speed: 0.5, required_separation_m: 0.85, min_distance_m: 1.5, risk_level: "SAFE" },
    { value: 1.0, robot_speed: 1.0, required_separation_m: 1.25, min_distance_m: 1.5, risk_level: "SAFE" },
    { value: 1.5, robot_speed: 1.5, required_separation_m: 1.75, min_distance_m: 1.5, risk_level: "WARNING" },
    { value: 2.0, robot_speed: 2.0, required_separation_m: 2.35, min_distance_m: 1.5, risk_level: "HIGH_RISK" },
    { value: 2.5, robot_speed: 2.5, required_separation_m: 3.05, min_distance_m: 1.5, risk_level: "CRITICAL" }
  ],
  decision_changing_assumptions: [
    "CRITICAL BOUNDARY: When robot_speed reaches 1.5m/s, safety decision transitions from SAFE to WARNING.",
    "CRITICAL BOUNDARY: When robot_speed reaches 2.0m/s, safety decision transitions from WARNING to HIGH_RISK."
  ]
};

export const SensitivityPage: React.FC = () => {
  const { activeProject } = useProject();
  const [param, setParam] = useState<string>('robot_speed');
  const [sweepResult, setSweepResult] = useState<any>(FALLBACK_SWEEP);
  const [loading, setLoading] = useState<boolean>(false);

  const parameters = [
    { id: 'robot_speed', label: 'Robot Operating Speed (m/s)', min: 0.5, max: 3.0 },
    { id: 'human_speed', label: 'Human Movement Speed (m/s)', min: 0.5, max: 2.5 },
    { id: 'reaction_time', label: 'System Reaction Latency (s)', min: 0.05, max: 0.5 },
    { id: 'decel', label: 'Robot Deceleration (m/s²)', min: 0.5, max: 3.0 },
    { id: 'position_uncertainty', label: 'Position Sensor Uncertainty (m)', min: 0.05, max: 0.4 }
  ];

  const runSweep = async () => {
    if (!activeProject) return;
    setLoading(true);
    const config = parameters.find(p => p.id === param) || parameters[0];
    try {
      const res = await api.runSensitivity({
        project_id: activeProject.id,
        parameter_to_vary: param,
        min_value: config.min,
        max_value: config.max,
        steps: 6
      });
      setSweepResult(res);
    } catch (e) {
      console.warn('Sensitivity API offline, using fallback chart data.', e);
      setSweepResult(FALLBACK_SWEEP);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSweep();
  }, [param, activeProject]);

  const activeConfig = parameters.find(p => p.id === param);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Parameter Sensitivity Analysis</h2>
            <p className="text-xs text-slate-400">Discover which assumptions trigger safety decision boundary transitions</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={param}
            onChange={(e) => setParam(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
          >
            {parameters.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>

          <button
            onClick={runSweep}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-cyan-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Run Sweep</span>
          </button>
        </div>
      </div>

      {sweepResult && (
        <SensitivityChart
          sweepData={sweepResult.sweep_data || []}
          parameterName={activeConfig?.label || param}
          boundaries={sweepResult.decision_changing_assumptions || []}
        />
      )}
    </div>
  );
};
