import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  url: string
  date: {
    time: number
    string: string
  }
  category?: string
  tags?: string[]
  excerpt?: string
  description?: string
}

declare const data: Post[]
export { data }

export default createContentLoader('posts/**/*.md', {
  excerpt: true,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title,
        url,
        excerpt,
        description: frontmatter.description,
        date: formatDate(frontmatter.date),
        category: frontmatter.category,
        tags: frontmatter.tags || []
      }))
      .sort((a, b) => b.date.time - a.date.time)
  }
})

function formatDate(raw: string): Post['date'] {
  const date = new Date(raw)
  date.setUTCHours(12)
  return {
    time: +date,
    string: date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
}
