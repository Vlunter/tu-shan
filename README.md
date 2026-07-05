# 涂山备忘录 · 星河祈愿

一个部署在 **GitHub Pages** 上的多人实时互动电影 CG 网页。九尾天狐与东方仙子作为视觉核心，用户可点亮星辰、留下祈愿，并与其他在线用户实时共享同一片银河。

---

## 项目架构

| 模块 | 技术 |
|------|------|
| 页面部署 | GitHub Pages |
| 实时渲染 | Three.js + WebGL2 |
| 实时数据 | Firebase Cloud Firestore |
| 背景音乐 | HTML5 Audio（模块化管理） |
| 状态持久 | localStorage（未配置 Firebase 时回退） |

---

## 目录结构

```text
.
├── index.html              # 入口页
├── tushan-star.html        # 主互动页（九尾天狐场景）
├── firestore.rules         # Firebase 安全规则
├── js/
│   ├── firebase-config.js  # Firebase 配置模板
│   ├── firebase-sync.js    # 实时同步模块
│   └── audio-manager.js    # 音乐播放器模块
├── music/
│   ├── README.md           # 音乐上传说明
│   ├── bgm1.mp3            # 需自行上传
│   ├── bgm2.mp3            # 需自行上传
│   └── bgm3.mp3            # 需自行上传
└── README.md               # 本文件
```

---

## 一、部署到 GitHub Pages

### 1. 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com/)。
2. 点击右上角 `+` → **New repository**。
3. 填写仓库名称，例如 `tu-shan`。
4. 选择 **Public**（GitHub Pages 免费版要求公开仓库）。
5. 点击 **Create repository**。

### 2. 上传项目文件

#### 方式 A：网页端上传（新手推荐）

1. 进入刚创建的仓库页面。
2. 点击 **Add file > Upload files**。
3. 把本项目的所有文件和文件夹（`index.html`、`tushan-star.html`、`js/`、`music/` 等）拖入上传区域。
4. 填写提交信息，例如 `Initial commit`。
5. 点击 **Commit changes**。

#### 方式 B：Git 命令上传

```bash
cd tu-shan
git init
git remote add origin https://github.com/你的用户名/tu-shan.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 3. 开启 GitHub Pages

1. 进入仓库的 **Settings** 页面。
2. 左侧选择 **Pages**。
3. **Source** 选择 **Deploy from a branch**。
4. **Branch** 选择 `main`，目录选择 `/(root)`，点击 **Save**。
5. 等待 1~3 分钟后，页面会显示访问地址：
   ```text
   https://你的用户名.github.io/tu-shan/
   ```

---

## 二、配置 Firebase 实时同步

> 跳过此步骤也能运行，但只能使用本地单机模式（数据不会同步给其他用户）。

### 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)。
2. 点击 **Create a project**。
3. 输入项目名称（例如 `tu-shan`），按提示完成创建。

### 2. 注册 Web 应用

1. 进入项目后，点击项目概览旁边的 **</>** 图标（Add app）。
2. 选择 **Web**。
3. 输入应用昵称，例如 `tu-shan-web`。
4. 点击 **Register app**。
5. 复制 `firebaseConfig` 对象中的字段。

### 3. 填写配置

打开 `js/firebase-config.js`，把占位符替换为真实值：

```javascript
const firebaseConfig = {
  apiKey: "你的 apiKey",
  authDomain: "你的 projectId.firebaseapp.com",
  projectId: "你的 projectId",
  storageBucket: "你的 projectId.appspot.com",
  messagingSenderId: "你的 messagingSenderId",
  appId: "你的 appId"
};
```

### 4. 创建 Firestore 数据库

1. 在 Firebase 控制台左侧选择 **Build > Firestore Database**。
2. 点击 **Create database**。
3. 选择 **Start in test mode**（测试模式）。
4. 选择数据库位置，建议选择离你用户最近的位置，例如 `asia-east2`（香港）或 `asia-northeast1`（东京）。
5. 点击 **Enable**。

### 5. 设置安全规则

1. 进入 **Firestore Database > Rules**。
2. 把 `firestore.rules` 文件中的内容全部粘贴进去。
3. 点击 **Publish**。

### 6. 重新部署

把修改后的 `js/firebase-config.js` 提交到 GitHub：

```bash
git add js/firebase-config.js
git commit -m "Configure Firebase"
git push
```

等待 GitHub Pages 重新部署后，多人实时同步即生效。

---

## 三、背景音乐操作指南

音乐播放器代码位于 `tushan-star.html` 的「音乐模块配置」区域，播放器逻辑封装在 `js/audio-manager.js`。

### 1. 上传音乐文件到 GitHub

#### 网页端上传

1. 打开 GitHub 仓库，进入 `music` 文件夹。
2. 点击 **Add file > Upload files**。
3. 将 `bgm1.mp3`、`bgm2.mp3`、`bgm3.mp3` 拖入上传区。
4. 填写提交信息，例如 `Add background music`。
5. 点击 **Commit changes**。
6. 等待 1~3 分钟，GitHub Pages 部署完成后刷新网页即可听到音乐。

#### Git 命令上传

```bash
# 把音乐文件复制到 music 目录
cp /path/to/bgm1.mp3 music/
cp /path/to/bgm2.mp3 music/
cp /path/to/bgm3.mp3 music/

