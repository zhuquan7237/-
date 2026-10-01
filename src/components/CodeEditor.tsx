import React, { useRef, useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  AlignLeft,
  FileCode2,
} from 'lucide-react';
import { CodeFile } from '../types';
import { formatBytes, formatCode } from '../utils/codeDetect';

interface CodeEditorProps {
  file: CodeFile;
  onChangeContent: (newContent: string) => void;
  onOpenSmartPaste: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  onChangeContent,
  onOpenSmartPaste,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([file.content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const lines = file.content.split('\n');
  const lineCount = lines.length;
  const byteSize = new Blob([file.content]).size;

  // Sync scroll of line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const updateContentWithHistory = (newVal: string) => {
    onChangeContent(newVal);
    // Keep max 30 history states
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newVal);
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle Tab and Indent keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '  ';

      const updated =
        file.content.substring(0, start) + spaces + file.content.substring(end);
      updateContentWithHistory(updated);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleFormat = () => {
    const formatted = formatCode(file.content, file.extension);
    if (formatted !== file.content) {
      updateContentWithHistory(formatted);
    }
  };

  const handleClear = () => {
    if (confirm('确定要清空当前代码内容吗？')) {
      updateContentWithHistory('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (typeof text === 'string') {
        updateContentWithHistory(text);
      }
    };
    reader.readAsText(uploadedFile);
    // Reset file input
    e.target.value = '';
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      onChangeContent(history[newIdx]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/70 border border-slate-800/80 rounded-2xl overflow-hidden shadow-inner backdrop-blur-sm">
      {/* Editor Action Toolbar */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/80 text-indigo-300 font-mono text-[11px]">
            <FileCode2 className="w-3.5 h-3.5" />
            <span>
              {file.name}.{file.extension}
            </span>
          </div>
          <span className="hidden sm:inline text-slate-500 font-mono text-[11px]">
            {lineCount} 行 · {formatBytes(byteSize)}
          </span>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenSmartPaste}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/35 text-indigo-300 font-medium active:scale-95 transition-all cursor-pointer border border-indigo-500/30"
            title="一键粘贴 AI 代码并智能识别"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>粘贴 AI 代码</span>
          </button>

          <button
            type="button"
            onClick={handleFormat}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title="一键美化排版 / 格式化"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">格式化</span>
          </button>

          <button
            type="button"
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
            title="撤销"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title="从本地打开文件"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">打开</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,.html,.htm,.xml,.md,.json,.css,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all cursor-pointer"
            title="复制全部代码"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>复制</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
            title="清空内容"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Canvas Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="select-none py-3 px-2.5 bg-slate-950 text-slate-600 font-mono text-xs text-right border-r border-slate-800/80 overflow-hidden shrink-0 min-w-[3rem]"
          style={{ lineHeight: '1.6rem' }}
        >
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, idx) => (
            <div key={idx} className="tabular-nums">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Text Input Area */}
        <div className="flex-1 relative h-full">
          <textarea
            ref={textareaRef}
            value={file.content}
            onChange={(e) => updateContentWithHistory(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            placeholder="在此处输入或粘贴代码（如 SVG 标签、HTML 页面或 XML 布局）..."
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="w-full h-full py-3 px-3.5 bg-transparent text-slate-100 font-mono text-xs md:text-sm resize-none focus:outline-none leading-[1.6rem] whitespace-pre tab-4 overflow-auto selection:bg-indigo-600/40"
          />

          {file.content.trim() === '' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
              <p className="text-slate-500 text-xs mb-3">代码文件为空</p>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 max-w-xs text-[11px] text-slate-400 space-y-1">
                <p>💡 点击右上角「粘贴 AI 代码」一键导入</p>
                <p>💡 或直接在键盘上按 Ctrl+V 粘贴</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>{file.extension.toUpperCase()} 模式</span>
        </div>
        <div>
          <span>{file.content.length} 字符</span>
        </div>
      </div>
    </div>
  );
};
