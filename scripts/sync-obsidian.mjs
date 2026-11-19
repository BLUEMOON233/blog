#!/usr/bin/env node
// 把 Obsidian 仓库里的笔记同步到 docs/posts/。
//
// 发布规则：顶层文件夹（论文、折腾、课程、项目……）里的笔记都会发布，分类就是顶层文件夹名；
// Inbox（草稿）、Attachments、模板目录和仓库根目录下的笔记不发布。
// 属性都可选：标题默认文件名，网址默认文件名（写了 slug 就用 slug），
// 正文不以一级标题开头时自动补一个（VitePress 默认主题不显示 frontmatter 的 title），
// 没写 date 的笔记第一次发布时，脚本会把当天日期写回笔记。
//
// Obsidian 仓库是文章的唯一源头：docs/posts/ 下的 .md 文件和 assets/ 目录完全由本脚本管理，
// 仓库里找不到来源的文章（挪回 Inbox、改了文件名或 slug、删除了笔记）会在同步时从博客删除。
// 站点页面（首页、关于、归档等）不在 docs/posts/ 下，不受影响。
//
// 用法：npm run sync -- [--vault <路径>] [--dry-run] [--yes] [--no-commit]
//   --vault      Obsidian 仓库路径，默认取环境变量 OBSIDIAN_VAULT，再默认 ~/Documents/Vault
//   --dry-run    只预览，不写入
//   --yes        跳过写入前的确认
//   --no-commit  只写文件，不提交
// 推送前总会再问一次；非交互环境下不推送。

import { parseArgs } from 'node:util'
import { execFileSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

const BLOG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const POSTS = path.join(BLOG, 'docs', 'posts')
const POSTS_REL = 'docs/posts'
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.bmp'])
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Obsidian 提示框类型 → VitePress 容器类型
const CALLOUT_MAP = {
  tip: 'tip', hint: 'tip', important: 'tip', success: 'tip', check: 'tip', done: 'tip',
  warning: 'warning', caution: 'warning', attention: 'warning',
  danger: 'danger', error: 'danger', bug: 'danger', failure: 'danger', fail: 'danger', missing: 'danger'
}

// 与 VitePress 默认的标题锚点规则一致（@mdit-vue/shared 的 slugify）
const rControl = /[\u0000-\u001f]/g
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g
const rCombining = /[\u0300-\u036F]/g
const slugify = (s) => s.normalize('NFKD').replace(rCombining, '').replace(rControl, '')
  .replace(rSpecial, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '')
  .replace(/^(\d)/, '_$1').toLowerCase()

// ---------- 参数 ----------

const { values: args } = parseArgs({
  options: {
    vault: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    yes: { type: 'boolean', default: false },
    'no-commit': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false }
  }
})
if (args.help) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 19).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'))
  process.exit(0)
}
const expandHome = (p) => (p.startsWith('~') ? path.join(homedir(), p.slice(1)) : p)
const VAULT = path.resolve(expandHome(args.vault || process.env.OBSIDIAN_VAULT || '~/Documents/Vault'))
if (!fs.existsSync(path.join(VAULT, '.obsidian'))) fail(`不是 Obsidian 仓库（没有 .obsidian 目录）：${VAULT}`)

function fail(msg) {
  console.error(`\x1b[31m✗ ${msg}\x1b[0m`)
  process.exit(1)
}
const toPosix = (p) => p.split(path.sep).join('/')

// ---------- 扫描仓库 ----------

// 模板目录里的笔记不参与发布，也不作为链接目标
let templateDir = null
try {
  const t = JSON.parse(fs.readFileSync(path.join(VAULT, '.obsidian', 'templates.json'), 'utf8'))
  if (t.folder) templateDir = t.folder.replace(/^\/+|\/+$/g, '')
} catch {}

const notes = [] // { rel, abs, base }
const files = [] // 附件 { rel, abs, base }
;(function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue
    const abs = path.join(dir, ent.name)
    const rel = toPosix(path.relative(VAULT, abs))
    if (ent.isDirectory()) {
      if (rel === templateDir) continue
      walk(abs)
    } else if (ent.isFile()) {
      const item = { rel, abs, base: ent.name }
      if (ent.name.endsWith('.md')) notes.push(item)
      else files.push(item)
    }
  }
})(VAULT)

