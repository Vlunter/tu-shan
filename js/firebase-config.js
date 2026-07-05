// ============================================
// Firebase 配置
// 注意：本文件必须使用 ES Module 格式，被 tushan-star.html 以 import 方式引入
// 不要把 Firebase 控制台生成的 <script> 标签整段复制进来
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDKSMUvuiHYSf6cE5Vg2PhHw2nn8q8AFyk",
  authDomain: "tu-shan.firebaseapp.com",
  projectId: "tu-shan",
  storageBucket: "tu-shan.firebasestorage.app",
  messagingSenderId: "255034914727",
  appId: "1:255034914727:web:4154a740d9299f0b606882",
  measurementId: "G-8S4434QC9F"
};

export const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY';
export let app = null;
export let db = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}
