import { PageArrow } from './PageArrow'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { calendar, type Photo } from './content'

const months = [...new Set(calendar.items.map(item => item.date.slice(0, 7)))].sort()
const entries = new Map(calendar.items.map(item => [item.date, item]))

// All calendar arithmetic is UTC: device timezone cannot move a day to another column.
function monthCells(month: string) {
  const [year, number] = month.split('-').map(Number)
  const start = new Date(Date.UTC(year, number - 1, 1)).getUTCDay()
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate()
  return Array.from({ length: Math.ceil((start + count) / 7) * 7 }, (_, i) => {
    const day = i - start + 1
    return day > 0 && day <= count ? day : null
  })
}

function shutterSound() {
  // Synthesized mechanical click; no microphone, camera or remote audio needed.
  try {
    const ctx = new AudioContext()
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * .14), ctx.sampleRate)
    const samples = buffer.getChannelData(0)
    for (let i = 0; i < samples.length; i++) {
      const t = i / ctx.sampleRate
      samples[i] = (Math.random() * 2 - 1) * (Math.exp(-t * 95) + .65 * Math.exp(-Math.abs(t - .065) * 180))
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = .13
    source.connect(gain).connect(ctx.destination)
    source.onended = () => { void ctx.close() }
    void ctx.resume().then(() => source.start()).catch(() => { void ctx.close() })
  } catch { /* Visual capture still works if audio is unavailable. */ }
}

