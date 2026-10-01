export type FileType = 'svg' | 'html' | 'xml' | 'md' | 'json' | 'css' | 'other';

export interface CodeFile {
  id: string;
  name: string;          // e.g. "flower_icon"
  extension: string;     // e.g. "svg", "html", "xml", "custom"
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type ActiveTab = 'files' | 'editor' | 'preview' | 'info';

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

export interface RenderError {
  line?: number;
  column?: number;
  message: string;
}
