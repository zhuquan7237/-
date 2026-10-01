import { CodeFile } from '../types';

export const INITIAL_FILES: CodeFile[] = [
  {
    id: 'file-1-svg',
    name: 'vector_cyber_badge',
    extension: 'svg',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <!-- Shield Primary Gradient -->
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#d946ef" />
    </linearGradient>

    <!-- Neon Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="400" height="400" rx="32" fill="url(#bgGrad)" />

  <!-- Ambient Concentric Rings -->
  <circle cx="200" cy="200" r="140" fill="none" stroke="#312e81" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.6" />
  <circle cx="200" cy="200" r="110" fill="none" stroke="#4338ca" stroke-width="1" opacity="0.4" />

  <!-- Shield Outer Glow Shape -->
  <path d="M 200 80 Q 270 80 290 150 C 290 230 200 290 200 310 C 200 290 110 230 110 150 Q 130 80 200 80 Z"
        fill="none" stroke="url(#shieldGrad)" stroke-width="8" filter="url(#glow)" opacity="0.85" />

  <!-- Shield Core Body -->
  <path d="M 200 95 Q 260 95 275 155 C 275 220 200 275 200 290 C 200 275 125 220 125 155 Q 140 95 200 95 Z"
        fill="#1e1e38" stroke="url(#shieldGrad)" stroke-width="2" />

  <!-- Glowing Core Icon (Lightning Bolt) -->
  <path d="M 205 130 L 165 200 L 195 200 L 185 260 L 235 185 L 205 185 Z"
        fill="url(#shieldGrad)" filter="url(#glow)">
    <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
  </path>

  <!-- Decorative Orbit Dots -->
  <circle cx="200" cy="65" r="4" fill="#a855f7" filter="url(#glow)" />
  <circle cx="295" cy="140" r="3" fill="#6366f1" />
  <circle cx="105" cy="140" r="3" fill="#ec4899" />
  <circle cx="200" cy="325" r="3" fill="#8b5cf6" />
</svg>`
  },
  {
    id: 'file-2-html',
    name: 'mobile_glass_card',
    extension: 'html',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
    content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Glass Card</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 100%);
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4 text-white">

  <!-- Interactive Card Container -->
  <div class="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-white/40">
    <!-- Ambient Blur Spot -->
    <div class="absolute -top-16 -right-16 w-36 h-36 bg-purple-500/30 rounded-full blur-2xl pointer-events-none"></div>
    <div class="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none"></div>

    <div class="relative z-10">
      <div class="flex items-center justify-between mb-5">
        <span class="text-xs font-mono tracking-wider uppercase text-purple-300">Android Render</span>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          运行中
        </span>
      </div>

      <h2 class="text-xl font-bold mb-1 tracking-tight text-white">AI 代码极速渲染</h2>
      <p class="text-slate-300 text-sm leading-relaxed mb-6">
        直接将 AI 生成的 HTML、SVG、CSS 或 JS 代码粘贴即可无缝实时预览。
      </p>

      <!-- Interactive Counter -->
      <div class="bg-black/30 rounded-2xl p-4 mb-5 border border-white/10 flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-400">渲染刷新计数</div>
          <div id="counter" class="text-2xl font-bold font-mono text-purple-400">0</div>
        </div>
        <button onclick="increment()" class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-medium text-xs shadow-lg active:scale-95 transition-transform cursor-pointer">
          测试点击 +1
        </button>
      </div>

      <div class="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-white/10">
        <span>沙箱隔离安全执行</span>
        <span>HTML5 / CSS3</span>
      </div>
    </div>
  </div>

  <script>
    let count = 0;
    function increment() {
      count++;
      document.getElementById('counter').innerText = count;
    }
  </script>
</body>
</html>`
  },
  {
    id: 'file-3-xml',
    name: 'ic_android_rocket',
    extension: 'xml',
    createdAt: Date.now() - 10800000,
    updatedAt: Date.now() - 10800000,
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="48dp"
    android:height="48dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <!-- Android VectorDrawable: Rocket Icon -->
    <path
        android:fillColor="#6366F1"
        android:pathData="M12,2.5C9.5,4.5 8,8 8,11c0,2.5 1,5 2,6.5L8.5,20l3.5,-1.5L15.5,20L14,17.5c1,-1.5 2,-4 2,-6.5C16,8 14.5,4.5 12,2.5z" />
    <path
        android:fillColor="#F43F5E"
        android:pathData="M12,18.5L10.5,21.5L12,20.5L13.5,21.5z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M12,9a2,2 0 1,0 0.001,0.001z" />
</vector>`
  },
  {
    id: 'file-4-xml',
    name: 'android_ui_layout',
    extension: 'xml',
    createdAt: Date.now() - 14400000,
    updatedAt: Date.now() - 14400000,
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="#0F172A">

    <TextView
        android:id="@+id/tv_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="RenderCraft Android Edition"
        android:textSize="20sp"
        android:textStyle="bold"
        android:textColor="#FFFFFF" />

    <TextView
        android:id="@+id/tv_subtitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:text="Ultra-lightweight code rendering studio."
        android:textSize="14sp"
        android:textColor="#94A3B8" />

    <Button
        android:id="@+id/btn_action"
        android:layout_width="match_parent"
        android:layout_height="48dp"
        android:layout_marginTop="24dp"
        android:text="一键粘贴并渲染"
        android:background="#6366F1"
        android:textColor="#FFFFFF" />
</LinearLayout>`
  }
];
