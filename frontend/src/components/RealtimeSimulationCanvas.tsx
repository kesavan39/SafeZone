import React, { useRef, useEffect } from 'react';
import { TimestepData, RiskLevel } from '../types';

interface RealtimeSimulationCanvasProps {
  currentFrame: TimestepData | null;
  staticRadius?: number;
  showBaseline?: boolean;
}

export const RealtimeSimulationCanvas: React.FC<RealtimeSimulationCanvasProps> = ({
  currentFrame,
  staticRadius = 2.5,
  showBaseline = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridWidth = 20.0;
  const gridHeight = 15.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentFrame) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = canvas.width / gridWidth;
    const scaleY = canvas.height / gridHeight;

    const rPos = { x: currentFrame.robot.x * scaleX, y: currentFrame.robot.y * scaleY };
    const hPos = { x: currentFrame.human.x * scaleX, y: currentFrame.human.y * scaleY };
    const sReqPx = currentFrame.required_separation * scaleX;
    const staticRadiusPx = staticRadius * scaleX;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
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

    if (showBaseline) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(rPos.x, rPos.y, staticRadiusPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px Inter';
      ctx.fillText('Static Baseline 2.5m', rPos.x - 45, rPos.y - staticRadiusPx - 6);
    }

    const risk = currentFrame.risk_level;
    let zoneColorFill = 'rgba(16, 185, 129, 0.12)';
    let zoneColorStroke = '#10b981';

    if (risk === 'WARNING') {
      zoneColorFill = 'rgba(245, 158, 11, 0.18)';
      zoneColorStroke = '#f59e0b';
    } else if (risk === 'HIGH_RISK') {
      zoneColorFill = 'rgba(249, 115, 22, 0.25)';
      zoneColorStroke = '#f97316';
    } else if (risk === 'CRITICAL') {
      zoneColorFill = 'rgba(239, 68, 68, 0.35)';
      zoneColorStroke = '#ef4444';
    }

    ctx.fillStyle = zoneColorFill;
    ctx.strokeStyle = zoneColorStroke;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(rPos.x, rPos.y, sReqPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = zoneColorStroke;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(rPos.x, rPos.y);
    ctx.lineTo(hPos.x, hPos.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const midX = (rPos.x + hPos.x) / 2;
    const midY = (rPos.y + hPos.y) / 2;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = zoneColorStroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(midX - 35, midY - 12, 70, 22, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentFrame.actual_distance.toFixed(2)}m`, midX, midY + 3);

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(rPos.x, rPos.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Inter';
    ctx.fillText('R-001', rPos.x, rPos.y + 3);

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(hPos.x, hPos.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Inter';
    ctx.fillText('H-1', hPos.x, hPos.y + 3);

  }, [currentFrame, staticRadius, showBaseline]);

  return (
    <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />

      {currentFrame && (
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-lg flex items-center space-x-4">
          <div>
            <p className="text-[10px] text-slate-400 font-mono">Actual Distance</p>
            <p className="text-base font-bold text-slate-100 font-mono">{currentFrame.actual_distance.toFixed(2)} m</p>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div>
            <p className="text-[10px] text-slate-400 font-mono">Dynamic Req. Separation</p>
            <p className="text-base font-bold text-cyan-400 font-mono">{currentFrame.required_separation.toFixed(2)} m</p>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div>
            <p className="text-[10px] text-slate-400 font-mono">System Confidence</p>
            <p className="text-base font-bold text-emerald-400 font-mono">{currentFrame.confidence}%</p>
          </div>
        </div>
      )}
    </div>
  );
};
