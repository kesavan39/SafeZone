import React, { useState, useRef, useEffect } from 'react';
import { LayoutObject, Waypoint } from '../types';
import { Plus, Trash2, RotateCw, Save, Navigation, Bot, UserCheck, Move, Grid } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LayoutBuilderCanvasProps {
  initialObjects?: LayoutObject[];
  onSaveLayout?: (objects: LayoutObject[], robotWaypoints: Waypoint[], humanWaypoints: Waypoint[]) => void;
}

export const LayoutBuilderCanvas: React.FC<LayoutBuilderCanvasProps> = ({ initialObjects, onSaveLayout }) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [objects, setObjects] = useState<LayoutObject[]>(initialObjects || [
    { id: '1', type: 'robot', name: 'Robot R-001', x: 5.0, y: 7.5, width: 1.5, height: 1.5, rotation: 0 },
    { id: '2', type: 'workstation', name: 'Operator Station W-1', x: 12.0, y: 7.5, width: 1.5, height: 1.5, rotation: 0 },
    { id: '3', type: 'conveyor', name: 'Feed Conveyor', x: 5.0, y: 3.0, width: 10.0, height: 1.0, rotation: 0 },
    { id: '4', type: 'obstacle', name: 'Safety Pillar', x: 9.0, y: 10.0, width: 1.0, height: 1.0, rotation: 0 }
  ]);

  const [robotWaypoints, setRobotWaypoints] = useState<Waypoint[]>([
    { x: 4.0, y: 7.5, speed: 1.5 },
    { x: 7.5, y: 7.5, speed: 1.8 },
    { x: 7.5, y: 10.0, speed: 1.2 },
    { x: 4.0, y: 10.0, speed: 1.0 }
  ]);

  const [humanWaypoints, setHumanWaypoints] = useState<Waypoint[]>([
    { x: 14.0, y: 7.5, speed: 1.0 },
    { x: 10.0, y: 7.5, speed: 1.2 },
    { x: 8.0, y: 7.5, speed: 1.3 },
    { x: 14.0, y: 7.5, speed: 1.0 }
  ]);

  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [activeTool, setActiveTool] = useState<'select' | 'robot_path' | 'human_path'>('select');

  const gridWidth = 20.0;
  const gridHeight = 15.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = canvas.width / gridWidth;
    const scaleY = canvas.height / gridHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * scaleX, 0);
      ctx.lineTo(x * scaleX, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * scaleY);
      ctx.lineTo(canvas.width, y * scaleY);
      ctx.stroke();
    }

    objects.forEach(obj => {
      const isSelected = obj.id === selectedId;
      const px = obj.x * scaleX;
      const py = obj.y * scaleY;
      const pw = obj.width * scaleX;
      const ph = obj.height * scaleY;

      ctx.save();
      ctx.translate(px, py);
      if (obj.rotation) ctx.rotate((obj.rotation * Math.PI) / 180);

      if (obj.type === 'robot') {
        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.2)';
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#0284c7';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
        ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
        
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 1.2 * scaleX, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (obj.type === 'workstation') {
        ctx.fillStyle = isSelected ? 'rgba(251, 191, 36, 0.3)' : 'rgba(217, 119, 6, 0.2)';
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#d97706';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
        ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
      } else if (obj.type === 'conveyor') {
        ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
        ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
      } else {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
        ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
      }

      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(obj.name, 0, ph / 2 + 12);
      ctx.restore();
    });

    if (robotWaypoints.length > 1) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      robotWaypoints.forEach((wp, idx) => {
        const px = wp.x * scaleX;
        const py = wp.y * scaleY;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      robotWaypoints.forEach((wp) => {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(wp.x * scaleX, wp.y * scaleY, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    if (humanWaypoints.length > 1) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      humanWaypoints.forEach((wp, idx) => {
        const px = wp.x * scaleX;
        const py = wp.y * scaleY;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      humanWaypoints.forEach((wp) => {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(wp.x * scaleX, wp.y * scaleY, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [objects, robotWaypoints, humanWaypoints, selectedId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * gridWidth;
    const clickY = ((e.clientY - rect.top) / rect.height) * gridHeight;

    if (activeTool === 'robot_path') {
      setRobotWaypoints([...robotWaypoints, { x: round(clickX, 1), y: round(clickY, 1), speed: 1.5 }]);
    } else if (activeTool === 'human_path') {
      setHumanWaypoints([...humanWaypoints, { x: round(clickX, 1), y: round(clickY, 1), speed: 1.2 }]);
    } else {
      const found = objects.find(obj => Math.abs(obj.x - clickX) < obj.width / 2 + 0.5 && Math.abs(obj.y - clickY) < obj.height / 2 + 0.5);
      setSelectedId(found ? found.id : null);
    }
  };

  const addObject = (type: 'robot' | 'workstation' | 'conveyor' | 'obstacle') => {
    const newObj: LayoutObject = {
      id: String(Date.now()),
      type,
      name: `${type.toUpperCase()} #${objects.length + 1}`,
      x: 10.0,
      y: 7.5,
      width: type === 'conveyor' ? 6.0 : 1.5,
      height: 1.5,
      rotation: 0
    };
    setObjects([...objects, newObj]);
    setSelectedId(newObj.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setObjects(objects.filter(o => o.id !== selectedId));
    setSelectedId(null);
  };

  const rotateSelected = () => {
    if (!selectedId) return;
    setObjects(objects.map(o => o.id === selectedId ? { ...o, rotation: ((o.rotation || 0) + 45) % 360 } : o));
  };

  const round = (val: number, decimals: number) => Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);

  const selectedObj = objects.find(o => o.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Grid className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-200">{t('layout.title')}</h2>
            <span className="text-xs text-slate-500 font-mono">(20m x 15m Cell)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTool('select')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
                activeTool === 'select' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Select/Move</span>
            </button>

            <button
              onClick={() => setActiveTool('robot_path')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
                activeTool === 'robot_path' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Draw Robot Path</span>
            </button>

            <button
              onClick={() => setActiveTool('human_path')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
                activeTool === 'human_path' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Draw Human Path</span>
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 shadow-inner">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => addObject('robot')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('layout.add_robot')}</span>
            </button>
            <button
              onClick={() => addObject('workstation')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('layout.add_human')}</span>
            </button>
            <button
              onClick={() => addObject('conveyor')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('layout.add_conveyor')}</span>
            </button>
            <button
              onClick={() => addObject('obstacle')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('layout.add_obstacle')}</span>
            </button>
          </div>

          <button
            onClick={() => onSaveLayout && onSaveLayout(objects, robotWaypoints, humanWaypoints)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs px-4 py-2 rounded-xl flex items-center space-x-2 transition shadow-lg shadow-cyan-600/20"
          >
            <Save className="w-4 h-4" />
            <span>{t('layout.save')}</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-4">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Object Property Inspector</h3>

        {selectedObj ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Object Name</label>
              <input
                type="text"
                value={selectedObj.name}
                onChange={(e) => {
                  setObjects(objects.map(o => o.id === selectedId ? { ...o, name: e.target.value } : o));
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">X Coord (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={selectedObj.x}
                  onChange={(e) => {
                    setObjects(objects.map(o => o.id === selectedId ? { ...o, x: parseFloat(e.target.value) || 0 } : o));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Y Coord (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={selectedObj.y}
                  onChange={(e) => {
                    setObjects(objects.map(o => o.id === selectedId ? { ...o, y: parseFloat(e.target.value) || 0 } : o));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={rotateSelected}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium py-2 rounded-lg border border-slate-700 flex items-center justify-center space-x-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate 45°</span>
              </button>

              <button
                onClick={deleteSelected}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium px-3 py-2 rounded-lg border border-rose-500/30 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Select an object on the 2D layout canvas to view and edit its parameters.</p>
        )}

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Path Waypoint Summary</span>
          </h4>
          <p className="text-xs text-slate-400">Robot Waypoints: <span className="font-mono text-cyan-400">{robotWaypoints.length} points</span></p>
          <p className="text-xs text-slate-400">Human Waypoints: <span className="font-mono text-amber-400">{humanWaypoints.length} points</span></p>
        </div>
      </div>
    </div>
  );
};
