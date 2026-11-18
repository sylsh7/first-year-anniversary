import { useEffect, useRef, useState } from 'react'
import { letter } from './content'

export type Curl = { progress: number; direction: number; nx: number; ny: number }
const vertex = `
precision highp float;
attribute vec2 a_uv;
uniform vec2 u_size;
uniform vec2 u_canvas;
uniform vec2 u_normal;
uniform float u_progress;
uniform float u_direction;
varying vec2 v_uv;
varying float v_angle;
void main() {
  vec2 p = a_uv * u_size;
  if (u_direction < 0.0) p.x = u_size.x - p.x;
  vec2 n = normalize(u_normal);
  float radius = u_size.x * .072;
  float reach = dot(u_size, n) + 3.141593 * radius + 32.0;
  float distance = dot(u_size - p, n);
  float s = max(0.0, u_progress * reach - distance);
  float angle = min(3.141593, s / radius);
  float along = s < radius * 3.141593 ? radius * sin(angle) : -(s - radius * 3.141593);
  float z = radius * (1.0 - cos(angle));
  p += n * (along - s);
  if (u_direction < 0.0) p.x = u_size.x - p.x;
  float perspective = 1800.0 / (1800.0 - z);
  p = (p - u_size * .5) * perspective + u_size * .5;
  float exit = smoothstep(.87, 1.0, u_progress);
  p -= vec2(u_direction * u_size.x * 1.3, u_size.y * .8) * exit;
  p += vec2(u_size.x, 100.0);
  gl_Position = vec4(p.x / u_canvas.x * 2.0 - 1.0, 1.0 - p.y / u_canvas.y * 2.0, -z / 500.0, 1.0);
  v_uv = a_uv;
  v_angle = angle;
}`
const fragment = `
precision highp float;
uniform float u_progress;
uniform sampler2D u_front;
uniform sampler2D u_back;
varying vec2 v_uv;
varying float v_angle;
void main() {
  float side = cos(v_angle);
  vec4 paper = side >= 0.0 ? texture2D(u_front, v_uv) : texture2D(u_back, vec2(1.0-v_uv.x,v_uv.y));
  float light = .89 + .11 * abs(side);
  float shine = .12 * exp(-pow((v_angle - 1.12) * 2.9, 2.0));
  paper.rgb = paper.rgb * light + vec3(shine);
  paper.a *= 1.0 - smoothstep(.88, 1.0, u_progress);
  gl_FragColor = paper;
}`

