# 第 03 页真实照片接入

2026-11-18，本地版本，未上传。

| 日期 | 原文件 | 项目文件 | 展示尺寸 |
| --- | --- | --- | --- |
| 2025-08-16 | Downloads/IMG_6032.PNG | public/photos/calendar-2025-08-16.png | 1206×2622 |
| 2025-11-19 | Downloads/IMG_6034.PNG | public/photos/calendar-2025-11-19.png | 1206×2622 |
| 2026-04-24 | Desktop/IMG_6891.HEIC | public/photos/calendar-2026-04-24.jpg | 1920×2560 |
| 2026-06-22 | Downloads/IMG_9503.HEIC | public/photos/calendar-2026-06-22.jpg | 1920×2560 |
| 2026-09-07 | Downloads/IMG_2960.HEIC | public/photos/calendar-2026-09-07.jpg | 1920×2560 |

- PNG 聊天截图保留原文件。HEIC 先用本机随附 libheif 解码为临时 PNG，再转换成 JPEG，长边 2560、质量 88；方向已烘焙成正确竖图，原文件不改动。
- 直接使用系统 sips 解码这些 HEIC 会输出黑图，已丢弃错误结果，最终文件逐张视觉确认正常。
- 路径、宽高、两张长图的 scroll 预览模式和滚动提示均配置于 src/content.ts。
- 相纸按配置尺寸初始化，再用 naturalWidth/naturalHeight 校准；图片 height:auto、object-fit:contain，完整显示。
- 聊天预览独立滚动，顶部关闭按钮常驻；两张都实际滚至 scrollTop≈964.5 / maximum=965。切换下一张从顶部打开，普通照片保留原有放大方式。
- 五条日期逐一点击检查：聊天图显示约 142×310，照片约 232×310（1280×720 窗口）；与原图比例一致。
- 最后一条一周年 SVG 占位、相机、闪光及快门不变。前五条点开后，快门前无下一页箭头，快门后显示进入第四页。
- TypeScript 检查与正式构建通过。新增图片已包含在 dist/photos，可随项目一起部署。
