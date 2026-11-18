export type Photo = { src: string; alt: string; caption?: string; position?: string; width?: number; height?: number; preview?: 'scroll' }
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
  nextLabel: '进入第二页',
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
  photoHeightVh: 57,
  capturedPhotoHeightVh: 39,
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
    { date: '2025-08-16', title: '我们第一次加微信', text: '', image: { src: '/photos/calendar-2025-08-16.png', alt: '我们第一次加微信的聊天记录', width: 1206, height: 2622, preview: 'scroll' } },
    { date: '2025-11-19', title: '我们在一起的那天', text: '', image: { src: '/photos/calendar-2025-11-19.png', alt: '我们在一起那天的聊天记录', width: 1206, height: 2622, preview: 'scroll' } },
    { date: '2026-04-24', title: '我们终于见面的那天', text: '', image: { src: '/photos/calendar-2026-04-24.jpg', alt: '我们终于见面那天的照片', width: 1920, height: 2560 } },
    { date: '2026-06-22', title: '我们一起去成都的那天', text: '', image: { src: '/photos/calendar-2026-06-22.jpg', alt: '我们一起去成都那天的照片', width: 1920, height: 2560 } },
    { date: '2026-09-07', title: '我们分别的那天', text: '', image: { src: '/photos/calendar-2026-09-07.jpg', alt: '我们分别那天的照片', width: 1920, height: 2560 } },
    { date: '2026-11-19', title: '今天！我们一周年的那天！', text: '', camera: true, image: { src: '/photos/calendar-2026-11-19.jpg', alt: '我们和蛋糕的一周年合照', width: 1532, height: 1027 } },
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
  dateReference: 'xian' as 'vancouver' | 'xian',
  initialTime: '00:00',
  call: { time: '12:00', reference: 'Asia/Shanghai', snapMinutes: 9 },
  message: '这个点，我们终于可以隔着屏幕见面了。',
  instruction: '拖动滑块，找到我们见面的时间。',
  slider: '调整时刻',
  sliderHeart: { src: '/photos/slider-heart.svg', width: 32, height: 31, targetOpacity: .22 },
  people: {
    girl: { src: '/photos/hours-girl-sticker.png', alt: '捧着小红心的女孩贴纸' },
    boy: { src: '/photos/hours-boy-sticker.png', alt: '捧着小红心的男孩贴纸' },
    approachMinutes: 240,
    revealMs: 1900,
  },
}

export const letter = {
  label: '祝福信',
  title: '写给你',
  openHint: '拆开看看',
  pullHint: '把信拿出来',
  openLabel: '揭起爱心，打开信封',
  pullLabel: '拖住纸角，把信拿出来',
  previous: '返回第六页拆礼物',
  previousSheet: '上一张信纸',
  nextSheet: '下一张信纸',
  readingNavigation: '翻看信纸',
  pageLabel: '第 {n} 张信纸',
  ink: '#985968',
  reading: {
    paperCrop: [45, 55, 998, 1355],
    fontPx: 18, lineHeight: 1.58, paragraphGap: .48, flipMs: 800,
    toBack: '轻点翻到背面', toFront: '轻点翻回正面',
  },
  openMs: 900,
  extractMs: 850,
  clearEnvelopeMs: 700,
  pullDistance: 42,
  envelope: {
    src: '/photos/letter-envelope.png', width: 1374, height: 1145, crop: [125, 140, 1110, 890],
    flapClip: 'polygon(1.8% 34.3%,80.6% 2.7%,50.9% 57.3%)',
    hinge: [18, 343, 806, 27],
  },
  openEnvelope: {
    src: '/photos/letter-envelope-open.jpeg', width: 736, height: 1104, crop: [65, 235, 610, 635],
    outline: 'M76 573Q85 532 125 463L211 299Q239 244 263 248L548 383Q565 390 573 414L658 658Q665 676 649 684L202 853Q185 862 175 839L79 593Q74 582 76 573Z',
    pocket: 'M76 573L308 607Q302 593 307 578Q301 553 332 560L351 568Q367 527 393 536Q428 536 416 578L551 385Q565 390 573 414L658 658Q665 676 649 684L202 853Q185 862 175 839L79 593Z',
    slot: 'M75 578L550 385L660 670L190 853Z M-1000 -1000H2000V-205L-1000 1014Z',
    paperX: 176, paperY: 580, paperWidth: 300, paperHeight: 400,
    pullTravel: 510,
  },
  paper: { src: '/photos/letter-paper.png', aspect: 1087 / 1446, alt: '保留蝴蝶结、上下装饰与折痕的米白信纸' },
  heart: { src: '/photos/letter-heart.png', alt: '粉色水彩爱心封贴' },
  paragraphs: [
    '嘿嘿，老公，没想到我的惊喜是这个吧！不要太感动哟！在这里感谢gpt老师，没有它我是根本做不出来的。总之，这个网站还有很多很多可以改进的地方，我也还有很多想法都没有实现。但是我这个拖延症，一直拖拖拖到最后才开始，还好最后的成品不错，嘿嘿！',
    '这一年真的过得好快好快！一眨眼，我们都在一起一年了呢！还记得我们在一起前，我说过感觉谈一年的情侣好牛逼啊，没想到咱俩竟然这么快也一年啦！这一年，我们俩共同度过了许多时光，不管是开心的、难过的、生气的，都是我们俩共同的回忆，现在想想都觉得幸福呢！',
    '这一年，我们俩也克服了许多困难，尤其是异国恋。唉，我真的好讨厌异国恋啊！我讨厌异国恋一百次，但是我爱你一百零一次。',
    '我希望我们俩的第二年，每个人都可以平平安安、万事胜意，不管在有没有对方的地方。还有，记得少气我一点！',
    '关于礼物，本来都说好不送外设了，但是我真的想不到其他的了！牙刷是我想送的，鼠标是你想要的。有了新鼠标，不可以天天打游戏不陪我哦！',
    '最后的最后，我想说，和你一起打游戏很开心，你打游戏夸我我也很开心，和你一起吃饭很开心，和你聊天也很开心，和你打电话很开心，给你分享抖音视频很开心，给你买东西很开心，你关心我我也开心，连你睡着了，我自己给你发消息我都很开心。',
    '谢谢你的出现，谢谢你喜欢我，我爱你！',
  ],
}

