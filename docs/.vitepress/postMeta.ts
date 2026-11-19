import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { parseDate } from './date.ts'

// 在 Node 里直接读文章的 frontmatter。用在两个 createContentLoader 用不了的地方：
// - 分类 / 标签的动态路由（[category].paths.ts、[tag].paths.ts）：它们在 VitePress 解析配置时加载，
//   这时配置还没解析完，createContentLoader 会报错（VitePress 2.0.0-alpha.19 起）；
// - config.mts 的 transformPageData：计算上一篇 / 下一篇。
// 规则与 posts.data.ts 一致：跳过没有有效 date 的文章；排序为日期从新到旧，同一天按网址。

function readFrontmatter(file: string): Record<string, any> {
  const m = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return m ? parse(m[1]) || {} : {}
}

export function readPostMeta(files: string[]): Record<string, any>[] {
  return files.flatMap((file) => {
    const fm = readFrontmatter(file)
    return parseDate(fm.date) ? [fm] : []
  })
}

export interface PostEntry {
  url: string
  title: string
  time: number
}

export const comparePosts = (a: { time: number; url: string }, b: { time: number; url: string }) =>
  b.time - a.time || a.url.localeCompare(b.url)

/** srcDir/posts 下的全部文章，url 与 createContentLoader 给出的一致（如 /posts/2025/11/donut.html） */
export function listPosts(srcDir: string): PostEntry[] {
  const out: PostEntry[] = []
  const walk = (dir: string) => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, ent.name)
      if (ent.isDirectory()) walk(file)
      else if (ent.name.endsWith('.md')) {
        const fm = readFrontmatter(file)
        const date = parseDate(fm.date)
        if (!date) continue
        const rel = path.relative(srcDir, file).split(path.sep).join('/')
        out.push({ url: '/' + rel.replace(/\.md$/, '.html'), title: String(fm.title ?? rel), time: +date })
      }
    }
  }
  walk(path.join(srcDir, 'posts'))
  return out.sort(comparePosts)
}
