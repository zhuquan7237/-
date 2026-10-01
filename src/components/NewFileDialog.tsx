import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, FileCode, Sparkles, Check, Plus } from 'lucide-react';
import { CodeFile } from '../types';
import { INITIAL_FILES } from '../utils/templates';

interface NewFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (file: Omit<CodeFile, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const COMMON_EXTENSIONS = [
  { ext: 'svg', label: '.svg', desc: '矢量图形' },
  { ext: 'html', label: '.html', desc: '网页代码' },
  { ext: 'xml', label: '.xml', desc: 'XML/安卓矢量' },
  { ext: 'md', label: '.md', desc: 'Markdown' },
  { ext: 'json', label: '.json', desc: 'JSON' },
  { ext: 'css', label: '.css', desc: '样式表' },
];

export const NewFileDialog: React.FC<NewFileDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [fileName, setFileName] = useState('');
  const [extension, setExtension] = useState('svg');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fileName.trim() || `snippet_${Date.now().toString().slice(-4)}`;
    const cleanExt = extension.replace(/^\./, '').trim().toLowerCase() || 'html';

    let content = '';
    if (selectedTemplate !== 'blank') {
      const tmpl = INITIAL_FILES.find((f) => f.id === selectedTemplate);
      if (tmpl) {
        content = tmpl.content;
      }
    } else {
      // Default blank templates by extension
      if (cleanExt === 'svg') {
        content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">\n  <circle cx="50" cy="50" r="40" fill="#6366f1" />\n</svg>`;
      } else if (cleanExt === 'html') {
        content = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>New HTML</title>\n</head>\n<body style="background:#0f172a; color:#fff; font-family:sans-serif; padding:20px;">\n  <h1>Hello World</h1>\n  <p>在编辑窗口输入或粘贴代码即可实时预览</p>\n</body>\n</html>`;
      } else if (cleanExt === 'xml') {
        content = `<?xml version="1.0" encoding="utf-8"?>\n<root>\n  <item id="1">示例数据</item>\n</root>`;
      }
    }

    onCreate({
      name: cleanName,
      extension: cleanExt,
      content,
    });

    setFileName('');
    setSelectedTemplate('blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">新建代码文件</h3>
              <p className="text-xs text-slate-400">支持自定义任意后缀名与初始模板</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* File Name & Extension Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              文件名与自定义后缀名
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="例如: cyber_icon 或 activity_main"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  autoFocus
                />
              </div>
              <div className="w-28 relative">
                <span className="absolute left-2.5 top-2.5 text-slate-400 text-sm font-mono pointer-events-none">.</span>
                <input
                  type="text"
                  value={extension}
                  onChange={(e) => setExtension(e.target.value.replace(/^\./, ''))}
                  placeholder="后缀"
                  className="w-full pl-6 pr-2.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-indigo-300 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quick Extension Selector */}
          <div>
            <div className="text-xs text-slate-400 mb-2">常用后缀快捷选择：</div>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_EXTENSIONS.map((item) => {
                const isSelected = extension.toLowerCase() === item.ext;
                return (
                  <button
                    key={item.ext}
                    type="button"
                    onClick={() => setExtension(item.ext)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-[10px] text-slate-500 font-sans">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
              <span>初始内容预设：</span>
              <span className="text-[11px] text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 可选模板快速体验
              </span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <div
                onClick={() => setSelectedTemplate('blank')}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedTemplate === 'blank'
                    ? 'bg-indigo-600/15 border-indigo-500/80 text-white'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium">空白文件 (由我自己输入或粘贴)</span>
                </div>
                {selectedTemplate === 'blank' && <Check className="w-4 h-4 text-indigo-400" />}
              </div>

              {INITIAL_FILES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setSelectedTemplate(tmpl.id);
                    setExtension(tmpl.extension);
                    if (!fileName) setFileName(tmpl.name);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedTemplate === tmpl.id
                      ? 'bg-indigo-600/15 border-indigo-500/80 text-white'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono uppercase">
                      .{tmpl.extension}
                    </span>
                    <span className="text-xs truncate">{tmpl.name}</span>
                  </div>
                  {selectedTemplate === tmpl.id && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 text-xs font-medium shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              创建并打开
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
