# 背景音乐目录

本目录用于存放《九尾天狐·星河祈愿》网页的背景音乐文件。

## 支持的格式

推荐：`.mp3`（兼容性最好，文件小）
可选：`.ogg`、`.wav`（部分浏览器支持有差异）

## 默认播放列表

页面默认会按顺序循环播放以下文件：

```text
music/
├── bgm1.mp3
├── bgm2.mp3
└── bgm3.mp3
```

## 在 GitHub 上如何上传音乐

### 方式一：网页端直接上传（推荐新手）

1. 打开你的 GitHub 仓库页面，例如 `https://github.com/你的用户名/tu-shan`
2. 点击进入 `music` 文件夹
3. 点击右上角的 **Add file > Upload files**
4. 把电脑里的 `bgm1.mp3`、`bgm2.mp3`、`bgm3.mp3` 拖入上传区域
5. 在下方的 **Commit changes** 区域填写提交信息，例如：
   ```text
   Add background music files
   ```
6. 点击 **Commit changes**
7. 等待 1~3 分钟，GitHub Pages 会自动重新部署
8. 刷新网页即可听到背景音乐

### 方式二：使用 Git 命令上传

```bash
# 进入项目目录
cd tu-shan

# 把音乐文件复制到 music 文件夹
cp /path/to/bgm1.mp3 music/
cp /path/to/bgm2.mp3 music/
cp /path/to/bgm3.mp3 music/

# 提交并推送
git add music/
git commit -m "Add background music files"
git push
```

## 如何修改播放列表

打开 `tushan-star.html`，找到音乐模块配置区：

```javascript
const playlist = [
  { name: '星河序曲', src: './music/bgm1.mp3' },
  { name: '狐影迷踪', src: './music/bgm2.mp3' },
  { name: '天狐祈愿', src: './music/bgm3.mp3' }
];
```

按你的文件名和歌曲名修改后提交即可。

## 注意事项

- 单个音乐文件建议控制在 **2MB~8MB** 以内，避免首次加载过慢
- GitHub 免费仓库有 1GB 的存储建议上限
- 音乐版权归上传者负责，请使用无版权或已获授权的音乐
- 若听不到声音，请检查浏览器是否阻止了自动播放，通常需要点击页面任意位置后才会开始
