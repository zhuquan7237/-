import { FileType } from '../types';

/**
 * Strips leading/trailing Markdown code blocks (e.g. ```xml ... ``` or ```html ... ```)
 * often produced by AI tools like ChatGPT, Claude, and Gemini.
 */
export function cleanPastedCode(rawCode: string): string {
  let cleaned = rawCode.trim();

  // Strip markdown triple backtick fences if wrapped
  const codeBlockMatch = cleaned.match(/^```(?:[a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)\r?\n```$/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  } else if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  return cleaned;
}

export function detectCodeType(rawCode: string): { type: FileType; extension: string; label: string; cleanedCode: string } {
  const code = cleanPastedCode(rawCode);
  const trimmed = code.trim();

  // 1. Check for SVG (even if preceded by <?xml ...?> or comments)
  if (/<svg[\s\S]*?>[\s\S]*?<\/svg>/i.test(trimmed) || /<svg\b/i.test(trimmed)) {
    return { type: 'svg', extension: 'svg', label: 'SVG 矢量图形', cleanedCode: code };
  }

  // 2. Check for Android VectorDrawable XML
  if (/<vector[\s\S]*?android:pathData/i.test(trimmed) || /xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android"/i.test(trimmed)) {
    return { type: 'xml', extension: 'xml', label: 'Android Vector XML', cleanedCode: code };
  }

  // 3. Check for HTML document or HTML tags
  if (
    /<!doctype\s+html/i.test(trimmed) ||
    /<html[\s\S]*?>/i.test(trimmed) ||
    (/<(?:head|body|script|style|div|section|main|button|h1|h2|p|span)\b/i.test(trimmed) && trimmed.includes('>'))
  ) {
    return { type: 'html', extension: 'html', label: 'HTML 网页代码', cleanedCode: code };
  }

  // 4. Check for XML declaration or generic XML
  if (trimmed.startsWith('<?xml') || /<[\w\-:]+(\s+[\w\-:]+="[^"]*")*\s*>[\s\S]*<\/[\w\-:]+>/i.test(trimmed)) {
    return { type: 'xml', extension: 'xml', label: 'XML 数据/布局', cleanedCode: code };
  }

  // 5. Check for JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return { type: 'json', extension: 'json', label: 'JSON 数据', cleanedCode: code };
    } catch {
      // not valid json
    }
  }

  // 6. Check for CSS
  if (trimmed.includes('{') && trimmed.includes('}') && /(@import|@keyframes|[\.\#\w\-]+\s*\{)/.test(trimmed)) {
    return { type: 'css', extension: 'css', label: 'CSS 样式表', cleanedCode: code };
  }

  // 7. Check for Markdown
  if (
    trimmed.startsWith('# ') ||
    trimmed.startsWith('## ') ||
    trimmed.includes('\n# ') ||
    trimmed.includes('- [ ]')
  ) {
    return { type: 'md', extension: 'md', label: 'Markdown 文档', cleanedCode: code };
  }

  // Fallback to svg if looks like markup
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return { type: 'html', extension: 'html', label: 'HTML 代码', cleanedCode: code };
  }

  return { type: 'html', extension: 'html', label: '文本/代码', cleanedCode: code };
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

export function formatXmlOrHtml(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  const cleanXml = xml.replace(/>\s*</g, '><').trim();
  const tokens = cleanXml.split(/(<[^>]+>)/g).filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.startsWith('<') && (token.endsWith('/>') || token.startsWith('<?') || token.startsWith('<!'))) {
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.startsWith('<')) {
      formatted += tab.repeat(indent) + token + '\n';
      indent++;
    } else {
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
