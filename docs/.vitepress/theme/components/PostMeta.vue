<script setup lang="ts">
// 文章标题上方的信息行：分类、日期、字数和阅读时间、标签。放在官方插槽 doc-before 里，只在 posts/ 下显示。
// 字数和阅读时间由 config.mts 的 transformPageData 在构建时算好，放在 frontmatter.readingStats。
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { parseDate } from '../../date.ts'

const { page, frontmatter } = useData()

const isPost = computed(() => page.value.relativePath.startsWith('posts/'))
const category = computed<string | undefined>(() => frontmatter.value.category)
const tags = computed<string[]>(() => (Array.isArray(frontmatter.value.tags) ? frontmatter.value.tags.map(String) : []))

// 日期按 UTC 取年月日，构建和浏览器里显示一致
const date = computed(() => {
  const d = parseDate(frontmatter.value.date)
  if (!d) return null
  return {
    iso: d.toISOString().slice(0, 10),
    text: `${d.getUTCFullYear()} 年 ${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日`
  }
})

// 「约 1,100 字」：1000 字以上取整到百，以下取整到十
const stats = computed(() => {
  const s = frontmatter.value.readingStats as { words: number; minutes: number } | undefined
  if (!s) return null
  const step = s.words >= 1000 ? 100 : 10
  const words = Math.max(step, Math.round(s.words / step) * step)
  return `约 ${words.toLocaleString('en-US')} 字，${s.minutes} 分钟读完`
})

const termUrl = (kind: 'categories' | 'tags', name: string) => withBase(`/pages/${kind}/${encodeURIComponent(name)}.html`)
</script>

<template>
  <div v-if="isPost" class="post-meta">
    <a v-if="category" class="category" :href="termUrl('categories', category)">{{ category }}</a>
    <time v-if="date" :datetime="date.iso">{{ date.text }}</time>
    <span v-if="stats">{{ stats }}</span>
    <span v-if="tags.length" class="tags">
      <a v-for="t in tags" :key="t" :href="termUrl('tags', t.toLowerCase())">#{{ t }}</a>
    </span>
  </div>
</template>

<style scoped>
.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 16px;
  margin-bottom: 18px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
.category {
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.category:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}
.tags a {
  color: var(--vp-c-text-2);
  text-decoration: none;
}
.tags a:hover {
  color: var(--vp-c-brand-1);
}
</style>
