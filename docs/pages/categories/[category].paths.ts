import { readPostMeta } from '../../.vitepress/postMeta.ts'

// VitePress 官方的动态路由写法：watch 列出依赖的文章（相对本文件），
// VitePress 把匹配到的文件传给 paths()；开发时文章增删改会自动重新生成分类页。
export default {
  watch: ['../../posts/**/*.md'],
  paths(files: string[]) {
    const categories = new Set<string>()
    for (const fm of readPostMeta(files)) if (fm.category) categories.add(String(fm.category))
    return [...categories].map((category) => ({ params: { category } }))
  }
}
