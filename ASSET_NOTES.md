# 第三页素材

使用内置 imagegen，不使用 CLI/API。项目内最终素材：

- `public/photos/calendar-paper.png`：参考 `_ (8).jpeg` 提取夹子、空白纸页、花与旧小票；October、星期和日期数字全部移除，由 HTML 生成真实年月。
- `public/photos/calendar-decorations.png`：参考 `_ (9).jpeg` 提取红色图钉及左下角粉色爱心邮票，透明背景。`calendar-pin.svg` 和 `calendar-stamp.svg` 为引用这张素材表的独立嵌入裁切图。
- `public/photos/calendar-camera-source.jpg` / `calendar-camera.svg`：保留 `_ (10).jpeg` 原始相机，SVG 精确裁去外围白底。imagegen 的相机试稿改变了原始细节，因此最终使用原图轮廓裁切。
- `public/photos/calendar-YYYY-MM-DD.svg`：本地中性风景占位图，等待用户提供六条真实照片。

## 最终 imagegen 提示词

### Calendar
Use case: background-extraction / precise-object-edit. Edit the attached calendar collage into a website asset. Preserve the original dark teal vintage metal clip, all layered aged cream paper sheets and vintage yellow receipt behind them, original material texture, proportions and little red flower. REMOVE ONLY all October lettering, all weekday letters and all calendar date numbers from the front sheet, seamlessly fill those areas with the matching blank paper texture. Keep front sheet blank for HTML overlay. Remove outer white background completely to true transparency. Tight framing around entire collage, no new elements, no added shadow beyond subtle contact shadows already between papers. Do not alter the clip.

### Pin and stamp
Use case: background-extraction. Extract ONLY the red pushpin in the lower middle and the pink heart postage stamp in the bottom LEFT from this sticker sheet. Preserve their original texture, colors, shapes and details. Delete every other element and all exterior white background to real transparency. Place red pin alone in left half, pink heart stamp alone in right half of a wide transparent asset sheet, separated with generous empty transparent space; both fully visible uncropped, no overlap. Keep white/beige paper INSIDE the stamp, remove only background OUTSIDE its torn edge. No text additions.

### Camera trial (unused)
Use case: background-extraction. Extract this exact vintage silver Canon compact digital camera rear view. Preserve original camera shape, labels, controls, metal texture, top shutter button and original proportions exactly. Remove exterior white background to true transparency. Also make the rectangular white LCD display interior transparent, preserving the black screen border, for a website photo insert. No invented parts, no restyling, tightly framed with a small transparent margin.