function texture(gl: WebGLRenderingContext, source: HTMLCanvasElement) {
  const result = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, result)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
  return result
}
export function LetterCurlSurface({ width, height, parts, font, curl, active, onReady }: {
  width: number; height: number; parts: string[]; font: number; curl: Curl; active: boolean; onReady: (ready: boolean) => void
}) {
  const [ready, setReady] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const shadow = useRef<HTMLCanvasElement>(null)
  const paint = useRef<((state: Curl) => void) | null>(null)
  const current = useRef(curl); current.current = curl
  useEffect(() => {
    setReady(false); onReady(false)
    const node = canvas.current!, shade = shadow.current!
    const gl = node.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true })
    if (!gl) return
    let alive = true
    const resources: { program?: WebGLProgram; buffer?: WebGLBuffer; textures: WebGLTexture[]; shaders: WebGLShader[] } = { textures: [], shaders: [] }
    const scale = Math.min(2, devicePixelRatio || 1)
    const cw = width * 3, ch = height + 200
    node.width = shade.width = Math.round(cw * scale); node.height = shade.height = Math.round(ch * scale)
    const image = new Image(); image.src = letter.paper.src
    Promise.all([image.decode(), document.fonts.ready]).then(() => {
      if (!alive) return
      function paper(back: boolean) {
        const tex = document.createElement('canvas'); tex.width = width * 2; tex.height = height * 2
        const ctx = tex.getContext('2d')!; ctx.scale(2, 2)
        const [sx, sy, sw, sh] = letter.reading.paperCrop
        ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height)
        if (back) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = '#f6efdfc9'; ctx.fillRect(0, 0, width, height); return tex }
        ctx.font = `${font}px "Anniversary Chenmeizi"`; ctx.fillStyle = letter.ink; ctx.textBaseline = 'top'
        let y = height * .27
        for (const paragraph of parts) {
          let line = ''
          for (const char of paragraph) {
            if (ctx.measureText(line + char).width > width * .76 && line) { ctx.fillText(line, width * .12, y); y += font * letter.reading.lineHeight; line = char } else line += char
          }
          if (line) { ctx.fillText(line, width * .12, y); y += font * letter.reading.lineHeight }
          y += font * letter.reading.paragraphGap
        }
        return tex
      }
      const program = gl.createProgram()!; resources.program = program
      for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
        const shader = gl.createShader(type)!; resources.shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Paper surface shader')
        gl.attachShader(program, shader)
      }
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Paper surface link failed')
      gl.useProgram(program)
      const points: number[] = [], cols = 80, rows = 104
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const a = [x / cols, y / rows], b = [(x + 1) / cols, y / rows], c = [x / cols, (y + 1) / rows], d = [(x + 1) / cols, (y + 1) / rows]
        points.push(...a, ...b, ...c, ...b, ...d, ...c)
      }
      const buffer = gl.createBuffer()!; resources.buffer = buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)
      const location = gl.getAttribLocation(program, 'a_uv'); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0)
      for (const [index, source] of [paper(false), paper(true)].entries()) {
        gl.activeTexture(gl.TEXTURE0 + index); resources.textures.push(texture(gl, source))
        gl.uniform1i(gl.getUniformLocation(program, index ? 'u_back' : 'u_front'), index)
      }
      gl.uniform2f(gl.getUniformLocation(program, 'u_size'), width, height)
      gl.uniform2f(gl.getUniformLocation(program, 'u_canvas'), cw, ch)
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL)
      gl.viewport(0, 0, node.width, node.height)
      paint.current = state => {
        if (!alive) return
        gl.useProgram(program)
        gl.uniform1f(gl.getUniformLocation(program, 'u_progress'), state.progress)
        gl.uniform1f(gl.getUniformLocation(program, 'u_direction'), state.direction)
        gl.uniform2f(gl.getUniformLocation(program, 'u_normal'), state.nx, state.ny)
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, points.length / 2)
        // Cast the curled perimeter onto the page beneath, with a soft height-dependent shadow.
        const ctx = shade.getContext('2d')!; ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.clearRect(0, 0, cw, ch)
        const n = Math.hypot(state.nx, state.ny), nx = state.nx / n, ny = state.ny / n, r = width * .072
        const reach = width * nx + height * ny + Math.PI * r + 32
        function project(x: number, y: number) {
          if (state.direction < 0) x = width - x
          const s = Math.max(0, state.progress * reach - (width - x) * nx - (height - y) * ny)
          const angle = Math.min(Math.PI, s / r), z = r * (1 - Math.cos(angle))
          const along = s < Math.PI * r ? r * Math.sin(angle) : -(s - Math.PI * r)
          x += nx * (along - s); y += ny * (along - s)
          if (state.direction < 0) x = width - x
          return [width + x + z * .2, 100 + y + z * .25]
        }
        ctx.save(); ctx.filter = `blur(${7 + Math.sin(state.progress * Math.PI) * 9}px)`; ctx.globalAlpha = 1 - Math.max(0, (state.progress - .87) / .13); ctx.fillStyle = '#49332229'; ctx.beginPath()
        for (let side = 0; side < 4; side++) for (let i = 0; i <= 40; i++) {
          const t = i / 40, [x, y] = side === 0 ? [t * width, 0] : side === 1 ? [width, t * height] : side === 2 ? [(1 - t) * width, height] : [0, (1 - t) * height]
          const point = project(x, y); if (!side && !i) ctx.moveTo(point[0], point[1]); else ctx.lineTo(point[0], point[1])
        }
        ctx.closePath(); ctx.fill(); ctx.restore()
      }
      paint.current(current.current)
      setReady(true); onReady(true)
    }).catch(error => { if (alive) console.error('Letter curl preview:', error) })
    return () => { alive = false; paint.current = null; gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); shade.getContext('2d')?.clearRect(0, 0, shade.width, shade.height); for (const tex of resources.textures) gl.deleteTexture(tex); for (const shader of resources.shaders) gl.deleteShader(shader); if (resources.buffer) gl.deleteBuffer(resources.buffer); if (resources.program) gl.deleteProgram(resources.program) }
  }, [width, height, parts, font, onReady])
  useEffect(() => { paint.current?.(curl) }, [curl])
  return <div className="curl-surface" style={{ left: -width, top: -100, width: width * 3, height: height + 200, opacity: active && ready ? 1 : 0, visibility: active && ready ? 'visible' : 'hidden' }} aria-hidden="true">
    <canvas ref={shadow} /><canvas ref={canvas} />
  </div>
}
