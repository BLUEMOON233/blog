import type MarkdownIt from 'markdown-it'
import { parseDate } from './date.ts'

// 给 posts/ 下的文章注入杂志式文章头：
//   标题上方：栏目（分类）· 日期   —— kicker
//   标题下方：description 作为导语 + 标签
// 只读 frontmatter，不改 Markdown 源文件；正文不以一级标题开头时，自动用 title 补一个标题。
// 注入的 HTML 会被 Vue 当模板编译，外层一律加 v-pre，description/title 里的 {{ }} 不会被当插值执行。
const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  )

// 返回 YYYY-MM-DD（UTC）；date 缺失或无效时返回空串
function isoDate(raw: unknown) {
  return parseDate(raw)?.toISOString().slice(0, 10) ?? ''
}

// 路径段一律 encodeURIComponent：encodeURI 不转义 # 和 ?，“C#”这类标签会变成锚点
const seg = (s: unknown) => encodeURIComponent(String(s))

// 正文起止标记：RSS（feed.ts）只截取两者之间的内容，不带文章头，也不依赖 VitePress 输出的 HTML 结构。
// 隐藏的空元素，不影响页面显示和搜索。改这两个标记时要同步改 feed.ts。
export const FEED_START = '<div class="feed-start" hidden></div>'
export const FEED_END = '<div class="feed-end" hidden></div>'

// VitePress 2.0.0-alpha.21 起会对同一个 markdown-it 实例多次调用 markdown.config，
// 插件重复注册会让文章头插入两遍，这里每个实例只注册一次
const installed = new WeakSet<MarkdownIt>()

export function postHead(md: MarkdownIt) {
  if (installed.has(md)) return
  installed.add(md)
  md.core.ruler.push('post_head', (state) => {
    // 只处理整篇正文；VitePress 渲染提示框标题等片段时走 renderInline，不能把文章头插进去
    if (state.inlineMode) return
    const env = state.env as any
    const rel: string = env?.relativePath || ''
    const fm = env?.frontmatter || {}
    if (!rel.startsWith('posts/') || !fm.title) return

    const cat = fm.category
      ? `<a href="/pages/categories/${seg(fm.category)}.html">${esc(fm.category)}</a>`
      : ''
    const iso = isoDate(fm.date)
    const date = iso ? `<time datetime="${iso}">${iso.replaceAll('-', '.')}</time>` : ''
    const kicker = `<div v-pre class="post-head kicker">${cat}${date}</div>`
    const tags = (Array.isArray(fm.tags) ? fm.tags : [])
      .map((t: string) => `<a href="/pages/tags/${seg(String(t).toLowerCase())}.html">#${esc(t)}</a>`)
      .join('')
    const stand =
      fm.description || tags
        ? `<div v-pre class="post-standfirst">${fm.description ? `<p>${esc(fm.description)}</p>` : ''}${
            tags ? `<div class="post-tags">${tags}</div>` : ''
          }</div>`
        : ''

    const mk = (html: string) => {
      const t = new state.Token('html_block', '', 0)
      t.content = html + '\n'
      return t
    }
    const toks = state.tokens
    // 只有正文第一个元素是一级标题时才把它当文章标题；中途出现的 # 标题照常留在正文里
    if (toks[0]?.type === 'heading_open' && toks[0].tag === 'h1') {
      const close = toks.findIndex((t) => t.type === 'heading_close')
      toks.splice(close + 1, 0, mk(stand + FEED_START))
      toks.unshift(mk(kicker))
    } else {
      toks.unshift(mk(kicker + `<h1 v-pre class="post-fallback-title">${esc(fm.title)}</h1>` + stand + FEED_START))
    }
    toks.push(mk(FEED_END))
  })
}
