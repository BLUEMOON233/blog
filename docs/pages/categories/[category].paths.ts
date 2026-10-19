import { createContentLoader } from 'vitepress'
import { parseDate } from '../../.vitepress/date'

interface Post {
  url: string
  frontmatter: Record<string, any>
}

export default {
  async paths() {
    const posts = await createContentLoader('posts/**/*.md').load() as Post[]

    // 收集所有分类（与 posts.data 一致：跳过草稿和没有有效 date 的文章）
    const categories = new Set<string>()
    posts.filter(post => post.frontmatter.draft !== true && parseDate(post.frontmatter.date)).forEach(post => {
      if (post.frontmatter.category) {
        categories.add(post.frontmatter.category)
      }
    })

    // 为每个分类生成路径
    return Array.from(categories).map(category => ({
      params: { category }
    }))
  }
}
