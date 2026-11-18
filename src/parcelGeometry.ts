export type Point = readonly number[]
export const midway = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
export const interpolate = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
export const polygonPath = (points: Point[]) => `M${points.map(p => p.join(' ')).join('L')}Z`
export const polygonClip = (points: Point[]) => `polygon(${points.map(p => `${p[0] / 10}% ${p[1] / 10}%`).join(',')})`
export function projectSeam(point: Point, start: Point, end: Point) {
  const dx = end[0] - start[0], dy = end[1] - start[1]
  const raw = ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)
  const t = Math.max(0, Math.min(1, raw))
  const nearest = interpolate(start, end, t)
  return { t, raw, distance: Math.hypot(point[0] - nearest[0], point[1] - nearest[1]) }
}
// Only join consecutive points that were both inside the generous seam corridor.
export function cutAlong(visited: boolean[], previous: number | null, next: number) {
  const result = [...visited], count = result.length
  const from = Math.max(0, Math.floor(Math.min(previous ?? next, next) * count) - 1)
  const to = Math.min(count - 1, Math.floor(Math.max(previous ?? next, next) * count) + 1)
  for (let i = from; i <= to; i++) result[i] = true
  return result
}
