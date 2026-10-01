import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  isFrameActive: boolean;
  onToggleFrame: () => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  isFrameActive,
}) => {
  // Current time representation for status bar
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  if (!isFrameActive) {
    return (
      <div className="w-full h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100">
        {children}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 lg:p-8">
      {/* Phone Shell */}
      <div className="w-full max-w-[430px] h-[100dvh] md:h-[880px] bg-slate-900 border-0 md:border-[10px] md:border-slate-800 md:rounded-[48px] shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-white/10">
        {/* Android Punch Hole & Status Bar */}
        <div className="h-10 px-6 pt-1 flex items-center justify-between text-xs text-slate-300 select-none z-30 shrink-0 bg-slate-900/90 backdrop-blur-md">
          <span className="font-semibold text-[13px] tracking-tight">{timeStr}</span>

          {/* Camera Notch */}
          <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-white/10" />

          {/* Signal & Battery Icons */}
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[11px] font-mono">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Inner Phone Content */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-slate-950">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="h-5 flex items-center justify-center bg-slate-950 shrink-0 select-none pointer-events-none pb-1">
          <div className="w-32 h-1 rounded-full bg-slate-600/70" />
        </div>
      </div>
    </div>
  );
};
