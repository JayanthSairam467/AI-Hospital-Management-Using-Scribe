import React from 'react';
import { Activity } from 'lucide-react';

/**
 * Medical-themed loading animation with ECG heartbeat line.
 * Used as React.Suspense fallback — only appears when a view
 * is being lazy-loaded (slow network / large component chunk).
 */
export const ViewLoadingFallback: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full space-y-6">
      {/* Pulsing logo ring */}
      <div
        className="relative w-16 h-16 flex items-center justify-center"
        style={{ animation: 'pulseRing 1.6s ease-in-out infinite' }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-blue-200 opacity-40" />
        <div className="absolute inset-1 rounded-full border-2 border-blue-400 opacity-60" />
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Activity className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Animated ECG heartbeat SVG line */}
      <div className="w-64 h-8 overflow-hidden">
        <svg viewBox="0 0 500 60" className="w-full h-full">
          <path
            d="M 0 30 L 80 30 L 90 25 L 100 30 L 110 30 L 120 5 L 130 55 L 140 15 L 150 40 L 160 30 L 220 30 L 230 25 L 240 30 L 250 30 L 260 5 L 270 55 L 280 15 L 290 40 L 300 30 L 360 30 L 370 25 L 380 30 L 390 30 L 400 5 L 410 55 L 420 15 L 430 40 L 440 30 L 500 30"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1000"
            style={{
              animation: 'heartbeatLine 2.5s ease-in-out infinite',
            }}
          />
        </svg>
      </div>

      {/* Loading text */}
      <div
        className="text-center space-y-1"
        style={{ animation: 'fadeInUp 0.6s ease-out' }}
      >
        <p className="text-sm font-semibold text-slate-700">Loading clinical module...</p>
        <p className="text-xs text-slate-400">OmniScribe Health OS</p>
      </div>
    </div>
  );
};
