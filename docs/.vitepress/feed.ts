import path from 'node:path'
import { writeFileSync } from 'node:fs'
import { Feed } from 'feed'
import { createContentLoader, type SiteConfig } from 'vitepress'

// 构建结束后生成 dist/feed.xml（RSS 2.0），草稿 draft: true 不收录
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

  const posts = await createContentLoader('posts/**/*.md', {
    excerpt: true,
    render: true
  }).load()

  posts
    .filter((p) => p.frontmatter.draft !== true && p.frontmatter.date)
    .sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))
    .slice(0, 30)
    .forEach(({ url, frontmatter, html }) => {
      const link = encodeURI(`${site.hostname}${url}`)
      feed.addItem({
        title: frontmatter.title,
        id: link,
        link,
        description: frontmatter.description,
        content: html?.replaceAll('&ZeroWidthSpace;', ''),
        date: new Date(frontmatter.date),
        category: frontmatter.category ? [{ name: frontmatter.category }] : undefined
      })
    })

  writeFileSync(path.join(config.outDir, 'feed.xml'), feed.rss2())
}
