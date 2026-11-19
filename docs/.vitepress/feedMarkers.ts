import type MarkdownIt from 'markdown-it'

// 给 posts/ 下的文章注入两个隐藏的空标记：开头一级标题之后一个，正文末尾一个。
// RSS（feed.ts）只截取两者之间的内容：不依赖 VitePress 输出的 HTML 结构，也不重复标题。
// 标记是 hidden 的空元素，不影响页面显示和搜索。改标记时要同步改 feed.ts。
export const FEED_START = '<div class="feed-start" hidden></div>'
export const FEED_END = '<div class="feed-end" hidden></div>'

// VitePress 2.0.0-alpha.21 起会对同一个 markdown-it 实例多次调用 markdown.config，每个实例只注册一次
const installed = new WeakSet<MarkdownIt>()

export function feedMarkers(md: MarkdownIt) {
  if (installed.has(md)) return
  installed.add(md)
  md.core.ruler.push('feed_markers', (state) => {
    // 只处理整篇正文；VitePress 渲染提示框标题等片段时走 renderInline，不能插进去
    if (state.inlineMode) return
    const rel: string = (state.env as any)?.relativePath || ''
    if (!rel.startsWith('posts/')) return

    const mk = (html: string) => {
      const t = new state.Token('html_block', '', 0)
      t.content = html + '\n'
      return t
    }
    const toks = state.tokens
    // 正文以一级标题开头时，开始标记放在标题之后（RSS 条目自带标题）
    const at = toks[0]?.type === 'heading_open' && toks[0].tag === 'h1'
      ? toks.findIndex((t) => t.type === 'heading_close') + 1
      : 0
    toks.splice(at, 0, mk(FEED_START))
    toks.push(mk(FEED_END))
  })
}
