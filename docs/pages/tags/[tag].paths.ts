import { createContentLoader } from 'vitepress'

interface Post {
  url: string
  frontmatter: Record<string, any>
}

export default {
  async paths() {
    const posts = await createContentLoader('posts/**/*.md').load() as Post[]

    // 收集所有标签
    const tags = new Set<string>()
    posts.forEach(post => {
      if (post.frontmatter.tags && Array.isArray(post.frontmatter.tags)) {
        post.frontmatter.tags.forEach((tag: string) => {
          tags.add(tag)
        })
      }
    })

    // 为每个标签生成路径
    return Array.from(tags).map(tag => ({
      params: { tag }
    }))
  }
}
