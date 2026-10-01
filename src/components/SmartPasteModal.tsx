import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ClipboardPaste, Sparkles, FilePlus2, CheckCircle2, ArrowRight } from 'lucide-react';
import { detectCodeType, formatBytes } from '../utils/codeDetect';
import { CodeFile } from '../types';

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
  const [pastedCode, setPastedCode] = useState('');
  const [clipboardError, setClipboardError] = useState('');

  // Auto detect format whenever pastedCode changes
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
        setClipboardError('浏览器限制直接读取剪贴板，请直接在下方文本框使用 Ctrl+V 或长按粘贴');
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
      setClipboardError('未能自动读取剪贴板权限，请在文本框内直接粘贴 (Ctrl+V / 长按)');
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full sm:max-w-xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">AI 代码一键捕获粘贴</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  智能识别
                </span>
              </div>
              <p className="text-xs text-slate-400">
                粘贴 AI 输出的 SVG / HTML / XML，自动识别并立即渲染
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick action bar */}
        <div className="flex items-center justify-between mt-3 mb-2">
          <div className="text-xs text-slate-400">在下方输入或粘贴代码：</div>
          <button
            type="button"
            onClick={handleReadClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            读取系统剪贴板
          </button>
        </div>

        {clipboardError && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            {clipboardError}
          </div>
        )}

        {/* Textarea */}
        <div className="flex-1 min-h-[160px] max-h-[260px] relative">
          <textarea
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            placeholder="请在此粘贴 AI 输出的代码（如 <svg>...</svg> 或 <!DOCTYPE html> 或 <?xml...）"
            className="w-full h-full p-3.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono resize-none leading-relaxed transition-all"
            autoFocus
          />
        </div>

        {/* Real-time Detection Summary */}
        {pastedCode.trim().length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">智能识别类型：</span>
              <span className="font-semibold text-indigo-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {detected.label} (.{detected.extension})
              </span>
            </div>
            <div className="text-slate-400 font-mono text-[11px] flex items-center gap-2">
              <span>{lineCount} 行</span>
              <span>·</span>
              <span>{formatBytes(byteSize)}</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-4 pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            disabled={!pastedCode.trim()}
            onClick={handleCreateNew}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 disabled:opacity-40 disabled:pointer-events-none text-white font-medium text-xs shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>自动新建 .{detected.extension} 并立即渲染</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-80" />
          </button>

          {activeFile && (
            <button
              type="button"
              disabled={!pastedCode.trim()}
              onClick={handleReplaceCurrent}
              className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300 font-medium text-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              覆盖到当前文件 ({activeFile.name}.{activeFile.extension})
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
