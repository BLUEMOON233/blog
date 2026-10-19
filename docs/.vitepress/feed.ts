import path from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { Feed } from 'feed'
import { createContentLoader, type SiteConfig } from 'vitepress'
import { parseDate } from './date'

// 从构建好的 dist/posts/**.html 里取正文：.vp-doc 里的图片已是带 hash 的 /assets/xxx 地址。
// 结构为 <div class="vp-doc …"><div>正文</div></div></main>；匹配不到时返回 undefined，只输出摘要。
function readBuiltContent(outDir: string, url: string, hostname: string) {
  const file = path.join(outDir, url)
  if (!existsSync(file)) return undefined
  const html = readFileSync(file, 'utf-8')
  const m = html.match(/<div[^>]*class="vp-doc[^"]*"[^>]*><div>([\s\S]*)<\/div><\/div><\/main>/)
  if (!m) return undefined
  return m[1]
    // 去掉标题旁的空锚点和代码块的复制按钮
    .replace(/<a class="header-anchor"[^>]*>[\s\S]*?<\/a>/g, '')
    .replace(/<button title="[^"]*" class="copy">[\s\S]*?<\/button>/g, '')
    .replaceAll('&ZeroWidthSpace;', '')
    .replaceAll('​', '')
    // 根相对地址（/assets、/pages）在阅读器里没有 base 可解析，转成绝对地址；不碰 // 开头的协议相对地址
    .replace(/(href|src)="\/(?!\/)/g, `$1="${hostname}/`)
}

// 构建结束后生成 dist/feed.xml（RSS 2.0），草稿 draft: true 和没有有效 date 的文章不收录
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
      return p.frontmatter.draft !== true && published ? [{ ...p, published }] : []
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
