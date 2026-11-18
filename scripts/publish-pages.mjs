import { spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const project = fileURLToPath(new URL('../', import.meta.url))
function run(command, args, cwd = project, capture = false) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})${capture ? `: ${result.stderr}` : ''}`)
  return capture ? result.stdout.trim() : ''
}
run(process.execPath, [resolve(project, 'node_modules/typescript/bin/tsc'), '--noEmit'])
run(process.execPath, [resolve(project, 'node_modules/vite/bin/vite.js'), 'build', '--base=/first-year-anniversary/'])
const remote = run('git', ['remote', 'get-url', 'origin'], project, true)
const name = run('git', ['log', '-1', '--format=%an'], project, true)
const email = run('git', ['log', '-1', '--format=%ae'], project, true)
const deploy = mkdtempSync(join(tmpdir(), 'anniversary-pages-'))
cpSync(resolve(project, 'dist'), deploy, { recursive: true })
writeFileSync(join(deploy, '.nojekyll'), '')
run('git', ['init', '--quiet', '-b', 'gh-pages'], deploy)
run('git', ['remote', 'add', 'origin', remote], deploy)
if (run('git', ['ls-remote', '--heads', 'origin', 'gh-pages'], deploy, true)) {
  run('git', ['fetch', '--quiet', '--depth=1', 'origin', 'gh-pages'], deploy)
  run('git', ['reset', '--mixed', 'FETCH_HEAD'], deploy)
}
run('git', ['add', '--all'], deploy)
const unchanged = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: deploy }).status === 0
if (!unchanged) run('git', ['-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '--quiet', '-m', 'Publish anniversary website'], deploy)
run('git', ['push', '--porcelain', 'origin', 'gh-pages'], deploy)
console.log('Published branch: gh-pages')
