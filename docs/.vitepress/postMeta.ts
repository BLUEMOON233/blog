import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { parseDate } from './date.ts'

// 读取文章的 frontmatter，给分类 / 标签的动态路由（[category].paths.ts、[tag].paths.ts）用。
// 动态路由文件是在 VitePress 解析配置时加载的，这时还不能用 createContentLoader
//（它依赖解析完的配置，VitePress 2.0.0-alpha.19 起会直接报错），所以这里自己读文件。
// 规则与 posts.data.ts 一致：跳过草稿和没有有效 date 的文章。
export function readPostMeta(files: string[]): Record<string, any>[] {
  return files.flatMap((file) => {
    const m = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)
    const fm = m ? parse(m[1]) || {} : {}
    return fm.draft !== true && parseDate(fm.date) ? [fm] : []
  })
}
