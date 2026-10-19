import { createContentLoader } from 'vitepress'
import { parseDate } from '../../.vitepress/date'

interface Post {
  url: string
  frontmatter: Record<string, any>
}

export default {
  async paths() {
    const posts = await createContentLoader('posts/**/*.md').load() as Post[]

    // 收集所有标签（与 posts.data 一致：跳过草稿和没有有效 date 的文章）
    const tags = new Set<string>()
    posts.filter(post => post.frontmatter.draft !== true && parseDate(post.frontmatter.date)).forEach(post => {
      if (post.frontmatter.tags && Array.isArray(post.frontmatter.tags)) {
        post.frontmatter.tags.forEach((tag: string) => {
          tags.add(tag.toLowerCase())
        })
      }
    })

    // 为每个标签生成路径
    return Array.from(tags).map(tag => ({
      params: { tag }
    }))
  }
}
