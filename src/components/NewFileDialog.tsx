import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, FileCode, Sparkles, Check, Plus } from 'lucide-react';
import { CodeFile } from '../types';
import { INITIAL_FILES } from '../utils/templates';
import { useTheme } from '../context/ThemeContext';

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
  const { isDark } = useTheme();
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
      if (cleanExt === 'svg') {
        content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">\n  <circle cx="50" cy="50" r="40" fill="#4f46e5" />\n</svg>`;
      } else if (cleanExt === 'html') {
        content = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>New HTML</title>\n</head>\n<body style="font-family:system-ui, sans-serif; padding:24px;">\n  <h1>Hello World</h1>\n  <p>在编辑窗口输入或粘贴代码即可实时预览</p>\n</body>\n</html>`;
      } else if (cleanExt === 'xml') {
        content = `<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android"\n  android:width="48dp"\n  android:height="48dp"\n  android:viewportWidth="24"\n  android:viewportHeight="24">\n  <path android:fillColor="#4F46E5" android:pathData="M12,2L2,22h20L12,2z"/>\n</vector>`;
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className={`w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto border transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-3.5 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">新建代码文件</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                支持任意自定义后缀名与初始预设
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-950'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File Name & Extension Input */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              文件名与自定义后缀名
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="例如: brand_icon 或 home_view"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 border transition-all ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-700/80 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  autoFocus
                />
              </div>
              <div className="w-28 relative">
                <span className="absolute left-2.5 top-2.5 text-slate-400 text-sm font-mono pointer-events-none">
                  .
                </span>
                <input
                  type="text"
                  value={extension}
                  onChange={(e) => setExtension(e.target.value.replace(/^\./, ''))}
                  placeholder="后缀"
                  className={`w-full pl-6 pr-2.5 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 border transition-all ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-700/80 text-indigo-300'
                      : 'bg-slate-50 border-slate-200 text-indigo-700'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Quick Extension Selector */}
          <div>
            <div className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              常用格式快捷标签：
            </div>
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
                        ? isDark
                          ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                        : isDark
                        ? 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-[10px] opacity-70 font-sans">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <div className="text-xs mb-2 flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>初始代码预设：</span>
              <span className="text-xs text-indigo-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 可选模板体验
              </span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 smooth-scroll">
              <div
                onClick={() => setSelectedTemplate('blank')}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedTemplate === 'blank'
                    ? isDark
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : isDark
                    ? 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold">空白文件 (自定代码)</span>
                </div>
                {selectedTemplate === 'blank' && <Check className="w-4 h-4 text-indigo-500" />}
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
                      ? isDark
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-indigo-50 border-indigo-300 text-indigo-900'
                      : isDark
                      ? 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                        isDark ? 'bg-slate-800 text-indigo-300' : 'bg-slate-200 text-indigo-700'
                      }`}
                    >
                      .{tmpl.extension}
                    </span>
                    <span className="text-xs truncate font-medium">{tmpl.name}</span>
                  </div>
                  {selectedTemplate === tmpl.id && <Check className="w-4 h-4 text-indigo-500 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 text-xs font-semibold shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
