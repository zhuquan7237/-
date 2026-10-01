import React, { useRef } from 'react';
import {
  Menu,
  ClipboardPaste,
  Smartphone,
  Monitor,
  Github,
  Plus,
  Download,
  Upload,
  Sun,
  Moon,
  ArrowUpCircle,
} from 'lucide-react';
import { CodeFile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { UpdateInfo } from '../services/updater';

interface TopAppBarProps {
  activeFile: CodeFile | null;
  onOpenFilesDrawer: () => void;
  onOpenNewModal: () => void;
  onOpenSmartPaste: () => void;
  onOpenGitHubModal: () => void;
  onOpenUpdateModal: () => void;
  updateInfo: UpdateInfo | null;
  onImportFiles: (files: FileList) => void;
  isPhoneFrameActive: boolean;
  onTogglePhoneFrame: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  activeFile,
  onOpenFilesDrawer,
  onOpenNewModal,
  onOpenSmartPaste,
  onOpenGitHubModal,
  onOpenUpdateModal,
  updateInfo,
  onImportFiles,
  isPhoneFrameActive,
  onTogglePhoneFrame,
}) => {
  const { toggleTheme, isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
      e.target.value = '';
    }
  };

  const hasUpdate = updateInfo?.hasUpdate;

  return (
    <header
      className={`w-full border-b flex items-center justify-between z-30 shrink-0 select-none transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md shadow-xs'
      } ${
        !isPhoneFrameActive
          ? 'pt-[max(env(safe-area-inset-top,0px),34px)] pb-2 px-3 sm:px-4 min-h-[74px] sm:min-h-[58px]'
          : 'py-2 px-3 sm:px-4 min-h-[56px]'
      }`}
    >
      {/* Zone 1: File Drawer Trigger & Active File Badge */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenFilesDrawer}
          className={`p-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 ${
            isDark
              ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="打开文件管理侧边栏 (支持左划关闭)"
          aria-label="打开侧边栏"
        >
          <Menu className="w-4 h-4 text-indigo-500" />
          <span className="hidden sm:inline text-xs font-semibold">文件</span>
        </button>

        {activeFile && (
          <button
            onClick={onOpenFilesDrawer}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left cursor-pointer min-w-0 transition-all active:scale-98 ${
              isDark
                ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
            title="点击打开文件抽屉切换"
          >
            <span
              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                isDark
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
              }`}
            >
              .{activeFile.extension}
            </span>
            <span
              className={`text-xs font-semibold truncate font-mono max-w-[90px] xs:max-w-[130px] sm:max-w-[180px] ${
                isDark ? 'text-slate-200' : 'text-slate-900'
              }`}
            >
              {activeFile.name}
            </span>
          </button>
        )}
      </div>

      {/* Zone 2 & 3: Quick Functional Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Hidden Local File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".svg,.html,.htm,.xml,.json,.md,.css,.txt,.*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Import Local File Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
          }`}
          title="导入电脑或手机已有代码文件"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden sm:inline">导入</span>
        </button>

        {/* Smart AI Paste Button */}
        <button
          onClick={onOpenSmartPaste}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          title="快速粘贴 AI 代码并自动识别格式渲染"
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          <span>粘贴代码</span>
        </button>

        {/* In-app Auto Update Trigger Button */}
        <button
          onClick={onOpenUpdateModal}
          className={`relative p-2 rounded-xl text-xs font-medium active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 ${
            hasUpdate
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 ring-1 ring-indigo-500/30'
              : isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title={hasUpdate ? '发现新版本，点击一键在线更新' : '检查软件在线更新'}
        >
          <ArrowUpCircle className={`w-4 h-4 ${hasUpdate ? 'text-indigo-400 animate-bounce' : ''}`} />
          {hasUpdate && (
            <span className="hidden md:inline text-xs font-bold text-indigo-300">
              新版本
            </span>
          )}
          {hasUpdate && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>

        {/* Direct APK Download Button */}
        <a
          href="/RenderCraft-v1.0.0.apk"
          download="RenderCraft-v1.0.0.apk"
          className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          title="直接下载打包好的 Android APK 安装包 (4.6 MB)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>下载 APK</span>
        </a>

        {/* Theme Toggle: Sun / Moon */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400'
              : 'bg-slate-100 hover:bg-slate-200 text-amber-600'
          }`}
          title={isDark ? '切换至明亮日间模式' : '切换至暗黑夜间模式'}
          aria-label="切换主题"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* New File Button */}
        <button
          onClick={onOpenNewModal}
          className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-all cursor-pointer flex items-center gap-1 ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
          }`}
          title="新建代码文件"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">新建</span>
        </button>

        {/* Desktop Phone Frame Toggle */}
        <button
          onClick={onTogglePhoneFrame}
          className={`hidden md:flex p-2 rounded-xl transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title={isPhoneFrameActive ? '切换到全屏桌面布局' : '切换到手机尺寸模拟'}
        >
          {isPhoneFrameActive ? (
            <Monitor className="w-4 h-4 text-indigo-500" />
          ) : (
            <Smartphone className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* GitHub / Export Modal */}
        <button
          onClick={onOpenGitHubModal}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="关于应用与工程导出"
        >
          <Github className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