export function CalendarMemories({ view, active, previous, next }: {
  view: (photo: Photo, trigger: HTMLButtonElement) => void
  active: boolean; previous: () => void; next: () => void
}) {
  const [month, setMonth] = useState(calendar.initialMonth)
  const [selected, setSelected] = useState<string>()
  const [seen, setSeen] = useState(() => new Set<string>())
  const [captured, setCaptured] = useState(false)
  const [shooting, setShooting] = useState(false)
  const [photoRatios, setPhotoRatios] = useState<Record<string, number>>({})
  const [ribbonSettled, setRibbonSettled] = useState(false)
  const entered = useRef(false)
  const timer = useRef<number>(undefined)
  const shootingLock = useRef(false)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  useLayoutEffect(() => {
    if (active) entered.current = true
    else if (entered.current) setRibbonSettled(true)
  }, [active])
  const memory = selected ? entries.get(selected) : undefined
  const done = calendar.items.every(item => seen.has(item.date))
  const [year, number] = month.split('-').map(Number)
  const cells = monthCells(month)

  function open(date: string) {
    setSelected(date)
    if (!entries.get(date)?.camera) setSeen(current => new Set(current).add(date))
  }
  function shoot() {
    if (!memory?.camera || captured || shootingLock.current) return
    shootingLock.current = true
    setShooting(true)
    shutterSound()
    const date = memory.date
    timer.current = window.setTimeout(() => {
      setCaptured(true)
      setSeen(current => new Set(current).add(date))
      setShooting(false)
      shootingLock.current = false
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 330)
  }

  const photo = memory && (!memory.camera || captured) ? memory.image : undefined
  return <section className="calendar-scene" aria-label={calendar.label}>
    <h2 className="sr-only" tabIndex={-1} id="calendar-title">{calendar.label}</h2>
    <div className="calendar-workspace">
      <div className="calendar-pile">
        <img className="calendar-heart-stamp" src={calendar.stamp.src} alt={calendar.stamp.alt} />
        <div className="calendar-tabs" role="group" aria-label={calendar.label}>
          {months.map((value, i) => <button key={value} className="paper-tab" style={{ top: `${20 + i * 11}%` }}
            aria-pressed={month === value} onClick={() => setMonth(value)}>
            <span>{value.slice(0, 4)}</span>{Number(value.slice(5))}月
          </button>)}
        </div>
        {months.map((value, i) => <div key={value} aria-hidden="true" className="month-paper-under"
          style={{ transform: `rotate(${(i - 2) * 1.7}deg) translate(${(i - 2) * 2}px, ${i * 2}px)` }} />)}
        <div className="calendar-front">
          <img className="calendar-paper-art" src={calendar.paper.src} alt={calendar.paper.alt} />
          <div className="calendar-turning-page" key={month}>
            <img className="calendar-leaf-art" src={calendar.paper.src} alt="" aria-hidden="true" />
            <div className="calendar-ink">
            <div className="calendar-month-title"><span>{year}</span><strong>{calendar.monthNames[number - 1]}</strong></div>
            <table className="paper-calendar">
              <caption className="sr-only">{year}年{number}月</caption>
              <thead><tr>{calendar.weekdays.map(day => <th scope="col" key={day}>{day}</th>)}</tr></thead>
              <tbody style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(0, 1fr))` }}>{Array.from({ length: cells.length / 7 }, (_, row) => <tr key={row}>
                {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                  const date = `${month}-${String(day).padStart(2, '0')}`
                  const entry = day && entries.get(date)
                  return <td key={col}>{entry ? <button className="paper-date" aria-label={`${date} ${entry.title}`}
                    aria-pressed={selected === date} onClick={() => open(date)}>{day}
                    <svg viewBox="0 0 52 48" aria-hidden="true" style={{ transform: `rotate(${number * 7 - 35}deg)` }}>
                      <path d="M43 11C31 0 9 6 5 22C0 39 19 46 34 40C49 35 52 18 40 9C32 3 16 3 10 12M9 37C2 30 5 15 17 8" />
                    </svg>
                  </button> : day}</td>
                })}
              </tr>)}</tbody>
            </table>
            </div>
          </div>
        </div>
        <span className={`calendar-ribbon ${active && !ribbonSettled ? 'ribbon-unfold' : ''}`} aria-hidden="true"
          onAnimationEnd={() => setRibbonSettled(true)} />
        <p className="paper-calendar-hint">{calendar.hint}</p>
      </div>
      <div className={`calendar-photo-area ${memory?.camera ? 'camera-memory' : ''}`}>
        {memory && <div className="paper-memory" key={memory.date}>
          {memory.camera && <div className={`anniversary-camera ${captured ? 'has-capture' : ''}`}>
            <img src={calendar.camera.src} alt={calendar.camera.alt} />
            <svg className="camera-display" viewBox="59 49 629 413" aria-hidden="true">
              <defs>
                <clipPath id="anniversary-screen-clip"><rect x="98" y="178" width="305" height="228" rx="1.5" /></clipPath>
                <filter id="anniversary-screen-grain" x="0" y="0" width="100%" height="100%">
                  <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
              </defs>
              <g clipPath="url(#anniversary-screen-clip)">
                <rect x="98" y="178" width="305" height="228" fill="#303e38" />
                <rect x="98" y="178" width="305" height="228" filter="url(#anniversary-screen-grain)" opacity=".12" />
                {captured && <image href={memory.image.src} x="98" y="178" width="305" height="228" preserveAspectRatio="xMidYMid meet" />}
                <path className="camera-viewfinder" d="M113 211v-18h23 M365 193h23v18 M113 373v18h23 M365 391h23v-18" />
                {shooting && <rect className="camera-flash" x="98" y="178" width="305" height="228" />}
              </g>
            </svg>
            <button className="camera-shutter" aria-label={calendar.shutter} disabled={captured || shooting}
              onClick={shoot} />
            {!captured && <span className="camera-hint">{calendar.shutter} ↙</span>}
          </div>}
          {photo && <div className={`pinned-memory ${memory.camera ? 'fresh-capture' : ''}`}>
            <figure className="calendar-photo-print" style={{ width: `min(100%, calc(${memory.camera ? calendar.capturedPhotoHeightVh : calendar.photoHeightVh}vh * ${photoRatios[photo.src] ?? (photo.width && photo.height ? photo.width / photo.height : 4 / 3)} + 24px))` }}>
              <button onClick={event => view(photo, event.currentTarget)} aria-label={photo.alt}>
                <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} onLoad={event => {
                  const image = event.currentTarget
                  if (!image.naturalWidth || !image.naturalHeight) return
                  const ratio = image.naturalWidth / image.naturalHeight
                  setPhotoRatios(current => current[photo.src] === ratio ? current : { ...current, [photo.src]: ratio })
                }} />
              </button>
              <img className="calendar-red-pin" src={calendar.pin.src} alt={calendar.pin.alt} />
            </figure>
            <div className="calendar-handwriting">
              <time dateTime={memory.date}>{memory.date.replaceAll('-', '.')}</time>
              <h3>{memory.title}</h3>
              {memory.text && <p>{memory.text}</p>}
            </div>
          </div>}
          <span className="sr-only" role="status">{memory.camera && captured ? calendar.captured : ''}</span>
        </div>}
      </div>
    </div>
    <PageArrow direction="previous" label={calendar.previousLabel} onClick={previous} />
    {done && <PageArrow direction="next" label={calendar.nextLabel} onClick={next} />}
  </section>
}
