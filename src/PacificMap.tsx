import { useEffect, useRef, useState } from 'react'
import { longDistance } from './content'

// Simplified Pacific coastlines in longitude/latitude, with longitudes unwrapped east of 180°.
const coastlines = [
  '85,76 202,76 193,70 185,67 188,65 177,64 180,61 173,61 170,59 164,61 163,58 158,56 162,54 160,51 156,51 155,55 157,57 155,59 151,59 146,59 142,57 137,54 137,49 140,47 135,45 132,43 130,42 129,40 126,38 125,35 127,35 126,38 124,39 121,40 122,37 119,37 120,34 122,31 121,29 119,26 117,24 113,22 110,21 109,21 107,20 106,18 108,16 109,13 108,11 105,9 103,11 102,13 100,13 100,9 103,4 104,1 101,2 98,8 98,12 96,15 94,16 92,21 90,22 88,22 86,20 85,19',
  '253,75 240,72 230,71 221,70 216,70 211,69 205,71 198,71 194,69 194,67 199,66 197,65 192,65 191,63 196,61 195,59 199,59 201,57 199,56 196,55 192,54 188,53 185,52 192,53 198,54 203,56 207,57 209,59 212,60 216,60 219,59 223,58 226,56 229,54 230,52 232,50 236,48 236,46 235,43 236,41 237,39 238,37 240,35 243,33 245,30 246,28 249,25 250,24 252,24 250,27 248,29 246,32 250,31 253,31 256,29 257,26 259,24 262,22 263,19 260,19 257,18 256,17 260,16 264,16 267,14 270,10 274,9 278,8 281,9 283,8 281,5 279,2 280,-3 282,-7 310,-8 310,75',
  '141,46 145,44 143,43 142,42 141,40 142,39 141,36 139,35 138,34 135,34 133,33 131,31 130,32 131,34 134,35 137,36 139,38 140,41 140,43',
  '121,25 122,24 121,22 120,22 120,24',
  '120,19 122,18 123,14 122,12 120,13 119,16',
  '123,12 125,12 126,9 125,6 123,7',
  '109,7 114,7 118,5 119,1 116,-3 111,-3 109,0',
  '96,5 100,3 104,-2 106,-5 105,-6 101,-4 98,0',
  '130,0 135,-1 139,-3 144,-4 149,-6 148,-8 141,-8 139,-6 136,-5 133,-4',
  '225,51 229,51 232,48 233,47 230,48 228,49',
  '202,22 204,21 205,20 204,19 203,20',
  '142,56 144,54 143,51 142,48 141,47 141,51',
]

function point(longitude: number, latitude: number) {
  const east = longitude < 0 ? longitude + 360 : longitude
  return [(east - 86) * 4.4, (73 - latitude) * 4.1]
}

const land = coastlines.map((outline) =>
  outline.split(' ').map((pair) => {
    const [lon, lat] = pair.split(',').map(Number)
    return point(lon, lat).join(',')
  }).join(' '),
)

export function PacificMap({ complete }: { complete: () => void }) {
  const [plays, setPlays] = useState(0)
  const [connected, setConnected] = useState(false)
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  function play() {
    window.clearTimeout(timer.current)
    setPlays(value => value + 1)
    function finish() {
      setConnected(true)
      setPlays(0)
      complete()
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish()
    else timer.current = window.setTimeout(finish, 1520)
  }
  const pins = longDistance.cities.map((city) => point(city.longitude, city.latitude))
  const [[x1, y1], [x2, y2]] = pins
  const mid = (x1 + x2) / 2
  const crest = Math.min(y1, y2) - 40
  const heartY = (y1 + y2) / 8 + crest * 0.75
  const route = `M ${x1} ${y1} C ${mid - 65} ${crest}, ${mid + 65} ${crest}, ${x2} ${y2}`

  return <div className="map-frame">
    <svg viewBox="0 0 760 315" role="img" aria-label={longDistance.cities.map(city => city.name).join(' ↔ ')}>
      <rect width="760" height="315" fill="#1b1a18" />
      <g fill="#302a25" stroke="#534337" strokeWidth="0.8">
        {land.map((outline) => <polygon key={outline} points={outline} />)}
      </g>
      <g stroke="#8d765f" opacity=".17">
        {[48, 99, 150, 201, 252, 303].map(y => <path key={y} d={`M0 ${y}H760`} />)}
        {[75, 163, 251, 339, 427, 515, 603, 691].map(x => <path key={x} d={`M${x} 0V315`} />)}
      </g>
      <text x="384" y="239" textAnchor="middle" className="ocean-label">{longDistance.ocean}</text>
      <path d={route} fill="none" stroke="#b09076" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 6" />
      {longDistance.cities.map((city, index) => {
        const [x, y] = pins[index]
        return <g key={`${city.name}-${plays}`} transform={`translate(${x} ${y})`}>
          <circle r="5.5" className={`city-pin ${plays ? "pin-active" : ""} ${connected ? "pin-connected" : ""}`} style={{ animationDelay: index ? ".82s" : "0s" }} />
          <text x={index === 0 ? 0 : 4} y="31" textAnchor="middle" className="pin-name">{city.name}</text>
          <text x={index === 0 ? 0 : 4} y="50" textAnchor="middle" className="pin-english">{city.english}</text>
        </g>
      })}
      {plays > 0 && <path key={plays} d={route} pathLength="1" className="map-travel" />}
    </svg>
    <button className="map-heart" style={{ left: `${mid / 760 * 100}%`, top: `${heartY / 315 * 100}%` }}
      onClick={play}>
      <span className={plays ? 'heart-beat' : ''} key={plays} aria-hidden="true">♥</span>
      <span>{longDistance.heartButton}</span>
    </button>
    <span className="sr-only" role="status">{connected && longDistance.connected}</span>
  </div>
}
