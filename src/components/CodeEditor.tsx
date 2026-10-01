import React, { useRef, useState, useEffect } from 'react';
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
import { useTheme } from '../context/ThemeContext';

interface CodeEditorProps {
  file: CodeFile;
  onChangeContent: (newContent: string) => void;
  onOpenSmartPaste: () => void;
  onImportFiles?: (files: FileList) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  onChangeContent,
  onOpenSmartPaste,
  onImportFiles,
}) => {
  const { isDark } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([file.content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const lines = file.content.split('\n');
  const lineCount = lines.length;
  const byteSize = new Blob([file.content]).size;

  // Reset history on active file change
  useEffect(() => {
    setHistory([file.content]);
    setHistoryIndex(0);
  }, [file.id]);

  // High-performance RAF scroll sync between textarea and line numbers
  const rafId = useRef<number | null>(null);
  const handleScroll = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (textareaRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    });
  };

  const updateContentWithHistory = (newVal: string) => {
    onChangeContent(newVal);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newVal);
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Tab key indent handling
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

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
    if (file.content && confirm('确定要清空当前代码内容吗？')) {
      updateContentWithHistory('');
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      onChangeContent(history[nextIndex]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onImportFiles) {
        onImportFiles(e.target.files);
      } else {
        const selected = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text !== undefined) {
            updateContentWithHistory(text);
          }
        };
        reader.readAsText(selected);
      }
      e.target.value = '';
    }
  };

  return (
    <div
      className={`w-full h-full rounded-2xl sm:rounded-3xl border flex flex-col overflow-hidden shadow-sm transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Editor Sub-Header Toolbar: Single-Line, Never Wraps */}
      <div
        className={`h-11 px-3 border-b flex items-center justify-between gap-2 select-none shrink-0 overflow-x-auto whitespace-nowrap ${
          isDark
            ? 'bg-slate-900 border-slate-800/80 text-slate-300'
            : 'bg-slate-50 border-slate-200/90 text-slate-700'
        }`}
      >
        {/* Left: File metadata */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <FileCode2 className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold">{lineCount} 行</span>
          <span className="text-slate-400">·</span>
          <span>{formatBytes(byteSize)}</span>
          <span className="text-slate-400 hidden sm:inline">·</span>
          <span className="hidden sm:inline uppercase text-indigo-500 font-bold">
            {file.extension}
          </span>
        </div>

        {/* Right: Quick actions toolbar */}
        <div className="flex items-center gap-1">
          {/* Smart Paste AI Code */}
          <button
            type="button"
            onClick={onOpenSmartPaste}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-all cursor-pointer ${
              isDark
                ? 'bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
            title="一键粘贴 AI 代码并智能识别"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden xs:inline">粘贴 AI 代码</span>
          </button>

          {/* Format Code */}
          <button
            type="button"
            onClick={handleFormat}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-all cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="一键格式化排版代码"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">格式化</span>
          </button>

          {/* Undo */}
          <button
            type="button"
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            className={`p-1.5 rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-30 ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="撤销 (Undo)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Open Local File */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-all cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="从本地打开替换当前代码"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">导入</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,.html,.htm,.xml,.md,.json,.css,.txt"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
            title="复制代码"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>复制</span>
              </>
            )}
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
            title="清空代码"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Canvas Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Line Numbers Sidebar */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className={`select-none py-3 px-2 font-mono text-xs text-right overflow-hidden shrink-0 min-w-[2.8rem] sm:min-w-[3.2rem] border-r transition-colors ${
            isDark
              ? 'bg-slate-950/80 text-slate-600 border-slate-800/80'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}
          style={{ lineHeight: '1.65rem' }}
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
            placeholder="在此处输入或粘贴代码（如 SVG 标签、HTML 网页或 XML 布局代码）..."
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className={`w-full h-full p-3 font-mono text-sm leading-[1.65rem] border-none resize-none focus:outline-none overflow-auto tab-4 smooth-scroll ${
              isDark
                ? 'bg-slate-950 text-slate-100 placeholder-slate-600'
                : 'bg-white text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
