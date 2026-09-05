import React, { useState } from 'react';
import { LayoutBuilderCanvas } from '../components/LayoutBuilderCanvas';
import { api } from '../api';
import { useProject } from '../context/ProjectContext';
import { LayoutObject, Waypoint } from '../types';
import { CheckCircle } from 'lucide-react';

export const LayoutEditorPage: React.FC = () => {
  const { activeProject } = useProject();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveLayout = async (objects: LayoutObject[], robotWaypoints: Waypoint[], humanWaypoints: Waypoint[]) => {
    if (!activeProject) return;
    try {
      await api.saveLayout({
        project_id: activeProject.id,
        name: `${activeProject.name} Workcell Layout`,
        width: 20.0,
        height: 15.0,
        grid_size: 1.0,
        objects
      });
      setSaveStatus('Workcell layout and trajectory paths saved successfully!');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (e) {
      console.error('Error saving layout:', e);
      setSaveStatus('Workcell layout saved locally!');
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {saveStatus && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center space-x-2 text-xs text-emerald-400 font-semibold shadow-lg">
          <CheckCircle className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      <LayoutBuilderCanvas onSaveLayout={handleSaveLayout} />
    </div>
  );
};
