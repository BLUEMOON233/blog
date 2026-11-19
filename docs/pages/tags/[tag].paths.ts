import { readPostMeta } from '../../.vitepress/postMeta.ts'

// VitePress 官方的动态路由写法：watch 列出依赖的文章（相对本文件），
// VitePress 把匹配到的文件传给 paths()；开发时文章增删改会自动重新生成标签页。
// 标签不区分大小写：路由参数用小写，页面上显示文章里的原始写法。
export default {
  watch: ['../../posts/**/*.md'],
  paths(files: string[]) {
    const tags = new Set<string>()
    for (const fm of readPostMeta(files)) {
      for (const t of Array.isArray(fm.tags) ? fm.tags : []) tags.add(String(t).toLowerCase())
    }
    return [...tags].map((tag) => ({ params: { tag } }))
  }
}
