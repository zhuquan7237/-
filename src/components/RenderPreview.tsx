import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Download,
  AlertCircle,
  Smartphone,
  Tablet,
  Monitor,
  Check,
  Palette,
  Terminal,
  Layers,
  ChevronRight,
  ChevronDown,
  Eye,
  FileCode,
} from 'lucide-react';
import { CodeFile, ViewportMode, RenderError } from '../types';
import { convertAndroidVectorToSvg } from '../utils/androidXmlToSvg';

interface RenderPreviewProps {
  file: CodeFile;
  onOpenFullscreen?: () => void;
}

export const RenderPreview: React.FC<RenderPreviewProps> = ({ file }) => {
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

  const lowerExt = file.extension.toLowerCase();
  const isSvg = lowerExt === 'svg' || file.content.trim().startsWith('<svg');
  const isHtml = lowerExt === 'html' || lowerExt === 'htm';
  const isXml = lowerExt === 'xml';
  const isMd = lowerExt === 'md';

  // Check if XML is Android VectorDrawable
  const androidSvgConversion = useMemo(() => {
    if (isXml) {
      return convertAndroidVectorToSvg(file.content);
    }
    return null;
  }, [file.content, isXml]);

  // Error validation for SVG and XML
  const parseValidation = useMemo((): { error: RenderError | null; doc: Document | null } => {
    if (isSvg || isXml) {
      try {
        const parser = new DOMParser();
        const mime = isSvg ? 'image/svg+xml' : 'text/xml';
        const doc = parser.parseFromString(file.content, mime);
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
  }, [file.content, isSvg, isXml]);

  // Extract unique colors from SVG for quick palette inspection
  const extractedColors = useMemo(() => {
    if (!isSvg && !androidSvgConversion) return [];
    const content = isSvg ? file.content : (androidSvgConversion || '');
    const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b|rgba?\([^)]+\)/g;
    const matches = content.match(colorRegex) || [];
    return Array.from(new Set(matches)).slice(0, 10);
  }, [file.content, isSvg, androidSvgConversion]);

  // Handle iframe console intercept
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'rendercraft-console') {
        setConsoleLogs((prev) => [...prev.slice(-30), { type: event.data.type, text: event.data.message }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Prepare iframe HTML with console listener
  const iframeContent = useMemo(() => {
    if (!isHtml) return '';
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

    if (file.content.includes('<head>')) {
      return file.content.replace('<head>', '<head>' + scriptInjection);
    } else if (file.content.includes('<html>')) {
      return file.content.replace('<html>', '<html><head>' + scriptInjection + '</head>');
    }
    return `<!DOCTYPE html><html><head>${scriptInjection}</head><body>${file.content}</body></html>`;
  }, [file.content, isHtml]);

  // Export SVG to PNG
  const handleExportPng = () => {
    const content = isSvg ? file.content : (androidSvgConversion || '');
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
    <div className="flex flex-col h-full bg-slate-950/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-inner backdrop-blur-sm">
      {/* Top Preview Action Header */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left Status info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
            <Eye className="w-3.5 h-3.5" />
            <span>实时渲染引擎</span>
          </div>

          {/* If XML has android vector conversion */}
          {androidSvgConversion && (
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setXmlTab('visual')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  xmlTab === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                矢量渲染
              </button>
              <button
                onClick={() => setXmlTab('tree')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  xmlTab === 'tree' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                XML 节点树
              </button>
            </div>
          )}
        </div>

        {/* Format Specific Controls */}
        <div className="flex items-center gap-1.5">
          {/* Zoom controls for SVG */}
          {(isSvg || (isXml && androidSvgConversion && xmlTab === 'visual')) && (
            <div className="flex items-center gap-1 bg-slate-800/80 px-1 py-0.5 rounded-lg">
              <button
                onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))}
                className="p-1 hover:text-white text-slate-400 cursor-pointer"
                title="缩小"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-300 w-8 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(4, z + 0.2))}
                className="p-1 hover:text-white text-slate-400 cursor-pointer"
                title="放大"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-1 text-[10px] text-slate-400 hover:text-indigo-300 cursor-pointer"
              >
                100%
              </button>
            </div>
          )}

          {/* Background switcher for vector */}
          {(isSvg || (isXml && androidSvgConversion && xmlTab === 'visual')) && (
            <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg">
              <button
                onClick={() => setBgMode('transparent')}
                className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${
                  bgMode === 'transparent' ? 'ring-2 ring-indigo-500' : 'opacity-60'
                }`}
                style={{
                  backgroundImage:
                    'repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%)',
                  backgroundSize: '8px 8px',
                }}
                title="透明棋盘格背景"
              />
              <button
                onClick={() => setBgMode('dark')}
                className={`w-5 h-5 rounded bg-slate-950 border border-slate-700 flex items-center justify-center cursor-pointer ${
                  bgMode === 'dark' ? 'ring-2 ring-indigo-500' : 'opacity-60'
                }`}
                title="深色背景"
              />
              <button
                onClick={() => setBgMode('white')}
                className={`w-5 h-5 rounded bg-white flex items-center justify-center cursor-pointer ${
                  bgMode === 'white' ? 'ring-2 ring-indigo-500' : 'opacity-60'
                }`}
                title="纯白背景"
              />
              <button
                onClick={() => setBgMode('blueprint')}
                className={`w-5 h-5 rounded bg-blue-950 border border-blue-500/50 flex items-center justify-center cursor-pointer ${
                  bgMode === 'blueprint' ? 'ring-2 ring-indigo-500' : 'opacity-60'
                }`}
                title="工程蓝图网格"
              />
            </div>
          )}

          {/* Viewport switcher for HTML */}
          {isHtml && (
            <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg">
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded cursor-pointer ${
                  viewportMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="安卓手机视图 (390px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded cursor-pointer ${
                  viewportMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="平板视图 (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded cursor-pointer ${
                  viewportMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="全宽桌面视图 (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Refresh HTML */}
          {isHtml && (
            <button
              onClick={() => {
                setRefreshKey((k) => k + 1);
                setConsoleLogs([]);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="重新加载渲染"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Console drawer toggle for HTML */}
          {isHtml && (
            <button
              onClick={() => setShowConsole(!showConsole)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] cursor-pointer ${
                showConsole ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>控制台</span>
              {consoleLogs.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-400 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                  {consoleLogs.length}
                </span>
              )}
            </button>
          )}

          {/* Export PNG from SVG */}
          {(isSvg || androidSvgConversion) && (
            <button
              onClick={handleExportPng}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] cursor-pointer"
              title="导出高清 PNG 图片"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">导出 PNG</span>
            </button>
          )}

          {/* Download Original File */}
          <button
            onClick={handleDownloadOriginal}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="下载原始文件"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Parse error warning if any */}
      {parseValidation.error && (
        <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">代码解析提示：</span>
            <div className="font-mono text-[11px] opacity-90 mt-0.5 line-clamp-2">
              {parseValidation.error.message}
            </div>
          </div>
        </div>
      )}

      {/* Main Preview Container */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-auto p-4">
        {/* Render for SVG */}
        {isSvg && (
          <div
            ref={svgContainerRef}
            className={`w-full h-full flex items-center justify-center rounded-xl p-4 transition-all duration-200 overflow-auto ${
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
                    backgroundImage:
                      'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%)',
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
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              dangerouslySetInnerHTML={{ __html: file.content }}
            />
          </div>
        )}

        {/* Render for HTML */}
        {isHtml && (
          <div
            className={`h-full transition-all duration-300 flex items-center justify-center ${
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
        {isXml && (
          <div className="w-full h-full flex flex-col">
            {/* If Android Vector converted to SVG and visual tab active */}
            {androidSvgConversion && xmlTab === 'visual' ? (
              <div
                className={`w-full h-full flex flex-col items-center justify-center rounded-xl p-4 transition-all duration-200 overflow-auto ${
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
                        backgroundImage:
                          'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%)',
                        backgroundSize: '20px 20px',
                      }
                    : {}
                }
              >
                <div className="mb-3 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono border border-indigo-500/30 flex items-center gap-1.5">
                  <span>Android VectorDrawable → SVG 矢量渲染</span>
                </div>
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                  }}
                  dangerouslySetInnerHTML={{ __html: androidSvgConversion }}
                />
              </div>
            ) : (
              /* XML Tree Inspector */
              <div className="w-full h-full p-4 overflow-auto bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed">
                <div className="text-slate-400 text-[11px] mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    XML 节点树形解析器
                  </span>
                  <span>
                    {parseValidation.doc ? '解析正常' : '解析异常'}
                  </span>
                </div>

                {parseValidation.doc ? (
                  <XmlNodeTree node={parseValidation.doc.documentElement} />
                ) : (
                  <pre className="text-slate-300 whitespace-pre-wrap">{file.content}</pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Render for Markdown */}
        {isMd && (
          <div className="w-full h-full p-6 overflow-auto bg-slate-950 rounded-xl border border-slate-800 text-slate-200 prose prose-invert max-w-none text-sm">
            <MarkdownPreview content={file.content} />
          </div>
        )}

        {/* Fallback for other files */}
        {!isSvg && !isHtml && !isXml && !isMd && (
          <div className="w-full h-full p-4 overflow-auto bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
            <pre className="whitespace-pre-wrap">{file.content}</pre>
          </div>
        )}
      </div>

      {/* HTML Console Drawer */}
      {isHtml && showConsole && (
        <div className="h-44 border-t border-slate-800 bg-slate-950 p-3 font-mono text-xs overflow-y-auto">
          <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800 mb-2">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> 控制台输出 ({consoleLogs.length})
            </span>
            <button
              onClick={() => setConsoleLogs([])}
              className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
            >
              清空日志
            </button>
          </div>
          {consoleLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-4">暂无控制台日志输出</div>
          ) : (
            <div className="space-y-1">
              {consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${
                    log.type === 'error'
                      ? 'text-rose-400'
                      : log.type === 'warn'
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-600">[{log.type.toUpperCase()}]</span>
                  <span className="break-all">{log.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Color Palette bar for Vector / SVG */}
      {(isSvg || androidSvgConversion) && extractedColors.length > 0 && (
        <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>颜色拾取：</span>
            <div className="flex items-center gap-1.5">
              {extractedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => copyColor(color)}
                  className="group relative w-4 h-4 rounded-full border border-white/20 cursor-pointer active:scale-90 transition-transform"
                  style={{ backgroundColor: color }}
                  title={`点击复制 ${color}`}
                >
                  {copiedColor === color && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black text-white text-[9px] font-mono whitespace-nowrap z-20">
                      已复制
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {isSvg ? 'SVG 矢量图形' : 'Android VectorDrawable'}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Interactive Collapsible XML Node Tree Component
 */
const XmlNodeTree: React.FC<{ node: Element; depth?: number }> = ({ node, depth = 0 }) => {
  const [collapsed, setCollapsed] = useState(false);
  const children = Array.from(node.children);
  const hasChildren = children.length > 0;
  const attributes = Array.from(node.attributes);
  const textContent = !hasChildren ? node.textContent?.trim() : '';

  return (
    <div style={{ marginLeft: `${depth * 14}px` }} className="my-1">
      <div
        className="flex items-start gap-1.5 py-0.5 px-1.5 rounded hover:bg-slate-900 cursor-pointer transition-colors group"
        onClick={() => hasChildren && setCollapsed(!collapsed)}
      >
        {hasChildren ? (
          <button className="text-slate-500 hover:text-white p-0.5">
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-4 h-4 inline-block" />
        )}

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-indigo-400 font-bold">&lt;{node.tagName}</span>
          {attributes.map((attr) => (
            <span key={attr.name} className="text-slate-400 text-[11px]">
              <span className="text-purple-300">{attr.name}</span>=
              <span className="text-emerald-300">"{attr.value}"</span>
            </span>
          ))}

          {!hasChildren && !textContent ? (
            <span className="text-indigo-400 font-bold">/&gt;</span>
          ) : (
            <span className="text-indigo-400 font-bold">&gt;</span>
          )}

          {textContent && (
            <>
              <span className="text-slate-200 text-xs px-1 bg-slate-800/60 rounded">
                {textContent}
              </span>
              <span className="text-indigo-400 font-bold">&lt;/{node.tagName}&gt;</span>
            </>
          )}
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div className="border-l border-slate-800 ml-2 pl-1">
          {children.map((child, idx) => (
            <XmlNodeTree key={idx} node={child} depth={depth + 1} />
          ))}
          <div style={{ marginLeft: `${(depth + 1) * 14}px` }} className="text-indigo-400 font-bold py-0.5 text-xs">
            &lt;/{node.tagName}&gt;
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Lightweight Zero-Dependency Markdown Renderer
 */
const MarkdownPreview: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-2xl font-bold text-white border-b border-slate-800 pb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-xl font-semibold text-white mt-4">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-lg font-semibold text-indigo-300 mt-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={idx} className="ml-5 text-slate-300 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith('> ')) {
          return <blockquote key={idx} className="border-l-4 border-indigo-500 pl-4 py-1 text-slate-400 italic bg-slate-900/50 rounded-r">{line.slice(2)}</blockquote>;
        }
        if (line.trim() === '') {
          return <div key={idx} className="h-2" />;
        }
        return <p key={idx} className="text-slate-300 leading-relaxed">{line}</p>;
      })}
    </div>
  );
};
