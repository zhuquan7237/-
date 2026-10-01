import React, { useState } from 'react';
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
} from 'lucide-react';
import { CodeFile } from '../types';
import { formatBytes } from '../utils/codeDetect';

interface FileListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onOpenNewModal: () => void;
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
  onDeleteFile,
  onDuplicateFile,
  onRenameFile,
  onDownloadFile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editExt, setEditExt] = useState('');

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

  const getExtBadgeClass = (ext: string) => {
    const lower = ext.toLowerCase();
    if (lower === 'svg') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (lower === 'html') return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    if (lower === 'xml') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (lower === 'md') return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    if (lower === 'json') return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="w-full max-w-sm sm:max-w-md h-full bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">文件工作区</h2>
              <p className="text-[11px] text-slate-400">共 {files.length} 个自定义文件</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & New File Action */}
        <div className="p-3.5 border-b border-slate-800 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenNewModal();
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            新建文件 (自定义后缀)
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索文件名或后缀..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence initial={false}>
            {filteredFiles.map((file) => {
              const isActive = file.id === activeFileId;
              const isEditing = editingId === file.id;
              const byteSize = new Blob([file.content]).size;
              const lineCount = file.content.split('\n').length;

              return (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectFile(file.id);
                      onClose();
                    }
                  }}
                  className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/15 border-indigo-500/80 shadow-md shadow-indigo-950/40'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  {isEditing ? (
                    <form onSubmit={(e) => saveRename(file, e)} className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 bg-slate-900 border border-indigo-500 rounded text-xs text-white font-mono"
                        autoFocus
                      />
                      <span className="text-slate-400 text-xs">.</span>
                      <input
                        type="text"
                        value={editExt}
                        onChange={(e) => setEditExt(e.target.value)}
                        className="w-16 px-1.5 py-1 bg-slate-900 border border-indigo-500 rounded text-xs text-indigo-300 font-mono"
                      />
                      <button
                        type="submit"
                        className="p-1.5 bg-indigo-600 rounded text-white text-xs hover:bg-indigo-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-medium ${getExtBadgeClass(
                              file.extension
                            )}`}
                          >
                            .{file.extension}
                          </span>
                          <span className="text-xs font-semibold text-white truncate font-mono">
                            {file.name}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] text-indigo-400 font-medium px-1.5 py-0.5 rounded bg-indigo-500/10">
                            当前活跃
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <div className="flex items-center gap-2">
                          <span>{lineCount} 行</span>
                          <span>·</span>
                          <span>{formatBytes(byteSize)}</span>
                        </div>

                        {/* Action buttons */}
                        <div
                          className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            title="重命名"
                            onClick={(e) => startRename(file, e)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="复制副本"
                            onClick={() => onDuplicateFile(file.id)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="下载单个文件"
                            onClick={() => onDownloadFile(file)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {files.length > 1 && (
                            <button
                              title="删除文件"
                              onClick={() => onDeleteFile(file.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredFiles.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-xs">
              <FileCode className="w-8 h-8 mx-auto mb-2 opacity-30" />
              未找到匹配的文件
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
