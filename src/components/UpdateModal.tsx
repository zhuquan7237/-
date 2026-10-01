import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  Download,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Bell,
  Smartphone,
  Info,
} from 'lucide-react';
import { UpdateInfo, checkForAppUpdates, CURRENT_APP_VERSION } from '../services/updater';
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
  const [downloadState, setDownloadState] = useState<'idle' | 'started' | 'completed'>('idle');

  // Sync state with prop
  React.useEffect(() => {
    if (updateInfo) {
      setCurrentInfo(updateInfo);
    }
  }, [updateInfo]);

  if (!isOpen) return null;

  const handleManualCheck = async () => {
    setIsChecking(true);
    setDownloadState('idle');
    try {
      const res = await checkForAppUpdates();
      setCurrentInfo(res);
      if (onUpdateInfoChanged) onUpdateInfoChanged(res);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownload = () => {
    setDownloadState('started');
    const targetUrl = currentInfo?.apkUrl || '/RenderCraft-v1.0.1.apk';
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = `RenderCraft-v${currentInfo?.latestVersion || CURRENT_APP_VERSION}.apk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Keep modal open and show clear confirmation
    setTimeout(() => {
      setDownloadState('completed');
    }, 1200);
  };

  const hasUpdate = Boolean(currentInfo?.hasUpdate);

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
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">版本状态与系统通知</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono ${
                    hasUpdate
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                  }`}
                >
                  {hasUpdate ? '有新版本可升级' : '当前已是最新版'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                实时对照 GitHub 上游官方发布，保障代码与安装包一致性
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
                ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 border-amber-500/30'
                : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
              : isDark
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                当前正在运行版本
              </span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                v{CURRENT_APP_VERSION}
                {!hasUpdate && <CheckCircle2 className="w-4 h-4" />}
              </span>
            </div>

            <div className="text-right">
              <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                GitHub 上游最新版本
              </span>
              <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                v{currentInfo?.latestVersion || CURRENT_APP_VERSION}
              </span>
            </div>
          </div>

          {!hasUpdate ? (
            <div
              className={`mt-3 pt-2.5 border-t text-xs flex items-center gap-2 ${
                isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>您当前拉取的代码/安装包已是最新的 <strong>v{CURRENT_APP_VERSION}</strong>，已包含全部最新特性，无需重复拉取。</span>
            </div>
          ) : (
            <div
              className={`mt-3 pt-2.5 border-t text-xs flex items-center gap-2 ${
                isDark ? 'border-amber-500/20 text-amber-300' : 'border-amber-200 text-amber-800'
              }`}
            >
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <span>检测到上游有更高版本发布，您可以点击下方按钮下载安装包更新。</span>
            </div>
          )}
        </div>

        {/* Download Feedback State Card */}
        {downloadState === 'started' && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-4 flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-500 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-indigo-300">正在唤起下载...</p>
              <p className="opacity-80">安装包 `RenderCraft-v{currentInfo?.latestVersion || CURRENT_APP_VERSION}.apk` 已交由浏览器/下载器接收</p>
            </div>
          </div>
        )}

        {downloadState === 'completed' && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 mb-4">
            <div className="flex items-center gap-2 font-bold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>下载任务已触发</span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              文件保存至手机系统的「下载（Download）」文件夹。若浏览器无提示，您也可以直接点击
              <a
                href={currentInfo?.apkUrl || '/RenderCraft-v1.0.1.apk'}
                target="_blank"
                rel="noreferrer"
                className="underline font-bold ml-1 text-emerald-500 hover:text-emerald-400"
              >
                此处直接打开链接
              </a>
              。
            </p>
          </div>
        )}

        {/* Changelog Section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{hasUpdate ? '最新版更新日志' : '当前版本特性亮点'}</span>
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border text-xs space-y-1.5 max-h-44 overflow-y-auto leading-relaxed ${
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
              <p className="opacity-70">规范化单行操作栏，杜绝重叠，支持 AI 代码智能净化与即时渲染。</p>
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
            <span>{isChecking ? '正在核对上游...' : '手动刷新版本'}</span>
          </button>

          {hasUpdate ? (
            <button
              type="button"
              disabled={downloadState === 'started'}
              onClick={handleDownload}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{downloadState === 'started' ? '正在触发下载...' : '下载并更新 APK'}</span>
            </button>
          ) : (
            <div className="flex-1 flex gap-2">
              <a
                href={currentInfo?.githubUrl || 'https://github.com/zhuquan7237/RenderCraft/releases'}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>GitHub Releases 页面</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                完成
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
