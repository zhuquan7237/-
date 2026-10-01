import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowUpCircle,
} from 'lucide-react';
import { UpdateInfo, checkForAppUpdates } from '../services/updater';
import { useTheme } from '../context/ThemeContext';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  onUpdateInfoChanged?: (info: UpdateInfo) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  onUpdateInfoChanged,
}) => {
  const { isDark } = useTheme();
  const [isChecking, setIsChecking] = useState(false);
  const [currentInfo, setCurrentInfo] = useState<UpdateInfo | null>(updateInfo);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync state with prop
  React.useEffect(() => {
    if (updateInfo) {
      setCurrentInfo(updateInfo);
    }
  }, [updateInfo]);

  if (!isOpen) return null;

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const res = await checkForAppUpdates();
      setCurrentInfo(res);
      if (onUpdateInfoChanged) onUpdateInfoChanged(res);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = currentInfo?.apkUrl || '/RenderCraft-v1.0.0.apk';
    link.download = `RenderCraft-v${currentInfo?.latestVersion || '1.0.1'}.apk`;
    link.click();
    setTimeout(() => {
      setIsDownloading(false);
      onClose();
    }, 1500);
  };

  const hasUpdate = currentInfo?.hasUpdate;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className={`w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto border transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-3.5 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                hasUpdate
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-500'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
              }`}
            >
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">软件在线自动更新</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono ${
                    hasUpdate
                      ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                      : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                  }`}
                >
                  {hasUpdate ? '有新版本可用' : '已是最新版'}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                同步上游最新发布，软件内一键直升，无需再去仓库解拆
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-950'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Version Comparison Card */}
        <div
          className={`my-4 p-4 rounded-2xl border ${
            hasUpdate
              ? isDark
                ? 'bg-gradient-to-r from-indigo-950/70 to-slate-900 border-indigo-500/40'
                : 'bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-indigo-200'
              : isDark
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                当前安装版本
              </span>
              <span className="text-base font-bold font-mono">
                v{currentInfo?.currentVersion || '1.0.0'}
              </span>
            </div>

            <div className="text-right">
              <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                上游最新版本
              </span>
              <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                v{currentInfo?.latestVersion || '1.0.0'}
              </span>
            </div>
          </div>

          {currentInfo?.releaseDate && (
            <div
              className={`mt-2 pt-2 border-t text-[11px] flex items-center justify-between ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}
            >
              <span>发布时间</span>
              <span className="font-mono">
                {new Date(currentInfo.releaseDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Changelog Section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>更新内容亮点：</span>
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border text-xs space-y-1.5 max-h-48 overflow-y-auto leading-relaxed ${
              isDark
                ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {currentInfo?.changelog && currentInfo.changelog.length > 0 ? (
              currentInfo.changelog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{log.replace(/^[*-]\s*/, '')}</span>
                </div>
              ))
            ) : (
              <p className="opacity-70">修复已知体验问题与稳定性提升。</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            disabled={isChecking}
            onClick={handleManualCheck}
            className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
              isDark
                ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? '正在检查上游...' : '手动检查更新'}</span>
          </button>

          {hasUpdate ? (
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownload}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? '正在拉取安装包...' : '立即在应用内下载更新'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              当前已是最新版
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
