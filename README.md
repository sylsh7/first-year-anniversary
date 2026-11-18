# 和你在一起的第一年 · Happy Anniversary

使用 React、Vite 和 TypeScript 制作的七页周年纪念网页，采用米白皱纸、手工拼贴、相纸白边和柔和阴影。

## 本地运行

安装 Node.js 22 或更新版本，在项目目录运行：

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

打开 http://127.0.0.1:5174 。

```sh
npm run build
npm run preview
```

构建前会进行 TypeScript 检查；可部署文件位于 `dist/`。`node_modules/` 和 `dist/` 不提交到 Git。

## 七页互动

1. 点亮蜡烛，背景音乐淡入，再翻开相册。
2. 抽出、摇动显影、翻看背面留言，将五张照片挂到绳上。
3. 点击六个月份中圈出的日子阅读回忆。聊天截图支持放大与滚动；一周年通过模拟相机快门显示合照。
4. 抽券、刮开银色涂层，再揭晓其余奖励。
5. 拖动爱心滑块寻找西安中午 12:00；两座城市的时间和手绘风景同步变化，两个人物相遇。
6. 沿接缝划开两份包裹，再向两边打开箱盖，显示鼠标、牙刷及祝福纸条。
7. 揭开信封、抽出信纸；同一张纸正反两面承载全文，点击纸面进行自然翻转，左侧保留信封。

前进箭头按各页互动完成情况解锁，返回时保留本次打开期间的进度；刷新整站后重新开始。七页共用同一套固定在左右下角的手绘箭头。

## 修改文字和素材

所有日期、文字、操作提示和素材路径统一配置在 `src/content.ts`。

| 配置 | 内容 |
| --- | --- |
| `cover` | 首页背景、拼贴、蜡烛和入口 |
| `memories` | 第二页照片、照片背面留言与显影互动 |
| `calendar` | 第三页回忆、真实日期、照片、相机和相纸尺寸 |
| `coupons` | 第四页券面、奖励和刮券提示 |
| `sharedHours` / `longDistance` | 第五页日期、时区、目标时刻及城市信息 |
| `gift.parcels` | 第六页包裹素材、礼物和祝福；`blessingLines` 控制纸条分行 |
| `letter` | 第七页全文、信封、信纸和正反翻面设置 |
| `music` | 音乐路径、默认音量、淡入时间及暂停提示 |

照片与贴纸放在 `public/photos/`，字体放在 `public/fonts/`，背景音乐放在 `public/audio/`。素材均随项目保存，无需依赖外部图片、字体或音频服务。

照片保持原图比例完整显示。HEIC 的浏览器版本已转换为 JPEG；聊天截图保留 PNG，`preview: 'scroll'` 启用滚动阅读。

本地字体包括照片背面和信件使用的手写体，以及券面与礼物纸条使用的黄油面包体。

## 源码和发布

在线地址：https://sylsh7.github.io/first-year-anniversary/

GitHub Pages 从 `gh-pages` 分支发布网页；`main` 分支保存 React 源码。公开网页无需登录即可访问。

```sh
npm run build:pages
npm run publish:pages
```

`publish:pages` 会重新检查和构建项目，再将静态文件更新到 `gh-pages` 分支。需要本机已完成 GitHub 的 Git 登录。以后仍沿用同一个网页地址。

普通 `npm run build` 保留根路径，适用于 Sites 等其他托管；`build:pages` 会正确设置 GitHub Pages 的项目子路径，照片、字体和音乐均随构建部署。

`.openai/hosting.json` 保留原 Sites 项目的关联信息，方便后续更新同一个 Site。
