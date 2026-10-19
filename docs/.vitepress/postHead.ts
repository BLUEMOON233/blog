import type MarkdownIt from 'markdown-it'

// 给 posts/ 下的文章注入杂志式文章头：
//   标题上方：栏目（分类）· 日期   —— kicker
//   标题下方：description 作为导语 + 标签
// 只读 frontmatter，不改 Markdown 源文件；没有 H1 的文章把文章头放在最前。
const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  )

function fmtDate(raw: unknown) {
  const d = new Date(raw as string)
  if (isNaN(+d)) return ''
  return d.toISOString().slice(0, 10).replaceAll('-', '.')
}

export function postHead(md: MarkdownIt) {
  md.core.ruler.push('post_head', (state) => {
    const env = state.env as any
    const rel: string = env?.relativePath || ''
    const fm = env?.frontmatter || {}
    if (!rel.startsWith('posts/') || !fm.title) return

    const cat = fm.category
      ? `<a href="/pages/categories/${encodeURI(fm.category)}.html">${esc(fm.category)}</a>`
      : ''
    const date = fmtDate(fm.date)
    const kicker = `<div class="post-head kicker">${cat}${date ? `<time>${date}</time>` : ''}</div>`
    const tags = (Array.isArray(fm.tags) ? fm.tags : [])
      .map((t: string) => `<a href="/pages/tags/${encodeURI(String(t).toLowerCase())}.html">#${esc(t)}</a>`)
      .join('')
    const stand =
      fm.description || tags
        ? `<div class="post-standfirst">${fm.description ? `<p>${esc(fm.description)}</p>` : ''}${
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
      toks.unshift(mk(kicker + `<h1 class="post-fallback-title">${esc(fm.title)}</h1>` + stand))
    }
  })
}