# 提交并推送
git add music/
git commit -m "Add background music"
git push
```

### 2. 修改播放列表

打开 `tushan-star.html`，找到：

```javascript
// ===== 音乐模块配置 =====
const playlist = [
  { name: '星河序曲', src: './music/bgm1.mp3' },
  { name: '狐影迷踪', src: './music/bgm2.mp3' },
  { name: '天狐祈愿', src: './music/bgm3.mp3' }
];
const audioManager = new AudioManager(playlist);
// ===== 音乐模块配置结束 =====
```

按你的实际文件名和歌曲名修改后提交即可。

### 3. 音乐播放器功能

- 首次进入页面不会自动播放，用户点击页面任意位置后自动开始。
- 支持播放/暂停、上一首、下一首。
- 支持音量调节与静音。
- 支持淡入淡出与仪式自动降音。
- 播放时按钮有呼吸发光动画。

---

## 四、主要功能说明

### 多人实时点亮

- 输入昵称，点击「点亮星团」。
- 昵称化作金色流光飞向九尾天狐，最终成为银河环上的一颗恒星。
- 所有在线用户实时同步看到点亮过程。

### 星河留言

- 在右侧面板输入昵称和留言，点击「发送留言」。
- 留言实时同步给所有在线用户。

### 在线人数与统计

- 顶部显示当前在线人数、累计访问、点亮数、留言数。
- 数据来自 Firebase 实时统计。

### 排行榜

- 左侧显示「星河贡献榜」。
- 根据点亮次数和留言数量排序，前三名有特殊皇冠样式。

---

## 五、常见问题

### 为什么我看到「Firebase 未配置」提示？

说明 `js/firebase-config.js` 还是模板占位符。请按上文「配置 Firebase 实时同步」步骤填写真实配置。

### 为什么音乐没有声音？

- 浏览器通常禁止自动播放音频，需要用户先点击页面任意位置。
- 请确认 `music/` 目录下已上传对应的 `.mp3` 文件。
- 请确认文件路径与 `playlist` 配置一致。

### 为什么 GitHub Pages 访问后显示 404？

- 检查 GitHub Pages 设置中 Branch 是否选择正确。
- 检查仓库是否为 Public。
- 检查是否等待了足够的部署时间（通常 1~3 分钟）。

### 多人实时同步不生效？

- 检查 Firestore 规则是否已发布。
- 检查 `firebase-config.js` 中的配置是否正确。
- 打开浏览器开发者工具（F12）查看 Console 报错。

---

## 六、扩展建议

- 使用 Firebase Storage 存储更多背景音乐或头像资源。
- 添加 Firebase Authentication 匿名登录，防止昵称冲突。
- 接入 Firebase App Check，防止 API 被滥用。
- 增加节日限定特效、签到、成就等模块。