// 按 Obsidian 的方式解析链接目标：完整路径、路径后缀或文件名；同名时优先同目录
function resolveIn(list, linkpath, fromRel, isNote) {
  const want = linkpath.replace(/^\/+/, '')
  const key = (f) => (isNote ? f.rel.slice(0, -3) : f.rel)
  const name = (f) => (isNote ? f.base.slice(0, -3) : f.base)
  let hits = want.includes('/')
    ? list.filter((f) => key(f) === want || key(f).endsWith('/' + want))
    : list.filter((f) => name(f) === want)
  if (!hits.length) {
    const lw = want.toLowerCase()
    hits = want.includes('/')
      ? list.filter((f) => key(f).toLowerCase() === lw || key(f).toLowerCase().endsWith('/' + lw))
      : list.filter((f) => name(f).toLowerCase() === lw)
  }
  if (hits.length <= 1) return hits[0] || null
  const dir = path.posix.dirname(fromRel)
  return hits.find((f) => path.posix.dirname(f.rel) === dir) || hits.sort((a, b) => a.rel.length - b.rel.length)[0]
}

const FM_RE = /^---\r?\n(?:([\s\S]*?)\r?\n)?---[ \t]*(?:\r?\n|$)/

function splitFrontmatter(src) {
  const m = src.match(FM_RE)
  if (!m) return { fm: {}, body: src }
  let fm
  try {
    fm = parseYaml(m[1] || '') || {}
  } catch (e) {
    return { fm: null, body: src, error: e.message.split('\n')[0] }
  }
  return { fm, body: src.slice(m[0].length) }
}

// 第一次发布时把日期写回笔记属性，以后文章日期和网址就固定了
function writeDateBack(abs, date) {
  const src = fs.readFileSync(abs, 'utf8')
  const m = src.match(FM_RE)
  const next = m
    ? `---\n${m[1] ? m[1] + '\n' : ''}date: ${date}\n---\n${src.slice(m[0].length)}`
    : `---\ndate: ${date}\n---\n${src}`
  fs.writeFileSync(abs, next)
}

// ---------- 收集要发布的笔记并校验 ----------

