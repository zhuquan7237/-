import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Search,
  FileCode,
  Download,
  Trash2,
  Copy,
  Edit2,
  Check,
  FolderOpen,
  Upload,
  ChevronLeft,
} from 'lucide-react';
import { CodeFile } from '../types';
import { formatBytes } from '../utils/codeDetect';
import { useTheme } from '../context/ThemeContext';

interface FileListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onOpenNewModal: () => void;
  onImportFiles: (files: FileList) => void;
  onDeleteFile: (fileId: string) => void;
  onDuplicateFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string, newExt: string) => void;
  onDownloadFile: (file: CodeFile) => void;
}

export const FileListDrawer: React.FC<FileListDrawerProps> = ({
  isOpen,
  onClose,
  files,
  activeFileId,
  onSelectFile,
  onOpenNewModal,
  onImportFiles,
  onDeleteFile,
  onDuplicateFile,
  onRenameFile,
  onDownloadFile,
}) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editExt, setEditExt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.extension.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startRename = (f: CodeFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(f.id);
    setEditName(f.name);
    setEditExt(f.extension);
  };

  const saveRename = (f: CodeFile, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editName.trim()) {
      onRenameFile(f.id, editName.trim(), editExt.trim().replace(/^\./, ''));
    }
    setEditingId(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
      e.target.value = '';
      onClose();
    }
  };

  const getExtBadgeClass = (ext: string) => {
    const lower = ext.toLowerCase();
    if (lower === 'svg') {
      return isDark
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        : 'bg-amber-50 text-amber-800 border-amber-300';
    }
    if (lower === 'html' || lower === 'htm') {
      return isDark
        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
        : 'bg-sky-50 text-sky-800 border-sky-300';
    }
    if (lower === 'xml') {
      return isDark
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        : 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
    if (lower === 'json') {
      return isDark
        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        : 'bg-yellow-50 text-yellow-800 border-yellow-300';
    }
    if (lower === 'md') {
      return isDark
        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
        : 'bg-indigo-50 text-indigo-800 border-indigo-300';
    }
    return isDark
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      : 'bg-purple-50 text-purple-800 border-purple-300';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start animate-fadeIn">
      {/* Semi-transparent backdrop - Tap anywhere to close */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-label="点击背景关闭侧边栏"
      />

      {/* Swipeable Left Drawer Container */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.6, right: 0 }}
        onDragEnd={(_, info) => {
          // If swiped left by 60px or fast swipe left, close the drawer
          if (info.offset.x < -60 || info.velocity.x < -200) {
            onClose();
          }
        }}
        className={`relative z-10 w-[86vw] max-w-[340px] sm:max-w-[380px] h-full flex flex-col shadow-2xl touch-pan-y transition-colors duration-200 ${
          isDark
            ? 'bg-slate-900 border-r border-slate-800 text-slate-100'
            : 'bg-white border-r border-slate-200 text-slate-800'
        }`}
      >
        {/* Swipe Handle Indicator on right border */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-slate-400/40 pointer-events-none" />

        {/* Hidden File Input for Import */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".svg,.html,.htm,.xml,.json,.md,.css,.txt,.*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Drawer Header */}
        <div
          className={`p-4 border-b flex items-center justify-between shrink-0 pt-safe ${
            isDark ? 'border-slate-800' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shrink-0">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">文件工作区</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                共 {files.length} 个文件 · 支持左滑关闭
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="关闭侧边栏 (也可直接向左滑动)"
            aria-label="关闭侧边栏"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Top Actions: Import Local File + New File */}
        <div
          className={`p-3 border-b space-y-2 shrink-0 ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              title="导入电脑或手机已有代码文件"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>导入本地文件</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenNewModal();
              }}
              className="py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建自定义</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索文件名或后缀..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isDark
                  ? 'bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Scrollable File List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 smooth-scroll">
          <AnimatePresence initial={false}>
            {filteredFiles.map((file) => {
              const isActive = file.id === activeFileId;
              const isEditing = editingId === file.id;
              const byteSize = new Blob([file.content]).size;
              const lineCount = file.content.split('\n').length;

              return (
                <div
                  key={file.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectFile(file.id);
                      onClose();
                    }
                  }}
                  className={`group relative p-3 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                    isActive
                      ? isDark
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/40'
                        : 'bg-indigo-50/90 border-indigo-300 shadow-xs ring-1 ring-indigo-300'
                      : isDark
                      ? 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => saveRename(file, e)}
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        autoFocus
                      />
                      <span className="text-slate-400 text-xs font-bold">.</span>
                      <input
                        type="text"
                        value={editExt}
                        onChange={(e) => setEditExt(e.target.value)}
                        className={`w-16 px-2 py-1.5 rounded-lg text-xs font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-indigo-300'
                            : 'bg-white border-slate-300 text-indigo-700'
                        }`}
                      />
                      <button
                        type="submit"
                        className="p-1.5 bg-indigo-600 rounded-lg text-white text-xs hover:bg-indigo-700"
                        title="保存重命名"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div>
                      {/* Top row: Extension pill + Name + Active indicator */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-md border tracking-wider shrink-0 ${getExtBadgeClass(
                              file.extension
                            )}`}
                          >
                            .{file.extension}
                          </span>
                          <span
                            className={`text-xs font-bold truncate font-mono ${
                              isActive
                                ? isDark
                                  ? 'text-white'
                                  : 'text-indigo-950 font-bold'
                                : isDark
                                ? 'text-slate-200'
                                : 'text-slate-800'
                            }`}
                          >
                            {file.name}
                          </span>
                        </div>

                        {isActive && (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                              isDark
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'bg-indigo-100 text-indigo-700 font-semibold'
                            }`}
                          >
                            当前
                          </span>
                        )}
                      </div>

                      {/* Bottom row: Line count, file size, action buttons */}
                      <div
                        className={`flex items-center justify-between text-xs font-mono pt-1 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{lineCount} 行</span>
                          <span>·</span>
                          <span>{formatBytes(byteSize)}</span>
                        </div>

                        {/* File Action Buttons */}
                        <div
                          className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            title="重命名"
                            onClick={(e) => startRename(file, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark
                                ? 'hover:bg-slate-800 hover:text-white'
                                : 'hover:bg-slate-200 hover:text-slate-900'
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="复制副本"
                            onClick={() => onDuplicateFile(file.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark
                                ? 'hover:bg-slate-800 hover:text-white'
                                : 'hover:bg-slate-200 hover:text-slate-900'
                            }`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="下载单个文件"
                            onClick={() => onDownloadFile(file)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark
                                ? 'hover:bg-slate-800 hover:text-white'
                                : 'hover:bg-slate-200 hover:text-slate-900'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {files.length > 1 && (
                            <button
                              title="删除文件"
                              onClick={() => onDeleteFile(file.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </AnimatePresence>

          {filteredFiles.length === 0 && (
            <div
              className={`text-center py-12 text-xs ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <FileCode className="w-8 h-8 mx-auto mb-2 opacity-40" />
              未找到匹配的文件
            </div>
          )}
        </div>

        {/* Drawer Bottom Safe Area */}
        <div
          className={`p-3 border-t text-center text-xs pb-safe ${
            isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400 bg-slate-50'
          }`}
        >
          <span>向左轻划或点击任意空白处即可退出</span>
        </div>
      </motion.aside>
    </div>
  );
};
