import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Download,
  AlertCircle,
  Smartphone,
  Tablet,
  Monitor,
  Palette,
  Terminal,
  Layers,
  ChevronRight,
  ChevronDown,
  Eye,
  ClipboardPaste,
  FileCode2,
} from 'lucide-react';
import { CodeFile, ViewportMode, RenderError } from '../types';
import { convertAndroidVectorToSvg } from '../utils/androidXmlToSvg';
import { cleanPastedCode } from '../utils/codeDetect';
import { useTheme } from '../context/ThemeContext';

interface RenderPreviewProps {
  file: CodeFile;
  onOpenSmartPaste?: () => void;
}

export const RenderPreview: React.FC<RenderPreviewProps> = ({ file, onOpenSmartPaste }) => {
  const { isDark } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [bgMode, setBgMode] = useState<'transparent' | 'dark' | 'white' | 'blueprint'>('transparent');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: 'log' | 'warn' | 'error'; text: string }>>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [xmlTab, setXmlTab] = useState<'visual' | 'tree'>('visual');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Clean code and detect type robustly
  const rawContent = file.content || '';
  const cleanedContent = useMemo(() => cleanPastedCode(rawContent), [rawContent]);
  const isEmpty = cleanedContent.trim().length === 0;

  const lowerExt = file.extension.toLowerCase();
  const hasSvgTag = /<svg[\s\S]*?>/i.test(cleanedContent);
  const isSvg = lowerExt === 'svg' || hasSvgTag;
  const isAndroidVector = /<vector[\s\S]*?android:pathData/i.test(cleanedContent) || /xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android"/i.test(cleanedContent);
  const isXml = lowerExt === 'xml' || isAndroidVector;
  const isHtml = (lowerExt === 'html' || lowerExt === 'htm' || /<!doctype\s+html|<html[\s\S]*?>/i.test(cleanedContent)) && !hasSvgTag;
  const isMd = lowerExt === 'md';

  // Android Vector conversion
  const androidSvgConversion = useMemo(() => {
    if (isXml || isAndroidVector) {
      return convertAndroidVectorToSvg(cleanedContent);
    }
    return null;
  }, [cleanedContent, isXml, isAndroidVector]);

  // Extract clean SVG HTML
  const svgRenderHtml = useMemo(() => {
    if (!isSvg) return '';
    const match = cleanedContent.match(/<svg[\s\S]*?<\/svg>/i);
    if (match) return match[0];
    return cleanedContent.replace(/^<\?xml[^>]*\?>/i, '').trim();
  }, [cleanedContent, isSvg]);

  // Error validation
  const parseValidation = useMemo((): { error: RenderError | null; doc: Document | null } => {
    if ((isSvg || isXml) && !isEmpty) {
      try {
        const parser = new DOMParser();
        const mime = isSvg ? 'image/svg+xml' : 'text/xml';
        const doc = parser.parseFromString(cleanedContent, mime);
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
          return {
            error: { message: parserError.textContent || 'XML/SVG 语法解析异常' },
            doc: null,
          };
        }
        return { error: null, doc };
      } catch (err: unknown) {
        return { error: { message: (err as Error)?.message || '解析错误' }, doc: null };
      }
    }
    return { error: null, doc: null };
  }, [cleanedContent, isSvg, isXml, isEmpty]);

  // Extract unique colors
  const extractedColors = useMemo(() => {
    if (!isSvg && !androidSvgConversion) return [];
    const content = isSvg ? svgRenderHtml : (androidSvgConversion || '');
    const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b|rgba?\([^)]+\)/g;
    const matches = content.match(colorRegex) || [];
    return Array.from(new Set(matches)).slice(0, 10);
  }, [svgRenderHtml, isSvg, androidSvgConversion]);

  // Iframe console message intercept
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'rendercraft-console') {
        setConsoleLogs((prev) => [...prev.slice(-30), { type: event.data.type, text: event.data.message }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Prepare iframe HTML
  const iframeContent = useMemo(() => {
    if (!isHtml || isEmpty) return '';
    const scriptInjection = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          function send(type, args) {
            try {
              const msg = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
              window.parent.postMessage({ source: 'rendercraft-console', type: type, message: msg }, '*');
            } catch(e) {}
          }
          console.log = function() { originalLog.apply(console, arguments); send('log', arguments); };
          console.warn = function() { originalWarn.apply(console, arguments); send('warn', arguments); };
          console.error = function() { originalError.apply(console, arguments); send('error', arguments); };
          window.onerror = function(msg, url, line) {
            send('error', ['[Runtime Error Line ' + line + ']: ' + msg]);
          };
        })();
      </script>
    `;

    if (cleanedContent.includes('<head>')) {
      return cleanedContent.replace('<head>', '<head>' + scriptInjection);
    } else if (cleanedContent.includes('<html>')) {
      return cleanedContent.replace('<html>', '<html><head>' + scriptInjection + '</head>');
    }
    return `<!DOCTYPE html><html><head>${scriptInjection}</head><body>${cleanedContent}</body></html>`;
  }, [cleanedContent, isHtml, isEmpty]);

  // Export SVG to PNG
  const handleExportPng = () => {
    const content = isSvg ? svgRenderHtml : (androidSvgConversion || '');
    if (!content) return;

    try {
      const svgBlob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = (img.width || 400) * 2;
        canvas.height = (img.height || 400) * 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(blobURL);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const dl = document.createElement('a');
          dl.download = `${file.name}.png`;
          dl.href = URL.createObjectURL(blob);
          dl.click();
        });
      };
      img.src = blobURL;
    } catch (err) {
      console.error('PNG export failed', err);
    }
  };

  const handleDownloadOriginal = () => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const dl = document.createElement('a');
    dl.download = `${file.name}.${file.extension}`;
    dl.href = URL.createObjectURL(blob);
    dl.click();
  };

  const copyColor = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopiedColor(c);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div
      className={`flex flex-col w-full h-full min-h-0 flex-1 rounded-2xl sm:rounded-3xl border overflow-hidden shadow-sm transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Top Preview Action Header */}
      <div
        className={`px-3 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs select-none shrink-0 ${
          isDark
            ? 'bg-slate-900 border-slate-800/80 text-slate-300'
            : 'bg-slate-50 border-slate-200/90 text-slate-700'
        }`}
      >
        {/* Left Status info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/25">
            <Eye className="w-3.5 h-3.5" />
            <span>实时渲染</span>
          </div>

          {/* XML vector switcher */}
          {androidSvgConversion && (
            <div
              className={`flex items-center gap-1 p-0.5 rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200/80 border-slate-300'
              }`}
            >
              <button
                onClick={() => setXmlTab('visual')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  xmlTab === 'visual'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                矢量图形
              </button>
              <button
                onClick={() => setXmlTab('tree')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  xmlTab === 'tree'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                节点树
              </button>
            </div>
          )}
        </div>

        {/* Format Specific Controls */}
        <div className="flex items-center gap-1.5">
          {/* Zoom controls for SVG */}
          {(isSvg || (isXml && androidSvgConversion && xmlTab === 'visual')) && !isEmpty && (
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-xl border ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.2).toFixed(1))))}
                className="p-1 hover:text-indigo-500 cursor-pointer"
                title="缩小"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-medium w-9 text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(4, Number((z + 0.2).toFixed(1))))}
                className="p-1 hover:text-indigo-500 cursor-pointer"
                title="放大"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-1 text-xs font-medium text-slate-400 hover:text-indigo-500 cursor-pointer"
                title="重置缩放"
              >
                1:1
              </button>
            </div>
          )}

          {/* Background switcher for vector */}
          {(isSvg || (isXml && androidSvgConversion && xmlTab === 'visual')) && !isEmpty && (
            <div
              className={`flex items-center gap-1 p-0.5 rounded-xl border ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setBgMode('transparent')}
                className={`w-5 h-5 rounded-lg flex items-center justify-center cursor-pointer ${
                  bgMode === 'transparent' ? 'ring-2 ring-indigo-500' : 'opacity-60'
                }`}
                style={{
                  backgroundImage:
                    'repeating-conic-gradient(#64748b 0% 25%, #94a3b8 0% 50%)',
                  backgroundSize: '6px 6px',
                }}
                title="透明棋盘格背景"
              />
              <button
                onClick={() => setBgMode('white')}
                className={`w-5 h-5 rounded-lg bg-white border border-slate-300 flex items-center justify-center cursor-pointer ${
                  bgMode === 'white' ? 'ring-2 ring-indigo-500' : 'opacity-60'
                }`}
                title="纯白背景"
              />
              <button
                onClick={() => setBgMode('dark')}
                className={`w-5 h-5 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center cursor-pointer ${
                  bgMode === 'dark' ? 'ring-2 ring-indigo-500' : 'opacity-60'
                }`}
                title="暗黑深色背景"
              />
              <button
                onClick={() => setBgMode('blueprint')}
                className={`w-5 h-5 rounded-lg bg-blue-900 border border-blue-400/50 flex items-center justify-center cursor-pointer ${
                  bgMode === 'blueprint' ? 'ring-2 ring-indigo-500' : 'opacity-60'
                }`}
                title="工程蓝图网格"
              />
            </div>
          )}

          {/* Viewport switcher for HTML */}
          {isHtml && !isEmpty && (
            <div
              className={`flex items-center gap-1 p-0.5 rounded-xl border ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewportMode === 'mobile'
                    ? 'bg-indigo-600 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="手机视图"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewportMode === 'tablet'
                    ? 'bg-indigo-600 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="平板视图"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewportMode === 'desktop'
                    ? 'bg-indigo-600 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="桌面视图"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Refresh HTML */}
          {isHtml && !isEmpty && (
            <button
              onClick={() => {
                setRefreshKey((k) => k + 1);
                setConsoleLogs([]);
              }}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer active:scale-95 ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="重新加载渲染"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Export PNG from SVG */}
          {(isSvg || androidSvgConversion) && !isEmpty && (
            <button
              onClick={handleExportPng}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              title="导出高清 PNG 图片"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">导出 PNG</span>
            </button>
          )}

          {/* Download Original File */}
          <button
            onClick={handleDownloadOriginal}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer active:scale-95 ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="下载原始代码文件"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Parse error warning if any */}
      {parseValidation.error && !isEmpty && (
        <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-500 dark:text-rose-300 flex items-start gap-2.5 text-xs shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">代码格式提示：</span>
            <div className="font-mono text-xs opacity-90 mt-0.5 line-clamp-2">
              {parseValidation.error.message}
            </div>
          </div>
        </div>
      )}

      {/* Main Preview Workspace */}
      <div
        className={`flex-1 min-h-0 w-full relative flex flex-col items-center justify-center overflow-auto p-3 sm:p-4 transition-colors smooth-scroll ${
          isDark ? 'bg-slate-950/60' : 'bg-slate-100/60'
        }`}
      >
        {/* Empty Content State */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-3">
              <FileCode2 className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
              当前文件代码为空
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              您可以在代码编辑区输入代码，或直接一键粘贴来自 AI、设计稿的 SVG / HTML / XML
            </p>
            {onOpenSmartPaste && (
              <button
                onClick={onOpenSmartPaste}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>一键粘贴代码并渲染</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Render for SVG */}
            {isSvg && (
              <div
                ref={svgContainerRef}
                className={`w-full h-full min-h-0 flex-1 flex items-center justify-center rounded-2xl p-4 transition-all duration-200 overflow-auto border ${
                  isDark ? 'border-slate-800/60' : 'border-slate-200/80 shadow-xs'
                } ${
                  bgMode === 'transparent'
                    ? 'bg-transparent'
                    : bgMode === 'dark'
                    ? 'bg-slate-950'
                    : bgMode === 'white'
                    ? 'bg-white'
                    : 'bg-[#0a1628]'
                }`}
                style={
                  bgMode === 'transparent'
                    ? {
                        backgroundImage: isDark
                          ? 'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%)'
                          : 'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)',
                        backgroundSize: '20px 20px',
                      }
                    : bgMode === 'blueprint'
                    ? {
                        backgroundImage:
                          'linear-gradient(to right, rgba(59, 130, 246, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.15) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }
                    : {}
                }
              >
                <div
                  className="gpu-layer"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  dangerouslySetInnerHTML={{ __html: svgRenderHtml }}
                />
              </div>
            )}

            {/* Render for HTML */}
            {isHtml && (
              <div
                className={`h-full min-h-0 flex-1 transition-all duration-200 flex items-center justify-center gpu-layer ${
                  viewportMode === 'mobile'
                    ? 'w-[390px] border-4 border-slate-700 rounded-3xl overflow-hidden shadow-2xl bg-black'
                    : viewportMode === 'tablet'
                    ? 'w-[768px] border-4 border-slate-700 rounded-2xl overflow-hidden shadow-2xl bg-black'
                    : 'w-full'
                }`}
              >
                <iframe
                  key={refreshKey}
                  ref={iframeRef}
                  srcDoc={iframeContent}
                  title="HTML Live Render"
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            )}

            {/* Render for XML */}
            {isXml && !isSvg && (
              <div className="w-full h-full min-h-0 flex-1 flex flex-col">
                {androidSvgConversion && xmlTab === 'visual' ? (
                  <div
                    className={`w-full h-full min-h-0 flex-1 flex flex-col items-center justify-center rounded-2xl p-4 transition-all duration-200 overflow-auto border ${
                      isDark ? 'border-slate-800' : 'border-slate-200 bg-white'
                    } ${
                      bgMode === 'transparent'
                        ? 'bg-transparent'
                        : bgMode === 'dark'
                        ? 'bg-slate-950'
                        : bgMode === 'white'
                        ? 'bg-white'
                        : 'bg-[#0a1628]'
                    }`}
                    style={
                      bgMode === 'transparent'
                        ? {
                            backgroundImage: isDark
                              ? 'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%)'
                              : 'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)',
                            backgroundSize: '20px 20px',
                          }
                        : {}
                    }
                  >
                    <div
                      className={`mb-3 px-3 py-1 rounded-full text-xs font-mono border flex items-center gap-1.5 ${
                        isDark
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      <span>Android VectorDrawable → SVG 渲染</span>
                    </div>
                    <div
                      className="gpu-layer"
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      dangerouslySetInnerHTML={{ __html: androidSvgConversion }}
                    />
                  </div>
                ) : (
                  <div
                    className={`w-full h-full min-h-0 flex-1 p-4 overflow-auto rounded-2xl border font-mono text-xs leading-relaxed smooth-scroll ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div
                      className={`text-xs mb-3 pb-2 border-b flex items-center justify-between ${
                        isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        XML 节点树形解析器
                      </span>
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded ${
                          parseValidation.doc
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {parseValidation.doc ? '解析正常' : '解析异常'}
                      </span>
                    </div>

                    {parseValidation.doc ? (
                      <XmlNodeTree node={parseValidation.doc.documentElement} isDark={isDark} />
                    ) : (
                      <pre className="whitespace-pre-wrap">{file.content}</pre>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Render for Markdown */}
            {isMd && (
              <div
                className={`w-full h-full min-h-0 flex-1 p-6 overflow-auto rounded-2xl border text-sm smooth-scroll ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <MarkdownPreview content={cleanedContent} isDark={isDark} />
              </div>
            )}

            {/* Fallback for other files */}
            {!isSvg && !isHtml && !isXml && !isMd && (
              <div
                className={`w-full h-full min-h-0 flex-1 p-4 overflow-auto rounded-2xl border font-mono text-xs smooth-scroll ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <pre className="whitespace-pre-wrap">{cleanedContent}</pre>
              </div>
            )}
          </>
        )}
      </div>

      {/* HTML Console Drawer */}
      {isHtml && showConsole && !isEmpty && (
        <div
          className={`h-40 border-t p-3 font-mono text-xs overflow-y-auto smooth-scroll shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-1.5 border-b mb-2 ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Terminal className="w-3.5 h-3.5 text-indigo-500" /> 控制台输出 ({consoleLogs.length})
            </span>
            <button
              onClick={() => setConsoleLogs([])}
              className="text-xs text-slate-400 hover:text-indigo-500 cursor-pointer"
            >
              清空日志
            </button>
          </div>
          {consoleLogs.length === 0 ? (
            <div className="text-slate-400 text-center py-4">暂无控制台输出</div>
          ) : (
            <div className="space-y-1">
              {consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${
                    log.type === 'error'
                      ? 'text-rose-500'
                      : log.type === 'warn'
                      ? 'text-amber-500'
                      : isDark
                      ? 'text-slate-300'
                      : 'text-slate-700'
                  }`}
                >
                  <span className="text-[10px] text-slate-400">[{log.type.toUpperCase()}]</span>
                  <span className="break-all">{log.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Color Palette bar for Vector / SVG */}
      {(isSvg || androidSvgConversion) && extractedColors.length > 0 && !isEmpty && (
        <div
          className={`px-3 py-1.5 border-t flex items-center justify-between text-xs select-none shrink-0 ${
            isDark
              ? 'bg-slate-900 border-slate-800/80 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-medium">色彩拾取：</span>
            <div className="flex items-center gap-1.5">
              {extractedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => copyColor(color)}
                  className="group relative w-4.5 h-4.5 rounded-full border border-black/20 dark:border-white/20 cursor-pointer active:scale-90 transition-transform shadow-xs"
                  style={{ backgroundColor: color }}
                  title={`点击复制 ${color}`}
                >
                  {copiedColor === color && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black text-white text-[10px] font-mono whitespace-nowrap z-20">
                      已复制
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs font-mono opacity-70">
            {isSvg ? 'SVG 矢量' : 'VectorDrawable'}
          </span>
        </div>
      )}
    </div>
  );
};

const XmlNodeTree: React.FC<{ node: Element; depth?: number; isDark?: boolean }> = ({
  node,
  depth = 0,
  isDark = true,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const children = Array.from(node.children);
  const hasChildren = children.length > 0;
  const attributes = Array.from(node.attributes);
  const textContent = !hasChildren ? node.textContent?.trim() : '';

  return (
    <div style={{ marginLeft: `${depth * 14}px` }} className="my-1">
      <div
        className={`flex items-start gap-1.5 py-0.5 px-1.5 rounded cursor-pointer transition-colors group ${
          isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-100'
        }`}
        onClick={() => hasChildren && setCollapsed(!collapsed)}
      >
        {hasChildren ? (
          <button className="text-slate-400 hover:text-indigo-500 p-0.5">
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-4 h-4 inline-block" />
        )}

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-indigo-500 font-bold">&lt;{node.tagName}</span>
          {attributes.map((attr) => (
            <span key={attr.name} className="text-xs">
              <span className={isDark ? 'text-purple-300' : 'text-purple-700'}>{attr.name}</span>=
              <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>"{attr.value}"</span>
            </span>
          ))}

          {!hasChildren && !textContent ? (
            <span className="text-indigo-500 font-bold">/&gt;</span>
          ) : (
            <span className="text-indigo-500 font-bold">&gt;</span>
          )}

          {textContent && (
            <>
              <span
                className={`text-xs px-1 rounded ${
                  isDark ? 'text-slate-200 bg-slate-800/80' : 'text-slate-800 bg-slate-200/80'
                }`}
              >
                {textContent}
              </span>
              <span className="text-indigo-500 font-bold">&lt;/{node.tagName}&gt;</span>
            </>
          )}
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div className={`border-l ml-2 pl-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {children.map((child, idx) => (
            <XmlNodeTree key={idx} node={child} depth={depth + 1} isDark={isDark} />
          ))}
          <div
            style={{ marginLeft: `${(depth + 1) * 14}px` }}
            className="text-indigo-500 font-bold py-0.5 text-xs"
          >
            &lt;/{node.tagName}&gt;
          </div>
        </div>
      )}
    </div>
  );
};

const MarkdownPreview: React.FC<{ content: string; isDark?: boolean }> = ({
  content,
  isDark = true,
}) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        if (line.startsWith('# ')) {
          return (
            <h1
              key={idx}
              className={`text-2xl font-bold border-b pb-2 ${
                isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
              }`}
            >
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className={`text-xl font-semibold mt-4 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-lg font-semibold mt-2 text-indigo-500">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li
              key={idx}
              className={`ml-5 list-disc ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              {line.slice(2)}
            </li>
          );
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className={`border-l-4 border-indigo-500 pl-4 py-1 italic rounded-r ${
                isDark
                  ? 'text-slate-400 bg-slate-900/50'
                  : 'text-slate-600 bg-slate-100/80'
              }`}
            >
              {line.slice(2)}
            </blockquote>
          );
        }
        if (line.trim() === '') {
          return <div key={idx} className="h-2" />;
        }
        return (
          <p
            key={idx}
            className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
};