export const gift = {
  label: '拆礼物',
  cutHint: '沿着这条线划开',
  openHint: '向两边打开',
  previous: '返回第五页',
  next: '进入第七页祝福信',
  zoom: '放大查看',
  cutLabel: '沿接缝划开{parcel}胶带',
  leftLabel: '向左打开{parcel}左侧箱盖',
  rightLabel: '向右打开{parcel}右侧箱盖',
  revealMs: 1450,
  cutTolerancePx: 46,
  cutThreshold: .68,
  cutSegments: 48,
  flapDragPx: 34,
  unfoldMs: 550,
  note: { src: '/photos/parcel-note.png', alt: '粉色波浪边祝福纸条' },
  parcels: [
    {
      id: 'mouse', label: '大包裹',
      art: { src: '/photos/parcel-large.png', width: 1254, height: 1254, crop: [180, 185, 865, 865] },
      corners: [[370, 23], [970, 150], [620, 283], [23, 168]],
      bodyClip: 'polygon(2.3% 16.8%, 62% 28.3%, 97% 15%, 97% 82.1%, 61.7% 98.3%, 1.2% 87.3%)',
      opening: 'M23 168L370 23L970 150L620 283Z',
      image: { src: '/photos/parcel-mouse.svg?v=2', alt: '蓝色卡通游戏鼠标' } as Photo,
      blessing: '送给世界上打三角洲最厉害的男人',
      blessingLines: ['送给世界上', '打三角洲最厉害的男人'],
    },
    {
      id: 'toothbrush', label: '小包裹',
      art: { src: '/photos/parcel-small.png', width: 1536, height: 1024, crop: [190, 80, 1150, 880] },
      corners: [[443, 17], [978, 281], [541, 632], [24, 324]],
      bodyClip: 'polygon(2.4% 32.4%, 54.1% 63.2%, 97.8% 28.1%, 98.3% 59.1%, 55.6% 97.2%, 2.4% 62.5%)',
      opening: 'M24 324L443 17L978 281L541 632Z',
      image: { src: '/photos/parcel-toothbrush.png', alt: '黄色卡通电动牙刷' } as Photo,
      blessing: '记得好好刷牙哦！',
      blessingLines: ['记得好好刷牙哦！'],
    },
  ],
}

export const ui = {
  album: '一周年纪念册',
  next: '下一页',
  previous: '上一页',
  close: '关闭预览',
  preview: '放大查看',
  scrollPhotoHint: '向下滚动，阅读完整聊天记录',
  localTime: '当地时间',
}

export const music = {
  src: '/audio/background-music.mp3',
  volume: 0.2,
  fadeInMs: 1800,
  pause: '暂停背景音乐',
  resume: '继续播放背景音乐',
}

export const coupons = {
  label: '凭感觉抽一张券',
  drawHint: '凭感觉，抽一张。',
  scratchHint: '刮开看看',
  reveal: '看看你错过了什么',
  backLabel: '未揭晓的券',
  chooseLabel: '抽取第 {n} 张券',
  scratchLabel: '按住鼠标涂抹，刮开银色涂层',
  scratchThreshold: .6,
  revealIntervalMs: 500,
  font: { family: 'Butter Bread', src: '/fonts/ButterBread.ttf', status: 'user-provided' },
  background: cover.background,
  heart: { sheet: cover.sheet, crop: [291, 1188, 75, 77] as [number, number, number, number] },
  previous: '返回第三页', next: '进入第五页',
  cards: [
    { id: 'peace', title: '和好券', reward: '凭此券可以马上和好。', rewardLines: ['凭此券可以', '马上和好。'], face: '/photos/coupon-pink.png', sticker: null, color: '#b96a83' },
    { id: 'game', title: '游戏券', reward: '凭此券一天内可以不限时打游戏。', rewardLines: ['凭此券一天内可以', '不限时打游戏。'], face: '/photos/coupon-green.png', sticker: '/photos/coupon-controller.png', color: '#789788' },
    { id: 'ammo', title: 'awm子弹券', reward: '凭此券可以兑换520发aw子弹。', rewardLines: ['凭此券可以兑换', '520发aw子弹。'], face: '/photos/coupon-orange.png', sticker: '/photos/coupon-ammo.png', color: '#c28a59' },
    { id: 'wish', title: '万能券', reward: '凭此券可以兑换一个愿望。', rewardLines: ['凭此券可以兑换', '一个愿望。'], face: '/photos/coupon-purple.png', sticker: '/photos/coupon-gift.png', color: '#9e80af' },
  ],
}
