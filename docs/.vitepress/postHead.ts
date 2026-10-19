import type MarkdownIt from 'markdown-it'
import { parseDate } from './date'

// 给 posts/ 下的文章注入杂志式文章头：
//   标题上方：栏目（分类）· 日期   —— kicker
//   标题下方：description 作为导语 + 标签
// 只读 frontmatter，不改 Markdown 源文件；没有 H1 的文章把文章头放在最前。
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

export function postHead(md: MarkdownIt) {
  md.core.ruler.push('post_head', (state) => {
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
    const i = toks.findIndex((t) => t.type === 'heading_open' && t.tag === 'h1')
    if (i >= 0) {
      const close = toks.findIndex((t, j) => j > i && t.type === 'heading_close')
      toks.splice(close + 1, 0, mk(stand))
      toks.splice(i, 0, mk(kicker))
    } else {
      toks.unshift(mk(kicker + `<h1 v-pre class="post-fallback-title">${esc(fm.title)}</h1>` + stand))
    }
  })
}
