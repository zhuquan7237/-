import React from 'react';
import {
  FolderOpen,
  ClipboardPaste,
  Smartphone,
  Monitor,
  Github,
  Plus,
} from 'lucide-react';
import { CodeFile } from '../types';

interface TopAppBarProps {
  activeFile: CodeFile | null;
  onOpenFilesDrawer: () => void;
  onOpenNewModal: () => void;
  onOpenSmartPaste: () => void;
  onOpenGitHubModal: () => void;
  isPhoneFrameActive: boolean;
  onTogglePhoneFrame: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  activeFile,
  onOpenFilesDrawer,
  onOpenNewModal,
  onOpenSmartPaste,
  onOpenGitHubModal,
  isPhoneFrameActive,
  onTogglePhoneFrame,
}) => {
  return (
    <header className="h-14 px-3 sm:px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Zone 1: Brand & File Switcher */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenFilesDrawer}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          title="打开文件列表"
        >
          <FolderOpen className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline text-xs font-medium">文件</span>
        </button>

        {activeFile && (
          <div
            onClick={onOpenFilesDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer min-w-0 transition-colors"
            title="点击切换文件"
          >
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold shrink-0">
              .{activeFile.extension}
            </span>
            <span className="text-xs font-medium text-slate-200 truncate font-mono max-w-[110px] sm:max-w-[160px]">
              {activeFile.name}
            </span>
          </div>
        )}
      </div>

      {/* Zone 2 & 3: Primary Quick Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Smart AI Paste Button */}
        <button
          onClick={onOpenSmartPaste}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-medium shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          title="快速粘贴 AI 代码并识别渲染"
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          <span className="text-xs">粘贴代码</span>
        </button>

        {/* New File Button */}
        <button
          onClick={onOpenNewModal}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          title="新建文件 (自定义后缀)"
        >
          <Plus className="w-4 h-4 text-slate-300" />
          <span className="hidden sm:inline">新建</span>
        </button>

        {/* Toggle Phone Frame (Desktop only toggle) */}
        <button
          onClick={onTogglePhoneFrame}
          className="hidden md:flex p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title={isPhoneFrameActive ? '切换到全屏桌面' : '切换到安卓手机模拟'}
        >
          {isPhoneFrameActive ? (
            <Monitor className="w-4 h-4 text-indigo-400" />
          ) : (
            <Smartphone className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* GitHub / Export Modal */}
        <button
          onClick={onOpenGitHubModal}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          title="GitHub 部署与安卓验证"
        >
          <Github className="w-4 h-4 text-slate-200" />
          <span className="hidden lg:inline">GitHub 验证</span>
        </button>
      </div>
    </header>
  );
};
