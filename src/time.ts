const minute = 60_000
const formatters = new Map<string, Intl.DateTimeFormat>()

export function localTime(instant: number, zone: string) {
  let formatter = formatters.get(zone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    })
    formatters.set(zone, formatter)
  }
  const parts = Object.fromEntries(formatter.formatToParts(instant).map(({ type, value }) => [type, value]))
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    clock: `${parts.hour}:${parts.minute}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

// Locate calendar boundaries on the absolute timeline. This also handles 23- and 25-hour days.
export function dayStart(date: string, zone: string) {
  const utc = Date.parse(`${date}T00:00:00Z`) / minute
  let low = utc - 1440
  let high = utc + 1440
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (localTime(mid * minute, zone).date < date) low = mid + 1
    else high = mid
  }
  return low * minute
}

export function dayRange(date: string, zone: string) {
  const next = new Date(Date.parse(date) + 86_400_000).toISOString().slice(0, 10)
  const start = dayStart(date, zone)
  return { start, length: (dayStart(next, zone) - start) / minute }
}

export function initialOffset(start: number, length: number, zone: string, clock: string) {
  const target = clockMinutes(clock)
  for (let offset = 0; offset < length; offset++) {
    // If a spring-forward gap skips the requested time, use the first available time after it.
    if (localTime(start + offset * minute, zone).minutes >= target) return offset
  }
  return length - 1
}

function clockMinutes(clock: string) {
  const [hour, mins] = clock.split(':').map(Number)
  return hour * 60 + mins
}

export function offsetAtClock(start: number, length: number, zone: string, clock: string) {
  for (let offset = 0; offset < length; offset++) {
    if (localTime(start + offset * minute, zone).clock === clock) return offset
  }
  return null
}
