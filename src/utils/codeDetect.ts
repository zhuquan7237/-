import { FileType } from '../types';

export function detectCodeType(code: string): { type: FileType; extension: string; label: string } {
  const trimmed = code.trim();

  // Check for SVG
  if (/<svg[\s\S]*?>[\s\S]*?<\/svg>/i.test(trimmed) || trimmed.startsWith('<svg')) {
    return { type: 'svg', extension: 'svg', label: 'SVG 矢量图形' };
  }

  // Check for Android VectorDrawable XML
  if (/<vector[\s\S]*?android:pathData/i.test(trimmed) || /xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android"/i.test(trimmed)) {
    return { type: 'xml', extension: 'xml', label: 'Android Vector XML' };
  }

  // Check for HTML document or snippets
  if (
    /<!doctype\s+html/i.test(trimmed) ||
    /<html[\s\S]*?>/i.test(trimmed) ||
    (/<head|<body|<script|<style|<div|<section|<main/i.test(trimmed) && trimmed.includes('>'))
  ) {
    return { type: 'html', extension: 'html', label: 'HTML 网页代码' };
  }

  // Check for XML declaration or generic XML
  if (trimmed.startsWith('<?xml') || /^<[\w\-:]+(\s+[\w\-:]+="[^"]*")*\s*>[\s\S]*<\/[\w\-:]+>$/i.test(trimmed)) {
    return { type: 'xml', extension: 'xml', label: 'XML 数据/布局' };
  }

  // Check for JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return { type: 'json', extension: 'json', label: 'JSON 数据' };
    } catch {
      // not valid json
    }
  }

  // Check for Markdown
  if (
    trimmed.startsWith('# ') ||
    trimmed.startsWith('## ') ||
    trimmed.includes('\n# ') ||
    trimmed.includes('```') ||
    trimmed.includes('- [ ]')
  ) {
    return { type: 'md', extension: 'md', label: 'Markdown 文档' };
  }

  // Check for CSS
  if (trimmed.includes('{') && trimmed.includes('}') && /(@import|@keyframes|[\.\#\w\-]+\s*\{)/.test(trimmed)) {
    return { type: 'css', extension: 'css', label: 'CSS 样式表' };
  }

  return { type: 'html', extension: 'html', label: '纯文本/HTML' };
}

export function formatCode(code: string, ext: string): string {
  const trimmed = code.trim();
  const lowerExt = ext.toLowerCase();

  if (lowerExt === 'json') {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      return code;
    }
  }

  if (['xml', 'svg', 'html'].includes(lowerExt)) {
    return formatXmlOrHtml(trimmed);
  }

  return code;
}

/**
 * Lightweight, zero-dependency XML/HTML formatter
 */
export function formatXmlOrHtml(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Strip between-tag whitespace to avoid erratic spacing
  const cleanXml = xml.replace(/>\s*</g, '><').trim();

  // Tokenize tags and content
  const tokens = cleanXml.split(/(<[^>]+>)/g).filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith('</')) {
      // Closing tag
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.startsWith('<') && (token.endsWith('/>') || token.startsWith('<?') || token.startsWith('<!'))) {
      // Self-closing or declaration
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.startsWith('<')) {
      // Opening tag
      formatted += tab.repeat(indent) + token + '\n';
      indent++;
    } else {
      // Inner text
      const text = token.trim();
      if (text) {
        formatted += tab.repeat(indent) + text + '\n';
      }
    }
  }

  return formatted.trim();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
