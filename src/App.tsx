import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CodeFile, ActiveTab } from './types';
import { INITIAL_FILES } from './utils/templates';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { CodeEditor } from './components/CodeEditor';
import { RenderPreview } from './components/RenderPreview';
import { FileListDrawer } from './components/FileListDrawer';
import { NewFileDialog } from './components/NewFileDialog';
import { SmartPasteModal } from './components/SmartPasteModal';
import { GitHubExportModal } from './components/GitHubExportModal';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';

const STORAGE_KEY = 'rendercraft_files_v1';
const ACTIVE_FILE_KEY = 'rendercraft_active_file_v1';

export default function App() {
  // Load files from localStorage or fallback to initial templates
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

  const [activeTab, setActiveTab] = useState<ActiveTab | 'split'>('editor');
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSmartPasteOpen, setIsSmartPasteOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isPhoneFrameActive, setIsPhoneFrameActive] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (err) {
      console.error('Failed to save files to localStorage', err);
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
  };

  const handleDeleteFile = (fileId: string) => {
    if (files.length <= 1) return;
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = files.filter((f) => f.id !== fileId);
      if (remaining[0]) {
        setActiveFileId(remaining[0].id);
      }
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
    // Directly switch to preview tab so user immediately sees rendered effect!
    setActiveTab('preview');
  };

  return (
    <AndroidPhoneFrame
      isFrameActive={isPhoneFrameActive}
      onToggleFrame={() => setIsPhoneFrameActive(!isPhoneFrameActive)}
    >
      <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-text font-sans">
        {/* Top App Bar */}
        <TopAppBar
          activeFile={activeFile}
          onOpenFilesDrawer={() => setIsFilesDrawerOpen(true)}
          onOpenNewModal={() => setIsNewModalOpen(true)}
          onOpenSmartPaste={() => setIsSmartPasteOpen(true)}
          onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
          isPhoneFrameActive={isPhoneFrameActive}
          onTogglePhoneFrame={() => setIsPhoneFrameActive(!isPhoneFrameActive)}
        />

        {/* Main Content Workspace with Motion transitions */}
        <main className="flex-1 relative overflow-hidden p-2 sm:p-3">
          {activeFile ? (
            <AnimatePresence mode="wait">
              {activeTab === 'editor' && (
                <motion.div
                  key="tab-editor"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full"
                >
                  <CodeEditor
                    file={activeFile}
                    onChangeContent={handleUpdateContent}
                    onOpenSmartPaste={() => setIsSmartPasteOpen(true)}
                  />
                </motion.div>
              )}

              {activeTab === 'preview' && (
                <motion.div
                  key="tab-preview"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full"
                >
                  <RenderPreview file={activeFile} />
                </motion.div>
              )}

              {activeTab === 'split' && (
                <motion.div
                  key="tab-split"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full flex flex-col md:flex-row gap-2.5"
                >
                  <div className="flex-1 h-1/2 md:h-full min-h-0">
                    <CodeEditor
                      file={activeFile}
                      onChangeContent={handleUpdateContent}
                      onOpenSmartPaste={() => setIsSmartPasteOpen(true)}
                    />
                  </div>
                  <div className="flex-1 h-1/2 md:h-full min-h-0">
                    <RenderPreview file={activeFile} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'files' && (
                <motion.div
                  key="tab-files"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full max-w-xl mx-auto flex flex-col"
                >
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl h-full flex flex-col">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <h2 className="text-sm font-semibold text-white">所有文件</h2>
                        <p className="text-xs text-slate-400">点击切换或管理文件</p>
                      </div>
                      <button
                        onClick={() => setIsNewModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium cursor-pointer"
                      >
                        + 新建文件
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pt-3 space-y-2">
                      {files.map((f) => (
                        <div
                          key={f.id}
                          onClick={() => {
                            setActiveFileId(f.id);
                            setActiveTab('editor');
                          }}
                          className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            f.id === activeFileId
                              ? 'bg-indigo-600/15 border-indigo-500/80'
                              : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 uppercase">
                              .{f.extension}
                            </span>
                            <span className="text-xs font-medium text-white truncate font-mono">
                              {f.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {f.content.split('\n').length} 行
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
              暂无打开的文件
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

        {/* Modals & Drawers */}
        <FileListDrawer
          isOpen={isFilesDrawerOpen}
          onClose={() => setIsFilesDrawerOpen(false)}
          files={files}
          activeFileId={activeFileId}
          onSelectFile={(id) => {
            setActiveFileId(id);
            setActiveTab('editor');
          }}
          onOpenNewModal={() => setIsNewModalOpen(true)}
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
  );
}
