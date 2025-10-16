import { createContentLoader } from 'vitepress'

interface Post {
  url: string
  frontmatter: Record<string, any>
}

export default {
  async paths() {
    const posts = await createContentLoader('posts/**/*.md').load() as Post[]

    // 收集所有分类
    const categories = new Set<string>()
    posts.forEach(post => {
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
