import { createContentLoader } from 'vitepress'
import { parseDate } from '../date'

export interface Post {
  title: string
  url: string
  date: {
    time: number
    iso: string // YYYY-MM-DD，按 UTC 计算；组件只用它显示日期，避免时区差异和 hydration mismatch
  }
  category?: string
  tags?: string[]
  description?: string
}

declare const data: Post[]
export { data }

export default createContentLoader('posts/**/*.md', {
  transform(raw): Post[] {
    return raw
      // draft: true 的草稿不出现在首页/归档/分类/标签里
      .filter(({ frontmatter }) => frontmatter.draft !== true)
      // 没有或写错 date 的文章跳过并警告，不让列表组件在 SSR 时崩溃
      .filter(({ url, frontmatter }) => {
        if (parseDate(frontmatter.date)) return true
        console.warn(`[posts.data] ${url}：date 缺失或无效（${frontmatter.date}），已从文章列表跳过`)
        return false
      })
      .map(({ url, frontmatter }) => ({
        title: frontmatter.title,
        url,
        description: frontmatter.description,
        date: formatDate(parseDate(frontmatter.date)!),
        category: frontmatter.category,
        tags: frontmatter.tags || []
      }))
      .sort((a, b) => b.date.time - a.date.time)
  }
})

function formatDate(date: Date): Post['date'] {
  date.setUTCHours(12)
  return { time: +date, iso: date.toISOString().slice(0, 10) }
}
