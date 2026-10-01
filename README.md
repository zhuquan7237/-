# RenderCraft - 极简代码预览与渲染工作室 (Android & Web)

> 专为开发者和移动端打造的超轻量代码渲染神器。支持一键粘贴 AI（ChatGPT / Claude / DeepSeek）生成的代码，支持 SVG、HTML、XML 等格式实时渲染与自定义后缀文件管理。

[![Build Android APK](https://github.com/zhuquan155/rendercraft-android/actions/workflows/build-apk.yml/badge.svg)](https://github.com/zhuquan155/rendercraft-android/actions)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

---

## 📱 核心功能特性

1. **多格式代码即时渲染与预览**
   - **SVG 矢量预览**：50%~400% 缩放、手势拖拽、透明网格/深色/纯白/工程蓝图背景切换、调色盘提取与一键复制、导出高保真 PNG 与 SVG 原图。
   - **HTML / CSS / JS 沙箱**：安全沙箱 `iframe` 执行、实时 Console 控制台日志/报错捕获、安卓手机 (390px) / 平板 (768px) / 桌面全屏一键模拟。
   - **XML 节点树与安卓矢量**：智能识别 Android VectorDrawable XML（`<vector ...>`）并自动转译为矢量图形实时预览；内置交互式折叠 DOM 节点树与语法校验。
   - **Markdown 与多格式**：支持轻量 Markdown 排版与自定义任意代码文件。

2. **新建文件与自由自定义后缀**
   - 支持创建自定义后缀名（如 `.svg`、`.html`、`.xml`、`.md`、`.json`、`.vue` 等）。
   - 提供开箱即用的高质感初始模板（微光赛博徽章、毛玻璃交互卡片、安卓火箭矢量 XML 等）。

3. **AI 代码一键捕获与粘贴**
   - 支持从系统剪贴板自动读取代码。
   - 格式智能嗅探：自动检测是 SVG、HTML、XML 还是 JSON。
   - 支持「自动新建对应文件并直达渲染」与「覆盖当前文件」。

4. **体积与性能指标**
   - **极致轻量**：核心 Web 资源压缩后仅约 120 KB，零沉重 AST/Monaco 引擎依赖。
   - **流畅动画**：基于物理弹簧动效（Framer Motion），切换界面与上下滑动平滑 60 FPS。
   - **Android 独占 APK**：由 GitHub Actions 自动化编译打包，体积仅约 2MB。

---

## 🛠️ 本地开发运行

```bash
# 安装依赖
npm install

# 启动本地开发服务 (支持手机与电脑端自适应)
npm run dev

# 编译打包 Web 资源
npm run build
```

---

## 🤖 自动化构建 Android APK

本项目已配置 **GitHub Actions 自动化 CI/CD**（`.github/workflows/build-apk.yml`）：

1. 每次 `git push` 到仓库时，GitHub Actions 会自动在云端执行编译打包。
2. 编译完成后，前往仓库的 **Actions -> Artifacts** 即可直接一键下载安装 `RenderCraft-v1.0.0.apk`。
3. 发布 GitHub Release 时会自动将 APK 作为 Release Asset 挂载供用户直接扫码/下载。

如果需要在本地通过 Android Studio 运行：
```bash
# 同步资源到 Android 原生目录
npx cap sync android

# 在 Android Studio 中打开并调试
npx cap open android
```

---

## 📄 开源许可证

Apache License 2.0
