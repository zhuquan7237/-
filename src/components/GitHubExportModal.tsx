import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Github,
  Download,
  CheckCircle2,
  Smartphone,
  Cpu,
  ShieldCheck,
  PackageCheck,
  FileCode,
} from 'lucide-react';
import { CodeFile } from '../types';
import { useTheme } from '../context/ThemeContext';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: CodeFile[];
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({
  isOpen,
  onClose,
  files,
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const handleDownloadAllJson = () => {
    const backupData = {
      project: 'RenderCraft-Android',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      files: files.map((f) => ({
        name: `${f.name}.${f.extension}`,
        content: f.content,
        extension: f.extension,
      })),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rendercraft_project_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className={`w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto border transition-colors ${
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
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Android 原生工程与安装包</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                  编译验证通过
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                支持直接下载 APK 安装包、查看 GitHub Release 或导出完整项目
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

        {/* Highlight Banner: Direct APK Download */}
        <div
          className={`my-4 p-4 rounded-2xl border shadow-sm ${
            isDark
              ? 'bg-gradient-to-r from-emerald-950/70 to-slate-900 border-emerald-500/40 text-slate-200'
              : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">RenderCraft Android APK 已就绪</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                    v1.0.0 (4.6 MB)
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  直链下载，无需注册登录 GitHub，无需梯子翻墙，手机浏览器一键安装！
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="/RenderCraft-v1.0.0.apk"
                download="RenderCraft-v1.0.0.apk"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                立即下载 APK
              </a>
              <a
                href="https://github.com/zhuquan7237/-/releases/tag/v1.0.0"
                target="_blank"
                rel="noreferrer"
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap border ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="在 GitHub Release 页面查看"
              >
                <Github className="w-4 h-4" />
                <span>GitHub 发布页</span>
              </a>
            </div>
          </div>
        </div>

        {/* Explain APK Size Note */}
        <div
          className={`p-3.5 rounded-2xl border mb-4 text-xs ${
            isDark
              ? 'bg-slate-950/60 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="font-semibold mb-1 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>关于 Android 安装包体积 (4.6 MB) 说明</span>
          </div>
          <p className="leading-relaxed opacity-90 text-[11px] sm:text-xs">
            该 APK 是完整的真实 Android 原生安装包，内部整合了 AndroidX 核心库、Capacitor 原生硬件调用桥以及兼容四大 CPU 架构（arm64-v8a、armeabi-v7a、x86、x86_64）的二进制文件。在整个 Android 原生应用市场中，4.6 MB 属于极小体积梯队（对比常规 Flutter 或 React Native 安装包通常为 30 MB ~ 80 MB）。而本应用的 Web 核心代码编译产物本身仅约 140 KB。
          </p>
        </div>

        {/* 3 Architecture Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div
            className={`p-3 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-indigo-500 mb-1">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-bold">1. 极致轻量与启动</span>
            </div>
            <p className={`text-xs leading-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              基于原生浏览器高效 DOMParser 与 Canvas 实时渲染，冷启动毫秒级，无繁重 Monaco/AST 拖慢手机。
            </p>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-purple-500 mb-1">
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-bold">2. 高刷与触控手势</span>
            </div>
            <p className={`text-xs leading-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              遵循手机屏幕原生刷新率（90Hz / 120Hz），支持侧边栏左滑手势即时收起、安全区域避让。
            </p>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold">3. 日夜双色自适应</span>
            </div>
            <p className={`text-xs leading-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              提供高对比日间明亮模式与深邃夜间暗黑模式，白天户外清晰易读，夜晚编码柔和护眼。
            </p>
          </div>
        </div>

        {/* Export All Files Button */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2 ${
            isDark
              ? 'bg-indigo-600/10 border-indigo-500/20'
              : 'bg-indigo-50/70 border-indigo-200'
          }`}
        >
          <div>
            <div className="text-xs font-bold flex items-center gap-2">
              <span>完整 Android 原生工程包 (.tar.gz)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono">
                487 KB
              </span>
            </div>
            <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              内含 Android 原生工程、Gradle 脚本与 GitHub Actions 自动编译工作流
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/rendercraft-android-project.tar.gz"
              download="rendercraft-android-project.tar.gz"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4" />
              下载工程包
            </a>
            <button
              onClick={handleDownloadAllJson}
              className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all whitespace-nowrap border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="仅导出所有文件代码为 JSON"
            >
              仅代码 JSON
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