const SKIP_TOP = new Set(['Inbox', 'Attachments', templateDir].filter(Boolean))
const now = new Date()
const TODAY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
// 文件名当网址：空白换成连字符，去掉在网址或 Markdown 链接里有特殊含义的符号
const fileSlug = (name) => name.trim().replace(/\s+/g, '-').replace(/[#?%&+=;:,'"<>|\\^`[\]{}()!*$@~]/g, '')
  .replace(/-{2,}/g, '-').replace(/^[-.]+|-+$/g, '')

const errors = []
const warnings = []
const published = new Map() // note.rel → { note, meta, body, out, needsDate }

for (const note of notes) {
  const top = note.rel.split('/')
  if (top.length < 2 || SKIP_TOP.has(top[0])) continue
  const src = fs.readFileSync(note.abs, 'utf8')
  const { fm, body, error } = splitFrontmatter(src)
  if (error) {
    errors.push(`${note.rel}：属性 YAML 解析失败（${error}）`)
    continue
  }

  const e = []
  const str = (k) => (fm[k] == null ? '' : fm[k] instanceof Date ? fm[k].toISOString().slice(0, 10) : String(fm[k]).trim())
  const name = note.base.slice(0, -3)
  const title = str('title') || name
  const needsDate = !str('date')
  const date = str('date') || TODAY
  const slug = str('slug') || fileSlug(name)
  const description = str('description')
  if (!DATE_RE.test(date)) e.push(`date 应为 YYYY-MM-DD，现在是「${fm.date}」`)
  if (str('slug') && !SLUG_RE.test(slug)) e.push(`slug 只能用小写字母、数字和连字符，现在是「${fm.slug}」`)
  if (!slug) e.push('文件名里没有能当网址的字符，请改文件名或写 slug')
  let tags = fm.tags == null ? [] : Array.isArray(fm.tags) ? fm.tags : [fm.tags]
  tags = tags.filter((t) => t != null && String(t).trim()).map((t) => String(t).trim().replace(/^#/, ''))
  for (const t of tags) if (t.includes('/')) e.push(`标签「${t}」含有 /，博客的标签页地址会出错`)
  if (e.length) {
    errors.push(`${note.rel}：${e.join('；')}`)
    continue
  }
  const [y, m] = date.split('-')
  const meta = { title, date, category: top[0], tags }
  if (description) meta.description = description
  published.set(note.rel, { note, meta, body, out: `${y}/${m}/${slug}.md`, needsDate })
}

const byOut = new Map()
for (const p of published.values()) {
  const key = p.out.toLowerCase() // macOS 不区分大小写，只差大小写也算冲突
  if (byOut.has(key)) errors.push(`${p.note.rel} 和 ${byOut.get(key).note.rel} 都会发布到 posts/${p.out}，请改其中一篇的文件名或写 slug`)
  else byOut.set(key, p)
}

// ---------- 正文转换 ----------

// 只在代码之外做替换：按反引号切开一行，奇数段是行内代码
function mapOutsideInlineCode(line, fn) {
  let out = '', i = 0
  while (i < line.length) {
    const start = line.indexOf('`', i)
    if (start < 0) { out += fn(line.slice(i)); break }
    out += fn(line.slice(i, start))
    const run = line.slice(start).match(/^`+/)[0]
    const end = line.indexOf(run, start + run.length)
    if (end < 0) { out += line.slice(start); break }
    out += line.slice(start, end + run.length)
    i = end + run.length
  }
  return out
}

function convertBody(body, ctx) {
  const lines = body.replace(/\r\n/g, '\n').split('\n')
  return convertLines(lines, ctx).join('\n')
}

function convertLines(lines, ctx) {
  const out = []
  let fence = null // 当前代码块的围栏，如 ``` 或 ~~~~
  let inMath = false
  let inComment = false
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    if (fence) {
      out.push(line)
      if (line.trim().startsWith(fence) && line.trim().replace(/[`~]/g, '') === '') fence = null
      continue
    }
    if (inMath) {
      out.push(line)
      if (line.trim().endsWith('$$')) inMath = false
      continue
    }
    const f = line.match(/^\s*(`{3,}|~{3,})/)
    if (f && !inComment) {
      fence = f[1]
      out.push(line)
      continue
    }
    if (!inComment && line.trim().startsWith('$$') && !(line.trim().length > 2 && line.trim().endsWith('$$'))) {
      inMath = true
      out.push(line)
      continue
    }

    // Obsidian 注释 %%…%%，可跨行
    if (inComment) {
      const end = line.indexOf('%%')
      if (end < 0) continue
      inComment = false
      line = line.slice(end + 2)
      if (!line.trim()) continue
    }
    line = line.replace(/%%[\s\S]*?%%/g, '')
    const open = line.indexOf('%%')
    if (open >= 0) {
      inComment = true
      line = line.slice(0, open)
      if (!line.trim()) continue
    }

    // 提示框 > [!type] 标题 → ::: type 标题
    const c = line.match(/^>\s*\[!([\w-]+)\]([+-]?)\s*(.*)$/)
    if (c) {
      const inner = []
      while (i + 1 < lines.length && /^>/.test(lines[i + 1])) inner.push(lines[++i].replace(/^> ?/, ''))
      const kind = c[2] === '-' ? 'details' : CALLOUT_MAP[c[1].toLowerCase()] || 'info'
      const title = c[3] ? convertInline(c[3], ctx) : ''
      out.push(`::: ${kind}${title ? ' ' + title : ''}`, ...convertLines(inner, ctx), ':::')
      continue
    }

    out.push(mapOutsideInlineCode(line, (s) => convertInline(s, ctx)))
  }
  return out
}

function addAsset(file, ctx) {
  const dest = `${ctx.dir}/assets/${file.base}`
  const prev = ctx.assets.get(dest)
  if (prev && prev.abs !== file.abs && !fs.readFileSync(prev.abs).equals(fs.readFileSync(file.abs)))
    errors.push(`${ctx.note.rel}：附件 ${file.rel} 与 ${prev.rel} 同名，发布到同一个月份目录会冲突，请改名`)
  ctx.assets.set(dest, file)
  return /[\s()<>]/.test(file.base) ? `<assets/${file.base}>` : `assets/${file.base}`
}

function convertInline(s, ctx) {
  // Markdown 图片里指向仓库内文件的相对路径
  s = s.replace(/!\[([^\]]*)\]\((<[^>]+>|[^)\s]+)((?:\s+"[^"]*")?)\)/g, (all, alt, url, title) => {
    const raw = url.replace(/^<|>$/g, '')
    if (/^[a-z][a-z0-9+.-]*:|^\/|^#/i.test(raw)) return all
    let target
    try { target = decodeURI(raw) } catch { target = raw }
    const noteDir = path.posix.dirname(ctx.note.rel)
    const file =
      files.find((f) => f.rel === path.posix.normalize(path.posix.join(noteDir, target))) ||
      files.find((f) => f.rel === path.posix.normalize(target)) ||
      resolveIn(files, path.posix.basename(target), ctx.note.rel, false)
    if (!file) {
      errors.push(`${ctx.note.rel}：找不到图片 ${raw}`)
      return all
    }
    return `![${alt}](${addAsset(file, ctx)}${title})`
  })

  // 双链与嵌入 [[…]] / ![[…]]
  return s.replace(/(!?)\[\[([^\[\]\n]+?)\]\]/g, (all, bang, inner) => {
    const pipe = inner.search(/\\?\|/)
    let target = pipe < 0 ? inner : inner.slice(0, pipe)
    const alias = pipe < 0 ? '' : inner.slice(pipe).replace(/^\\?\|/, '').trim()
    const hash = target.indexOf('#')
    const linkpath = (hash < 0 ? target : target.slice(0, hash)).trim()
    const sub = hash < 0 ? '' : target.slice(hash + 1).split('#').pop().trim()
    const ext = path.posix.extname(linkpath).toLowerCase()

    if (bang && IMAGE_EXT.has(ext)) {
      const file = resolveIn(files, linkpath, ctx.note.rel, false)
      if (!file) {
        errors.push(`${ctx.note.rel}：找不到图片 ${linkpath}`)
        return all
      }
      const src = addAsset(file, ctx)
      const size = alias.match(/^(\d+)(?:x(\d+))?$/)
      const alt = size || !alias ? file.base.replace(/\.[^.]+$/, '') : alias
      if (!size) return `![${alt}](${src})`
      const plain = src.replace(/^<|>$/g, '')
      return `<img src="./${plain}" alt="${alt.replace(/"/g, '&quot;')}" width="${size[1]}"${size[2] ? ` height="${size[2]}"` : ''}>`
    }

    const subText = sub.replace(/^\^/, '')
    const label = (name) => alias || (sub ? (name ? `${name} › ${subText}` : subText) : name)
    if (!linkpath) {
      // [[#标题]]：本文内跳转
      return sub.startsWith('^') ? label('') : `[${label('')}](#${slugify(sub)})`
    }
    if (ext && ext !== '.md') {
      warnings.push(`${ctx.note.rel}：不支持${bang ? '嵌入' : '链接'}附件 ${linkpath}，已改成纯文字`)
      return label(path.posix.basename(linkpath))
    }
    const name = path.posix.basename(linkpath.replace(/\.md$/i, ''))
    const note = resolveIn(notes, linkpath.replace(/\.md$/i, ''), ctx.note.rel, true)
    if (!note) {
      warnings.push(`${ctx.note.rel}：链接目标「${linkpath}」不存在，已改成纯文字`)
      return label(name)
    }
    if (bang) warnings.push(`${ctx.note.rel}：不支持嵌入笔记 ${linkpath}，已改成${published.has(note.rel) ? '链接' : '纯文字'}`)
    const pub = published.get(note.rel)
    if (!pub) return label(name) // 未发布的笔记：只留文字
    const anchor = sub && !sub.startsWith('^') ? `#${slugify(sub)}` : ''
    return `[${label(name)}](/posts/${pub.out}${anchor})`
  })
}

const desired = new Map() // posts 下的相对路径 → { kind: 'md', content, from } | { kind: 'asset', abs, from }
const assetOwners = new Map()
for (const p of byOut.values()) {
  const ctx = { note: p.note, dir: path.posix.dirname(p.out), assets: assetOwners }
  let body = convertBody(p.body, ctx).replace(/^\s*\n/, '').replace(/\s*$/, '\n')
  // VitePress 默认主题的文章页不显示 frontmatter 的 title，正文没有一级标题时补上
  if (!/^#[ \t]/.test(body)) body = `# ${p.meta.title}\n\n${body}`
  const fm = stringifyYaml(p.meta, { lineWidth: 0 })
  desired.set(p.out, { kind: 'md', content: `---\n${fm}---\n\n${body}`, from: p.note.rel, title: p.meta.title })
}
for (const [dest, file] of assetOwners) desired.set(dest, { kind: 'asset', abs: file.abs, from: file.rel })

if (errors.length) {
  console.error('\x1b[31m以下问题需要先在 Obsidian 里改好，本次没有写入任何文件：\x1b[0m')
  for (const e of errors) console.error(`  ✗ ${e}`)
  process.exit(1)
}

// ---------- 与博客现状对比 ----------

const existing = new Map() // posts 下的相对路径 → 绝对路径（只收 .md 和 assets/ 里的文件）
;(function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue
    const abs = path.join(dir, ent.name)
    const rel = toPosix(path.relative(POSTS, abs))
    if (ent.isDirectory()) walk(abs)
    else if (rel.endsWith('.md') || rel.split('/').includes('assets')) existing.set(rel, abs)
  }
})(POSTS)

const plan = { add: [], update: [], remove: [] }
for (const [rel, d] of desired) {
  if (!existing.has(rel)) plan.add.push(rel)
  else {
    const cur = fs.readFileSync(existing.get(rel))
    const same = d.kind === 'md' ? cur.toString('utf8') === d.content : cur.equals(fs.readFileSync(d.abs))
    if (!same) plan.update.push(rel)
  }
}
for (const rel of existing.keys()) if (!desired.has(rel)) plan.remove.push(rel)
for (const k of Object.keys(plan)) plan[k].sort()

console.log(`Obsidian 仓库：${VAULT}`)
console.log(`博客：${BLOG}`)
console.log(`要发布的笔记：${byOut.size} 篇\n`)
for (const w of [...new Set(warnings)]) console.log(`\x1b[33m  ! ${w}\x1b[0m`)
if (warnings.length) console.log()

const total = plan.add.length + plan.update.length + plan.remove.length
const dated = [...byOut.values()].filter((p) => p.needsDate)
if (!total && !dated.length) {
  console.log('博客已经是最新的，没有需要同步的改动。')
  process.exit(0)
}
const show = (sym, color, rel) => {
  const d = desired.get(rel)
  console.log(`  \x1b[${color}m${sym} posts/${rel}\x1b[0m${d ? `  ← ${d.from}` : ''}`)
}
if (plan.add.length) { console.log('新增：'); plan.add.forEach((r) => show('+', 32, r)) }
if (plan.update.length) { console.log('更新：'); plan.update.forEach((r) => show('~', 36, r)) }
if (plan.remove.length) { console.log('删除（仓库里没有对应来源）：'); plan.remove.forEach((r) => show('-', 31, r)) }
if (dated.length) {
  console.log(`第一次发布，会在笔记属性里写上日期 ${TODAY}：`)
  dated.forEach((p) => console.log(`  ${p.note.rel}`))
}
console.log()

if (args['dry-run']) process.exit(0)

// ---------- 写入 ----------

const git = (...a) => execFileSync('git', a, { cwd: BLOG, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
let isGit = false
try { isGit = git('rev-parse', '--is-inside-work-tree') === 'true' } catch {}
if (isGit && !args['no-commit']) {
  if (git('status', '--porcelain', '--', POSTS_REL))
    fail(`${POSTS_REL} 有未提交的改动。文章应该只在 Obsidian 里改：先提交或还原这些改动（git status ${POSTS_REL}），再同步。`)
  try { git('diff', '--cached', '--quiet') } catch {
    fail('暂存区里有别的改动，同步的提交会把它们一起带上。先提交或取消暂存（git restore --staged .），再同步。')
  }
}

const interactive = process.stdin.isTTY && process.stdout.isTTY
async function ask(q) {
  if (!interactive) return false
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const a = await rl.question(q)
  rl.close()
  return /^y(es)?$/i.test(a.trim())
}
if (!args.yes && !(await ask('确认写入？[y/N] '))) {
  console.log(interactive ? '已取消。' : '非交互环境下需要加 --yes 才会写入。')
  process.exit(0)
}

// 先删后写：macOS 默认不区分大小写，DONUT.md → donut.md 这类改名若先写后删，会把新写的文件一起删掉
for (const p of dated) writeDateBack(p.note.abs, p.meta.date)
for (const rel of plan.remove) fs.rmSync(existing.get(rel))
for (const rel of [...plan.add, ...plan.update]) {
  const d = desired.get(rel)
  const abs = path.join(POSTS, ...rel.split('/'))
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  // 先写临时文件再改名：中途出错不会留下半个文件
  const tmp = path.join(path.dirname(abs), `.sync-${process.pid}.tmp`)
  if (d.kind === 'md') fs.writeFileSync(tmp, d.content)
  else fs.copyFileSync(d.abs, tmp)
  fs.renameSync(tmp, abs)
}

// 清理空目录（只剩 .DS_Store 的也算空）
;(function prune(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) if (ent.isDirectory()) prune(path.join(dir, ent.name))
  const left = fs.readdirSync(dir)
  if (dir !== POSTS && left.every((n) => n === '.DS_Store')) fs.rmSync(dir, { recursive: true })
})(POSTS)
console.log('已写入。')

// ---------- 提交与推送 ----------

if (!isGit || args['no-commit']) process.exit(0)
// 显式移出旧路径：不区分大小写时，git 认不出只改了大小写的重命名，add -A 会把新内容记在旧文件名上
const removed = plan.remove.map((r) => `${POSTS_REL}/${r}`)
for (let i = 0; i < removed.length; i += 100) git('rm', '-q', '--cached', '--ignore-unmatch', '--', ...removed.slice(i, i + 100))
git('add', '-A', '--', POSTS_REL)
try {
  git('diff', '--cached', '--quiet', '--', POSTS_REL)
  process.exit(0) // 没有实际改动
} catch {}
const md = (list) => list.filter((r) => r.endsWith('.md'))
const [a, u, r] = [md(plan.add), md(plan.update), md(plan.remove)]
let msg
if (a.length === 1 && !u.length && !r.length) msg = `post: 发布 ${desired.get(a[0]).title}`
else if (!a.length && u.length === 1 && !r.length) msg = `post: 更新 ${desired.get(u[0]).title}`
else if (a.length + u.length + r.length === 0) msg = 'posts: 同步附件'
else msg = `posts: 从 Obsidian 同步（${[a.length && `新增 ${a.length}`, u.length && `更新 ${u.length}`, r.length && `删除 ${r.length}`].filter(Boolean).join('，')} 篇）`
// 不带路径提交：写入前已确认暂存区里没有别的改动；带路径的 commit 会按旧文件名重新读取工作区
git('commit', '-q', '-m', msg)
console.log(`已提交：${msg}`)

if (await ask('推送到远端？[y/N] ')) {
  execFileSync('git', ['push'], { cwd: BLOG, stdio: 'inherit' })
} else {
  console.log('未推送，需要时运行 git push。')
}
