export type Photo = { src: string; alt: string; caption?: string; position?: string }
type Memory = Photo & { back: string }
type CalendarMemory = { date: string; title: string; text?: string; image: Photo; camera?: boolean }
type City = { name: string; shortName: string; english: string; latitude: number; longitude: number }

type Sticker = { id: string; alt: string; crop: [number, number, number, number]; outline?: string }

export const cover = {
  title: 'Happy Anniversary',
  background: { src: '/photos/collage-paper.jpg', alt: '保留褶皱和纸纤维的米白纸面' },
  image: { src: '/photos/childhood-polaroid.png', alt: '小时候一起吹蜡烛的拍立得，保留完整照片和原有白边' } as Photo | null,
  candle: { src: '/photos/candle-cutout.svg', alt: '一支带有蜡泪的独立蜡烛' },
  sheet: { src: '/photos/anniversary-sticker-sheet.png', width: 941, height: 1672 },
  titlePieces: [
    { crop: [240, 592, 460, 118], x: 155, y: 0, width: 460, height: 118 },
    { crop: [89, 710, 770, 130], x: 0, y: 110, width: 770, height: 130 },
  ],
  stickers: [
    { id: 'bouquet', alt: '带纸边的红色花束贴纸', crop: [688, 892, 249, 323] },
    { id: 'bow', alt: '红色蝴蝶结贴纸', crop: [373, 19, 226, 242] },
    { id: 'bears', alt: '相互拥抱的两只小熊贴纸', crop: [621, 0, 316, 293] },
    { id: 'always', alt: 'It’s me and you. Always.', crop: [280, 482, 390, 112], outline: 'M284 513 C294 488 343 482 394 488 C467 491 557 510 622 532 C664 546 676 558 654 576 C632 597 569 591 515 581 L337 550 C301 543 278 533 284 513 Z' },
    { id: 'stamp', alt: '粉色 LOVE 邮票', crop: [328, 267, 183, 186] },
    { id: 'heart-one', alt: '一颗小红心', crop: [291, 1188, 75, 77] },
    { id: 'heart-two', alt: '一颗小红心', crop: [485, 1125, 78, 82] },
  ] as Sticker[],
  lightHint: '点亮它',
  litLabel: '蜡烛已点亮',
  enterLabel: '点击拍立得，进入第二页',
}

export const memories = {
  title: '这些，你还记得吗？',
  background: cover.background,
  frame: { src: '/photos/heart-polaroid-frame.svg', alt: '带红心的纸质拍立得边框', width: 990, height: 1395, window: { left: '6.0606%', top: '4.2294%', width: '87.6768%', height: '79.9283%' } },
  sheet: { src: '/photos/memory-sticker-sheet.png', width: 941, height: 1672 },
  stickers: [
    { id: 'ps', alt: 'p.s. i love u 撕纸条', crop: [20, 32, 300, 132] },
    { id: 'watercolor-heart', alt: '深粉色水彩爱心', crop: [369, 228, 259, 222] },
    { id: 'flower-stamp', alt: '粉色花卉邮票', crop: [594, 802, 332, 260] },
  ] as Sticker[],
  clips: ['/photos/clothespin-1.svg?v=2', '/photos/clothespin-2.svg?v=2', '/photos/clothespin-3.svg?v=2'],
  paperLabel: '待显影的相纸',
  takeHint: '摇一摇',
  hangHint: '挂上去',
  progressLabel: '回忆显影进度',
  slotLabel: '绳上的空位',
  reviewLabel: '重看这张回忆',
  flipBack: '翻到背面，读留言',
  flipFront: '翻回正面',
  nextLabel: '进入第三页日历',
  photos: [
    { src: '/photos/IMG_7255.jpg', alt: '捧着第一次收到的鲜花', back: '第一次收到花。是你送的！' },
    { src: '/photos/IMG_7795.jpg', alt: '第一个520的惊喜', back: '第一个520，我给你的惊喜。\n你开心了好久好久。' },
    { src: '/photos/IMG_1315.jpg', alt: '第一次见奶龙的那天', back: '你第一次见奶龙。\n下大雨，我们都打不到车哈哈哈哈。' },
    { src: '/photos/IMG_2288.jpg', alt: '第一次去拍大头贴时的自拍', back: '我们第一次去拍大头贴。\n你在打车，我在臭美。' },
    { src: '/photos/IMG_2516.jpg', alt: '第一次陪你看比赛时的自拍', back: '第一次陪你去看比赛。\n我啥都看不懂，只能自拍。' },
  ] satisfies Memory[],
}

