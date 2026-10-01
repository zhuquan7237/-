import React from 'react';
import { motion } from 'motion/react';
import { FileCode, Eye, FolderClosed, Columns } from 'lucide-react';
import { ActiveTab } from '../types';
import { useTheme } from '../context/ThemeContext';

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
  const { isDark } = useTheme();

  const tabs = [
    {
      id: 'preview' as const,
      label: '效果渲染',
      icon: Eye,
    },
    {
      id: 'editor' as const,
      label: '代码编辑',
      icon: FileCode,
    },
    {
      id: 'split' as const,
      label: '分屏双览',
      icon: Columns,
    },
    {
      id: 'files' as const,
      label: '文件工作区',
      icon: FolderClosed,
      badge: filesCount,
    },
  ];

  return (
    <nav
      className={`min-h-[58px] px-2 border-t flex items-center justify-around z-30 shrink-0 select-none pb-safe transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-300 backdrop-blur-md'
          : 'bg-white/95 border-slate-200 text-slate-600 backdrop-blur-md shadow-xs'
      }`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className="relative flex-1 py-1 flex flex-col items-center justify-center cursor-pointer min-h-[44px] transition-all group active:scale-95"
            aria-label={tab.label}
          >
            {/* Active Pill Glow */}
            {isActive && (
              <motion.div
                layoutId="activeBottomTabPill"
                transition={{ type: 'spring', damping: 24, stiffness: 340 }}
                className={`absolute inset-x-2 inset-y-0.5 rounded-2xl -z-10 shadow-xs ${
                  isDark
                    ? 'bg-indigo-600/20 border border-indigo-500/40'
                    : 'bg-indigo-50 border border-indigo-200'
                }`}
              />
            )}

            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-colors duration-150 ${
                  isActive
                    ? 'text-indigo-600 stroke-[2.2]'
                    : isDark
                    ? 'text-slate-400 group-hover:text-slate-200'
                    : 'text-slate-500 group-hover:text-slate-800'
                }`}
              />
              {tab.badge !== undefined && (
                <span
                  className={`absolute -top-1 -right-3 px-1 py-0.2 rounded-full font-mono text-xs min-w-[15px] text-center border font-bold ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-indigo-300'
                      : 'bg-indigo-100 border-indigo-200 text-indigo-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </div>

            <span
              className={`text-xs font-semibold tracking-tight mt-1 transition-colors duration-150 ${
                isActive
                  ? isDark
                    ? 'text-indigo-300 font-bold'
                    : 'text-indigo-700 font-bold'
                  : isDark
                  ? 'text-slate-400 group-hover:text-slate-300'
                  : 'text-slate-500 group-hover:text-slate-800'
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
