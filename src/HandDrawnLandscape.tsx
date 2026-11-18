import { useId } from 'react'

// The picture stays vector-based so its crayon colors follow local time continuously.
const day = ['#99bfd3', '#bec482', '#afb77c', '#7c9a92']
const night = ['#56516f', '#9299ab', '#9385a3', '#656482']
export function landscapeNight(minutes: number) {
  if (minutes < 330 || minutes >= 1200) return 1
  if (minutes < 450) return (450 - minutes) / 120
  if (minutes < 1050) return 0
  return (minutes - 1050) / 150
}
function mix(a: string, b: string, amount: number) {
  const color = (v: string) => [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16))
  const left = color(a), right = color(b)
  return `rgb(${left.map((v, i) => Math.round(v + (right[i] - v) * amount)).join(',')})`
}

export function HandDrawnLandscape({ minutes, mirror }: { minutes: number; mirror: boolean }) {
  const id = `crayon-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const colors = day.map((color, i) => mix(color, night[i], landscapeNight(minutes)))
  const daylight = minutes >= 390 && minutes < 1110
  return <svg className="handdrawn-landscape" viewBox="0 0 600 450" aria-hidden="true" focusable="false">
    <defs>
      <filter id={`${id}-edge`} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".18" numOctaves="3" seed="12" result="roughness" />
        <feDisplacementMap in="SourceGraphic" in2="roughness" scale="4.6" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".22 .5" numOctaves="2" seed="25" />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 .98  0 0 0 0 .91  2.6 0 0 0 -1.1" />
      </filter>
      <pattern id={`${id}-wax`} width="97" height="83" patternUnits="userSpaceOnUse" patternTransform="rotate(-29)">
        {Array.from({ length: 58 }, (_, i) => {
          const x = (i * 47 + 9) % 97, y = (i * 29 + 4) % 83
          return <path key={i} d={`M${x} ${y}l${3 + i % 9} ${i % 2 ? '.8' : '-.5'}`} stroke="#fff5d8" strokeWidth={i % 3 === 0 ? 2 : 1} opacity={.24 + i % 4 * .09} strokeLinecap="round" />
        })}
      </pattern>
      <clipPath id={`${id}-window`}><path d="M1 2Q150 0 299 2T599 1L600 449Q450 447 300 450T0 449Z" /></clipPath>
    </defs>
    <g clipPath={`url(#${id}-window)`}>
      <path d="M0 0H600V450H0Z" fill={colors[0]} />
      <g transform={mirror ? 'translate(600 0) scale(-1 1)' : undefined} stroke="#533729" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-edge)`}>
        {daylight ? <path fill="#f4d77f" d="M170 102C171 132 150 151 123 151C95 152 75 133 74 106C72 79 92 58 119 57C147 55 169 75 170 102Z" /> : <path fill="#f4e4b2" d="M142 56C111 54 85 78 86 108C86 138 112 157 141 151C156 149 169 140 177 126C151 138 126 124 123 102C121 82 129 66 142 56Z" />}
        <path fill={colors[1]} d="M-15 294C35 288 64 265 104 247C148 227 173 220 211 237C245 253 265 279 303 291C363 313 431 287 481 271C525 256 574 267 615 294L617 465H-15Z" />
        <path fill={colors[2]} d="M-15 359C52 358 111 343 169 315C224 288 248 266 291 265C325 264 341 249 373 232C410 211 452 203 491 219C543 235 577 256 615 281L616 466H-15Z" />
        <path fill={colors[3]} d="M-15 366C35 351 79 324 121 325C170 325 200 346 238 361C280 378 311 393 351 386C397 379 428 349 474 338C520 326 564 336 615 348L617 465H-15Z" />
      </g>
      <path d="M0 0H600V450H0Z" fill={`url(#${id}-wax)`} />
      <path d="M0 0H600V450H0Z" filter={`url(#${id}-grain)`} opacity=".43" />
    </g>
  </svg>
}
