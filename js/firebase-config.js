// ============================================
// Firebase 配置模板
// ============================================
// 本文件用于连接 Firebase Cloud Firestore，实现多人实时同步。
//
// 操作步骤：
// 1. 访问 https://console.firebase.google.com/ 创建一个新项目。
// 2. 进入「Project settings > General」，找到「Your apps」，添加 Web 应用。
// 3. 复制 firebaseConfig 对象中的 apiKey、authDomain、projectId 等字段。
// 4. 把下面的占位符替换为你自己的配置。
// 5. 在 Firebase 控制台左侧打开「Firestore Database」，点击「创建数据库」，选择「以测试模式开始」。
// 6. 进入「Firestore Database > 规则」，粘贴 firestore.rules 文件中的内容并发布。
// 7. 提交并推送到 GitHub，GitHub Pages 会自动部署。
//
// 安全提示：
// - apiKey 可以公开在 GitHub Pages 前端，但必须配合 firestore.rules 限制读写权限。
// - 生产环境建议启用 Firebase App Check 或匿名认证，防止滥用。
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY';
export let app = null;
export let db = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}
