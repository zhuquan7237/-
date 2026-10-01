import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ClipboardPaste, Sparkles, FilePlus2, CheckCircle2, ArrowRight } from 'lucide-react';
import { detectCodeType, formatBytes } from '../utils/codeDetect';
import { CodeFile } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SmartPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: CodeFile | null;
  onApplyToCurrent: (code: string) => void;
  onCreateNewAndOpen: (file: Omit<CodeFile, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const SmartPasteModal: React.FC<SmartPasteModalProps> = ({
  isOpen,
  onClose,
  activeFile,
  onApplyToCurrent,
  onCreateNewAndOpen,
}) => {
  const { isDark } = useTheme();
  const [pastedCode, setPastedCode] = useState('');
  const [clipboardError, setClipboardError] = useState('');

  const detected = detectCodeType(pastedCode);
  const lineCount = pastedCode ? pastedCode.split('\n').length : 0;
  const byteSize = new Blob([pastedCode]).size;

  useEffect(() => {
    if (isOpen) {
      setClipboardError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReadClipboard = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        setClipboardError('浏览器限制直接读取剪贴板，请在文本框内长按或使用 Ctrl+V 粘贴');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        setPastedCode(text);
        setClipboardError('');
      } else {
        setClipboardError('剪贴板中暂无文本内容');
      }
    } catch {
      setClipboardError('未能读取剪贴板权限，请在输入框内长按或使用快捷键直接粘贴');
    }
  };

  const handleCreateNew = () => {
    if (!pastedCode.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    const newName = `ai_${detected.extension}_${timeStr}`;

    onCreateNewAndOpen({
      name: newName,
      extension: detected.extension,
      content: pastedCode,
    });
    setPastedCode('');
    onClose();
  };

  const handleReplaceCurrent = () => {
    if (!pastedCode.trim() || !activeFile) return;
    onApplyToCurrent(pastedCode);
    setPastedCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className={`w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col border transition-colors ${
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
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">AI 代码一键捕获粘贴</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  智能嗅探
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                粘贴 AI 生成的 SVG / HTML / XML，自动匹配格式并秒级预览
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

        {/* Quick action bar */}
        <div className="flex items-center justify-between mt-3 mb-2">
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            在下方输入框粘贴代码：
          </div>
          <button
            type="button"
            onClick={handleReadClipboard}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border active:scale-95 transition-all cursor-pointer ${
              isDark
                ? 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            读取剪贴板
          </button>
        </div>

        {clipboardError && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-300 text-xs">
            {clipboardError}
          </div>
        )}

        {/* Textarea */}
        <div className="flex-1 min-h-[160px] max-h-[250px] relative">
          <textarea
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            placeholder="请在此粘贴 AI 生成的代码（例如 <svg>...</svg> 或 <!DOCTYPE html> 或 <?xml...）"
            className={`w-full h-full p-3.5 rounded-2xl text-xs font-mono resize-none leading-relaxed transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 border ${
              isDark
                ? 'bg-slate-950/80 border-slate-700/80 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
            autoFocus
          />
        </div>

        {/* Real-time Detection Summary */}
        {pastedCode.trim().length > 0 && (
          <div
            className={`mt-3 p-3 rounded-xl border flex items-center justify-between text-xs animate-fadeIn ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>智能检测格式：</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {detected.label} (.{detected.extension})
              </span>
            </div>
            <div
              className={`font-mono text-xs flex items-center gap-2 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>{lineCount} 行</span>
              <span>·</span>
              <span>{formatBytes(byteSize)}</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div
          className={`mt-4 pt-3 border-t flex flex-col sm:flex-row gap-2.5 ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <button
            type="button"
            disabled={!pastedCode.trim()}
            onClick={handleCreateNew}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>新建 .{detected.extension} 并立即渲染</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-80" />
          </button>

          {activeFile && (
            <button
              type="button"
              disabled={!pastedCode.trim()}
              onClick={handleReplaceCurrent}
              className={`py-2.5 px-4 rounded-xl border disabled:opacity-40 disabled:pointer-events-none font-semibold text-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap ${
                isDark
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              替换当前文件 ({activeFile.name}.{activeFile.extension})
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
