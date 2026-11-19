// 文章字数与阅读时间，构建时由 config.mts 的 transformPageData 调用，结果放进 frontmatter.readingStats，
// 文章标题上方的信息行（theme/components/PostMeta.vue）读取它。
// 统计正文里的汉字和英文单词，跳过 frontmatter、代码块、行间公式、HTML 标签、图片和链接网址。
// 阅读速度按中文每分钟 400 字、英文每分钟 200 词估算，至少 1 分钟。

const CJK = /[㐀-䶿一-鿿豈-﫿]/g
const WORD = /[A-Za-z0-9]+(?:['’.-][A-Za-z0-9]+)*/g

export function readingStats(source: string): { words: number; minutes: number } {
  const text = source
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, '')
    .replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '')
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/https?:\/\/\S+/g, '')
  const cjk = text.match(CJK)?.length ?? 0
  const words = text.match(WORD)?.length ?? 0
  return { words: cjk + words, minutes: Math.max(1, Math.round(cjk / 400 + words / 200)) }
}
