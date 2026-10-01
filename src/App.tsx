import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CodeFile, ActiveTab } from './types';
import { INITIAL_FILES } from './utils/templates';
import { detectCodeType } from './utils/codeDetect';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { CodeEditor } from './components/CodeEditor';
import { RenderPreview } from './components/RenderPreview';
import { FileListDrawer } from './components/FileListDrawer';
import { NewFileDialog } from './components/NewFileDialog';
import { SmartPasteModal } from './components/SmartPasteModal';
import { GitHubExportModal } from './components/GitHubExportModal';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';
import { useTheme } from './context/ThemeContext';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'rendercraft_files_v2';
const ACTIVE_FILE_KEY = 'rendercraft_active_file_v2';

export default function App() {
  const { isDark } = useTheme();

  // Load files from localStorage or initial templates
  const [files, setFiles] = useState<CodeFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_FILES;
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_FILE_KEY);
      if (saved && files.some((f) => f.id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return files[0]?.id || 'file-1-svg';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab | 'split'>('preview');
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSmartPasteOpen, setIsSmartPasteOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isPhoneFrameActive, setIsPhoneFrameActive] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync files to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (err) {
      console.error('Failed to save files', err);
    }
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_FILE_KEY, activeFileId);
    } catch {
      // ignore
    }
  }, [activeFileId]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0] || null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Handlers
  const handleUpdateContent = (newContent: string) => {
    if (!activeFile) return;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFile.id
          ? { ...f, content: newContent, updatedAt: Date.now() }
          : f
      )
    );
  };

  const handleCreateFile = (
    fileData: Omit<CodeFile, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newFile: CodeFile = {
      ...fileData,
      id: newId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setFiles((prev) => [newFile, ...prev]);
    setActiveFileId(newId);
    // If it has content, switch directly to preview so user sees the rendered result immediately!
    if (newFile.content.trim()) {
      setActiveTab('preview');
    } else {
      setActiveTab('editor');
    }
    showToast(`已创建并打开 ${newFile.name}.${newFile.extension}`);
  };

  const handleDeleteFile = (fileId: string) => {
    if (files.length <= 1) return;
    const target = files.find((f) => f.id === fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = files.filter((f) => f.id !== fileId);
      if (remaining[0]) {
        setActiveFileId(remaining[0].id);
      }
    }
    if (target) {
      showToast(`已删除 ${target.name}.${target.extension}`);
    }
  };

  const handleDuplicateFile = (fileId: string) => {
    const target = files.find((f) => f.id === fileId);
    if (!target) return;
    const newId = `file-${Date.now()}`;
    const copy: CodeFile = {
      ...target,
      id: newId,
      name: `${target.name}_copy`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setFiles((prev) => [copy, ...prev]);
    setActiveFileId(newId);
    showToast(`已创建副本 ${copy.name}.${copy.extension}`);
  };

  const handleRenameFile = (
    fileId: string,
    newName: string,
    newExt: string
  ) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, name: newName, extension: newExt, updatedAt: Date.now() }
          : f
      )
    );
    showToast(`已重命名为 ${newName}.${newExt}`);
  };

  const handleDownloadFile = (file: CodeFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name}.${file.extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSmartPasteApply = (code: string) => {
    handleUpdateContent(code);
    setActiveTab('preview');
    showToast('代码已覆盖并即时渲染');
  };

  // Local File Import System (Multiple Files Supported)
  const handleImportFiles = (fileList: FileList) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    let importedCount = 0;
    let lastImportedId = '';

    incoming.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        const originalName = file.name;
        const lastDot = originalName.lastIndexOf('.');
        let name = originalName;
        let ext = '';

        if (lastDot > 0) {
          name = originalName.substring(0, lastDot);
          ext = originalName.substring(lastDot + 1).toLowerCase();
        }

        // If no ext or unknown, detect from text content
        if (!ext) {
          const detected = detectCodeType(text);
          ext = detected.extension;
        }

        const newId = `file-import-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newFile: CodeFile = {
          id: newId,
          name,
          extension: ext,
          content: text,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        lastImportedId = newId;
        importedCount += 1;

        setFiles((prev) => [newFile, ...prev]);

        if (importedCount === incoming.length) {
          setActiveFileId(lastImportedId);
          setActiveTab('preview');
          showToast(`已成功导入 ${incoming.length} 个文件并实时渲染！`);
        }
      };
      reader.readAsText(file);
    });
  };

  // Global Drag & Drop listener for files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set false if leaving window
    if (!e.relatedTarget || (e.relatedTarget as HTMLElement).nodeName === 'HTML') {
      setIsDraggingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImportFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="w-full h-full min-h-[100dvh]"
    >
      <AndroidPhoneFrame
        isFrameActive={isPhoneFrameActive}
        onToggleFrame={() => setIsPhoneFrameActive(!isPhoneFrameActive)}
      >
        <div
          className={`w-full h-full flex flex-col overflow-hidden select-text font-sans transition-colors duration-200 ${
            isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
          }`}
        >
          {/* Top App Bar */}
          <TopAppBar
            activeFile={activeFile}
            onOpenFilesDrawer={() => setIsFilesDrawerOpen(true)}
            onOpenNewModal={() => setIsNewModalOpen(true)}
            onOpenSmartPaste={() => setIsSmartPasteOpen(true)}
            onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
            onImportFiles={handleImportFiles}
            isPhoneFrameActive={isPhoneFrameActive}
            onTogglePhoneFrame={() => setIsPhoneFrameActive(!isPhoneFrameActive)}
          />

          {/* Main Content Workspace with GPU accelerated Transitions */}
          <main className="flex-1 relative overflow-hidden p-2 sm:p-3 flex flex-col">
            {activeFile ? (
              <div className="w-full h-full relative">
                {/* 1. Preview Tab */}
                <div
                  className={`w-full h-full absolute inset-0 transition-opacity duration-150 ${
                    activeTab === 'preview'
                      ? 'opacity-100 z-10 pointer-events-auto'
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <RenderPreview file={activeFile} />
                </div>

                {/* 2. Editor Tab */}
                <div
                  className={`w-full h-full absolute inset-0 transition-opacity duration-150 ${
                    activeTab === 'editor'
                      ? 'opacity-100 z-10 pointer-events-auto'
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <CodeEditor
                    file={activeFile}
                    onChangeContent={handleUpdateContent}
                    onOpenSmartPaste={() => setIsSmartPasteOpen(true)}
                    onImportFiles={handleImportFiles}
                  />
                </div>

                {/* 3. Split Screen Tab */}
                <div
                  className={`w-full h-full absolute inset-0 flex flex-col md:flex-row gap-2.5 transition-opacity duration-150 ${
                    activeTab === 'split'
                      ? 'opacity-100 z-10 pointer-events-auto'
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <div className="flex-1 h-1/2 md:h-full min-h-0">
                    <CodeEditor
                      file={activeFile}
                      onChangeContent={handleUpdateContent}
                      onOpenSmartPaste={() => setIsSmartPasteOpen(true)}
                      onImportFiles={handleImportFiles}
                    />
                  </div>
                  <div className="flex-1 h-1/2 md:h-full min-h-0">
                    <RenderPreview file={activeFile} />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`w-full h-full flex flex-col items-center justify-center text-xs p-6 text-center ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <span>暂无打开的代码文件</span>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold cursor-pointer"
                >
                  新建一个文件
                </button>
              </div>
            )}
          </main>

          {/* Bottom Navigation Bar */}
          <BottomNavBar
            activeTab={activeTab}
            onChangeTab={(tab) => {
              if (tab === 'files') {
                setIsFilesDrawerOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            filesCount={files.length}
          />

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold pointer-events-none"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag & Drop Visual Dropzone Overlay */}
          <AnimatePresence>
            {isDraggingFile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-indigo-950/80 backdrop-blur-sm border-4 border-dashed border-indigo-400 flex flex-col items-center justify-center p-6 text-center text-white select-none pointer-events-none"
              >
                <div className="w-16 h-16 rounded-3xl bg-indigo-600/30 flex items-center justify-center text-indigo-300 mb-4 animate-bounce">
                  <UploadCloud className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold">释放文件即可自动导入渲染</h3>
                <p className="text-xs text-indigo-200 mt-1 max-w-xs">
                  支持 .svg, .html, .xml, .json, .md 以及任意自定义扩展名代码文件
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modals & Sliding Drawer */}
          <FileListDrawer
            isOpen={isFilesDrawerOpen}
            onClose={() => setIsFilesDrawerOpen(false)}
            files={files}
            activeFileId={activeFileId}
            onSelectFile={(id) => {
              setActiveFileId(id);
              setActiveTab('preview');
            }}
            onOpenNewModal={() => setIsNewModalOpen(true)}
            onImportFiles={handleImportFiles}
            onDeleteFile={handleDeleteFile}
            onDuplicateFile={handleDuplicateFile}
            onRenameFile={handleRenameFile}
            onDownloadFile={handleDownloadFile}
          />

          <NewFileDialog
            isOpen={isNewModalOpen}
            onClose={() => setIsNewModalOpen(false)}
            onCreate={handleCreateFile}
          />

          <SmartPasteModal
            isOpen={isSmartPasteOpen}
            onClose={() => setIsSmartPasteOpen(false)}
            activeFile={activeFile}
            onApplyToCurrent={handleSmartPasteApply}
            onCreateNewAndOpen={handleCreateFile}
          />

          <GitHubExportModal
            isOpen={isGitHubModalOpen}
            onClose={() => setIsGitHubModalOpen(false)}
            files={files}
          />
        </div>
      </AndroidPhoneFrame>
    </div>
  );
}
