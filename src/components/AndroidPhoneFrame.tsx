import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  isFrameActive: boolean;
  onToggleFrame: () => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  isFrameActive,
}) => {
  const { isDark } = useTheme();
  const [timeStr, setTimeStr] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // When rendered directly on real devices or full-viewport:
  if (!isFrameActive) {
    return (
      <div
        className={`w-full h-screen h-[100dvh] flex flex-col overflow-hidden select-text ${
          isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
      >
        {children}
      </div>
    );
  }

  // Simulator Frame Mode for desktop / presentation:
  return (
    <div
      className={`w-full min-h-screen flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-200/70 text-slate-900'
      }`}
    >
      {/* Outer Phone Shell */}
      <div
        className={`w-full max-w-[420px] h-[100dvh] sm:h-[860px] sm:max-h-[95vh] border-0 sm:border-[10px] sm:rounded-[44px] shadow-2xl flex flex-col relative overflow-hidden ring-1 ${
          isDark
            ? 'bg-slate-900 sm:border-slate-800 ring-white/10 shadow-black/60'
            : 'bg-white sm:border-slate-300 ring-slate-400/20 shadow-slate-400/40'
        }`}
      >
        {/* Android Punch Hole & Status Bar */}
        <div
          className={`h-9 px-5 pt-1.5 flex items-center justify-between text-xs select-none z-40 shrink-0 border-b backdrop-blur-md transition-colors ${
            isDark
              ? 'bg-slate-900/95 text-slate-300 border-slate-800/80'
              : 'bg-slate-100/95 text-slate-700 border-slate-200/80'
          }`}
        >
          {/* Status Bar Left: Time & App Status */}
          <div className="flex items-center gap-1.5 min-w-[50px]">
            <span className="font-semibold text-xs tracking-tight tabular-nums font-mono">
              {timeStr}
            </span>
          </div>

          {/* Center: Camera Punch Hole */}
          <div className="w-3.5 h-3.5 rounded-full bg-black ring-2 ring-slate-700/40 shrink-0" />

          {/* Status Bar Right: Signal, 5G, Wi-Fi, Battery */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] font-bold font-mono tracking-tighter opacity-80">
              5G
            </span>
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span>98%</span>
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
            </div>
          </div>
        </div>

        {/* Inner Phone Content */}
        <div
          className={`flex-1 flex flex-col min-h-0 relative overflow-hidden transition-colors ${
            isDark ? 'bg-slate-950' : 'bg-slate-50'
          }`}
        >
          {children}
        </div>

        {/* Android Gesture Navigation Bar at the bottom */}
        <div
          className={`h-5 flex items-center justify-center shrink-0 select-none pointer-events-none pb-1 transition-colors ${
            isDark ? 'bg-slate-900' : 'bg-slate-100'
          }`}
        >
          <div
            className={`w-28 h-1 rounded-full ${
              isDark ? 'bg-slate-600/70' : 'bg-slate-400/80'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
