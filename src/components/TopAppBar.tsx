import React, { useRef, useState } from 'react';
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
  MoreVertical,
  X,
  FolderOpen,
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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
      e.target.value = '';
    }
  };

  const hasUpdate = updateInfo?.hasUpdate;

  return (
    <header
      className={`w-full border-b select-none z-30 shrink-0 transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md shadow-xs'
      }`}
    >
      {/* Real Device System Status Bar Spacer */}
      {!isPhoneFrameActive && (
        <div className="w-full h-[max(env(safe-area-inset-top,0px),28px)] shrink-0 sm:hidden" />
      )}

      {/* Main Single-Line App Bar (Strict 54px, Never Wraps, Never Overlaps) */}
      <div className="h-14 px-3 sm:px-4 flex items-center justify-between gap-2 overflow-hidden">
        {/* Left Zone: File Drawer & Active File Pill */}
        <div className="flex items-center gap-1.5 min-w-0 shrink">
          <button
            onClick={onOpenFilesDrawer}
            className={`p-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="打开文件侧边栏"
            aria-label="打开侧边栏"
          >
            <Menu className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline text-xs font-semibold">文件</span>
          </button>

          {activeFile && (
            <button
              onClick={onOpenFilesDrawer}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border text-left cursor-pointer min-w-0 transition-all active:scale-98 shrink ${
                isDark
                  ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
              title="切换文件"
            >
              <span
                className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                  isDark
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                }`}
              >
                .{activeFile.extension}
              </span>
              <span
                className={`text-xs font-semibold truncate font-mono max-w-[85px] xs:max-w-[120px] sm:max-w-[180px] ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}
              >
                {activeFile.name}
              </span>
            </button>
          )}
        </div>

        {/* Right Zone: Primary Actions + Compact More Menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".svg,.html,.htm,.xml,.json,.md,.css,.txt,.*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Primary CTA: Smart Paste AI Code */}
          <button
            onClick={onOpenSmartPaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            title="一键粘贴 AI 代码"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>粘贴代码</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 shrink-0 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                : 'bg-slate-100 hover:bg-slate-200 text-amber-600'
            }`}
            title={isDark ? '切换至日间模式' : '切换至夜间模式'}
            aria-label="切换主题"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Desktop-only quick shortcuts */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>导入</span>
            </button>

            <button
              onClick={onOpenNewModal}
              className={`p-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
              }`}
              title="新建文件"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePhoneFrame}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}
              title={isPhoneFrameActive ? '全屏桌面视图' : '手机尺寸模拟'}
            >
              {isPhoneFrameActive ? (
                <Monitor className="w-4 h-4 text-indigo-500" />
              ) : (
                <Smartphone className="w-4 h-4 text-indigo-500" />
              )}
            </button>
          </div>

          {/* More Actions Menu Button (Holds all secondary tools without clutter) */}
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`relative p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
                hasUpdate
                  ? 'bg-indigo-600/20 text-indigo-500 ring-1 ring-indigo-500/40'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-950'
              }`}
              title="更多功能与设置"
              aria-label="更多功能"
            >
              <MoreVertical className="w-4 h-4" />
              {hasUpdate && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isMoreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMoreMenuOpen(false)}
                />
                <div
                  className={`absolute right-0 top-12 w-56 rounded-2xl border shadow-xl p-1.5 z-50 animate-fadeIn ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-200 shadow-black/60'
                      : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/40'
                  }`}
                >
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-indigo-500" />
                    <span>导入本地文件</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenNewModal();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Plus className="w-4 h-4 text-emerald-500" />
                    <span>新建代码文件</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenUpdateModal();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      hasUpdate
                        ? isDark
                          ? 'bg-indigo-600/20 text-indigo-300'
                          : 'bg-indigo-50 text-indigo-700'
                        : isDark
                        ? 'hover:bg-slate-800'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowUpCircle className="w-4 h-4 text-indigo-500" />
                      <span>在线检查更新</span>
                    </div>
                    {hasUpdate && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white">
                        新版本
                      </span>
                    )}
                  </button>

                  <a
                    href="/RenderCraft-v1.0.1.apk"
                    download="RenderCraft-v1.0.1.apk"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-4 h-4 text-teal-500" />
                      <span>下载 Android 安装包</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">4.6M</span>
                  </a>

                  <div
                    className={`my-1 border-t ${
                      isDark ? 'border-slate-800' : 'border-slate-100'
                    }`}
                  />

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenGitHubModal();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Github className="w-4 h-4 opacity-70" />
                    <span>GitHub 仓库与工程包</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
