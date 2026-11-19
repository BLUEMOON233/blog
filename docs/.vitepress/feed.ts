import path from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { Feed } from 'feed'
import { createContentLoader, type SiteConfig } from 'vitepress'
import { parseDate } from './date.ts'
import { FEED_START, FEED_END } from './feedMarkers.ts'

// 从构建好的 dist/posts/**.html 里取正文（图片已是带 hash 的 /assets/xxx 地址）：
// 截取 feedMarkers.ts 注入的起止标记之间的内容，不含标题。找不到时打印警告，这篇只输出摘要。
const markerRe = (tag: string) => new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(' hidden>', '[^>]*>'))
const START_RE = markerRe(FEED_START)
const END_RE = markerRe(FEED_END)

function readBuiltContent(outDir: string, url: string, hostname: string) {
  const file = path.join(outDir, url)
  const html = existsSync(file) ? readFileSync(file, 'utf-8') : ''
  const start = html.match(START_RE)
  const end = start ? html.slice(start.index! + start[0].length).match(END_RE) : null
  if (!start || !end) {
    console.warn(`[feed] ${url}：没找到正文起止标记，RSS 里这篇只有摘要`)
    return undefined
  }
  const from = start.index! + start[0].length
  return html.slice(from, from + end.index!)
    // 去掉标题旁的空锚点和代码块的复制按钮
    // 只认 class，不管属性顺序和其他属性（VitePress 2.0.0-alpha.19 起复制按钮多了 data-copied）
    .replace(/<a\b[^>]*\bclass="header-anchor"[^>]*>[\s\S]*?<\/a>/g, '')
    .replace(/<button\b[^>]*\bclass="copy"[^>]*>[\s\S]*?<\/button>/g, '')
    .replaceAll('&ZeroWidthSpace;', '')
    .replaceAll('​', '')
    // 根相对地址（/assets、/pages）在阅读器里没有 base 可解析，转成绝对地址；不碰 // 开头的协议相对地址
    .replace(/(href|src)="\/(?!\/)/g, `$1="${hostname}/`)
}

// 构建结束后生成 dist/feed.xml（RSS 2.0），没有有效 date 的文章不收录
export async function genFeed(
  config: SiteConfig,
  site: { hostname: string; title: string; description: string }
) {
  const feed = new Feed({
    title: site.title,
    description: site.description,
    id: site.hostname,
    link: site.hostname,
    language: 'zh-CN',
    image: `${site.hostname}/logo.png`,
    favicon: `${site.hostname}/logo.png`,
    copyright: `© ${new Date().getFullYear()} BLUEMOON`,
    feedLinks: { rss: `${site.hostname}/feed.xml` }
  })

  // 只读 frontmatter；正文取构建产物，不再在这里不带 env 重新渲染 Markdown
  const posts = await createContentLoader('posts/**/*.md').load()

  posts
    .flatMap((p) => {
      const published = parseDate(p.frontmatter.date)
      return published ? [{ ...p, published }] : []
    })
    .sort((a, b) => +b.published - +a.published)
    .slice(0, 30)
    .forEach(({ url, frontmatter, published }) => {
      // url 是未编码的原始路径；逐段编码（encodeURI 不转义 #/?），首段为空串
      const link = site.hostname + url.split('/').map(encodeURIComponent).join('/')
      feed.addItem({
        title: frontmatter.title,
        id: link,
        link,
        description: frontmatter.description,
        content: readBuiltContent(config.outDir, url, site.hostname),
        date: published,
        category: frontmatter.category ? [{ name: frontmatter.category }] : undefined
      })
    })

  writeFileSync(path.join(config.outDir, 'feed.xml'), feed.rss2())
}