export const calendar = {
  label: '日历回忆',
  hint: '点一下圈起来的日子',
  initialMonth: '2025-08',
  weekdays: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  background: cover.background,
  paper: { src: '/photos/calendar-paper.png', alt: '复古夹子夹着错落的米色纸页与旧小票' },
  pin: { src: '/photos/calendar-pin.svg', alt: '红色图钉' },
  stamp: { src: '/photos/calendar-stamp.svg', alt: '粉色爱心邮票' },
  camera: { src: '/photos/calendar-camera.svg', alt: '银色复古数码相机' },
  shutter: '按下快门',
  captured: '一周年照片已拍好',
  nextLabel: '进入第四页',
  previousLabel: '返回第二页',
  items: [
    { date: '2025-08-16', title: '我们第一次加微信', text: '', image: { src: '/photos/calendar-2025-08-16.svg', alt: '我们第一次加微信的回忆照片（待替换）' } },
    { date: '2025-11-19', title: '我们在一起的那天', text: '', image: { src: '/photos/calendar-2025-11-19.svg', alt: '我们在一起那天的回忆照片（待替换）' } },
    { date: '2026-04-24', title: '我们终于见面的那天', text: '', image: { src: '/photos/calendar-2026-04-24.svg', alt: '我们终于见面那天的回忆照片（待替换）' } },
    { date: '2026-06-22', title: '我们一起去成都的那天', text: '', image: { src: '/photos/calendar-2026-06-22.svg', alt: '我们一起去成都的回忆照片（待替换）' } },
    { date: '2026-09-07', title: '我们分别的那天', text: '', image: { src: '/photos/calendar-2026-09-07.svg', alt: '我们分别那天的回忆照片（待替换）' } },
    { date: '2026-11-19', title: '今天！我们一周年的那天！', text: '', camera: true, image: { src: '/photos/calendar-2026-11-19.svg', alt: '拿着手写一周年快乐的新照片（待替换）' } },
  ] as CalendarMemory[],
}

export const longDistance = {
  label: '隔着太平洋',
  title: '两座城，一颗心',
  hint: '点一下地图上的心，看看它怎样连起两座城。',
  cities: [
    { name: '中国西安', shortName: '西安', english: 'XI’AN', latitude: 34.34, longitude: 108.94 },
    { name: '加拿大温哥华', shortName: '温哥华', english: 'VANCOUVER', latitude: 49.28, longitude: -123.12 },
  ] as [City, City],
  distance: '9,400',
  message: ['我们隔着 ', ' 公里，但我们的心一直在一起。'],
  ocean: '太 平 洋',
  heartButton: '点一下这颗心',
  connected: '这颗心把两座城连在一起了。',
}

export const sharedHours = {
  label: '时差手记',
  title: '我们都醒着的那几个小时',
  zones: { vancouver: 'America/Vancouver', xian: 'Asia/Shanghai' },
  date: '2026-11-07',
  dateReference: 'vancouver' as 'vancouver' | 'xian',
  initialTime: '04:00',
  call: { time: '23:00', reference: 'America/Vancouver' },
  message: '这个点，我们终于可以隔着屏幕见面了。',
  instruction: '拖动滑块，找到我们见面的时间。',
  slider: '调整时刻',
}

export const letter = {
  label: '祝福信',
  title: '写给你',
  hint: '拆开封蜡，把信拿到灯下读。',
  open: '拆开信',
  greeting: '亲爱的你：',
  paragraphs: [
    '回头看这一年，我记得的好多都是小事。比如路上看到什么会顺手拍给你，比如一顿饭明明吃完了，我们还坐在那里继续聊天。和你在一起之后，我越来越喜欢这些没有特别安排的时刻。',
    '一周年快乐。希望下一年我们还可以一起去想去的地方，也可以在没什么安排的周末，慢慢吃一顿饭。',
  ],
  signature: '爱你的我',
}

export const gift = {
  label: '最后一页',
  title: '有一份礼物，想让你亲手拆',
  hint: '先解开丝带，再掀开盒盖。',
  prompt: '我给你准备了一样东西。你来拆吧。',
  untie: '解开丝带',
  lift: '掀开盒盖',
  image: { src: '/photos/gift.svg', alt: '示例礼物照片，暖色桌布上的玫瑰色包装' } as Photo,
  note: '看到它的时候，我第一个想到你。',
}

export const ui = {
  album: '一周年纪念册',
  next: '下一页',
  previous: '上一页',
  close: '关闭预览',
  preview: '放大查看',
  localTime: '当地时间',
}

export const music = {
  src: '/audio/background-music.mp3',
  volume: 0.2,
  fadeInMs: 1800,
  pause: '暂停背景音乐',
  resume: '继续播放背景音乐',
}
