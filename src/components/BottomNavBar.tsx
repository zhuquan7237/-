import React from 'react';
import { motion } from 'motion/react';
import { FileCode, Eye, FolderClosed, Columns } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavBarProps {
  activeTab: ActiveTab | 'split';
  onChangeTab: (tab: ActiveTab | 'split') => void;
  filesCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  filesCount,
}) => {
  const tabs = [
    {
      id: 'editor' as const,
      label: '代码编辑',
      icon: FileCode,
    },
    {
      id: 'preview' as const,
      label: '效果渲染',
      icon: Eye,
    },
    {
      id: 'split' as const,
      label: '分屏双览',
      icon: Columns,
    },
    {
      id: 'files' as const,
      label: '文件管理',
      icon: FolderClosed,
      badge: filesCount,
    },
  ];

  return (
    <nav className="h-16 px-2 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around z-30 shrink-0 select-none pb-safe">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className="relative flex-1 py-1.5 flex flex-col items-center justify-center cursor-pointer min-h-[44px] transition-all group"
          >
            {/* Active Pill Glow */}
            {isActive && (
              <motion.div
                layoutId="activeBottomTabPill"
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                className="absolute inset-x-3 inset-y-1 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl -z-10 shadow-sm"
              />
            )}

            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive
                    ? 'text-indigo-400 stroke-[2.2]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {tab.badge !== undefined && (
                <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[9px] min-w-[14px] text-center">
                  {tab.badge}
                </span>
              )}
            </div>

            <span
              className={`text-[11px] font-medium tracking-tight mt-1 transition-colors duration-200 ${
                isActive ? 'text-indigo-300' : 'text-slate-400 group-hover:text-slate-300'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
