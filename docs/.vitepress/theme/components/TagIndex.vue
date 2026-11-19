<script setup lang="ts">
// 标签页（索引流）：像书末索引，标签名后跟小号篇数，自然换行。按篇数从多到少，同样多按名称排列。
// 标签不区分大小写：按小写归并，链接用小写，显示第一次出现时的写法（与 [tag].paths.ts 一致）。
// 在 .vp-doc 正文里使用，scoped 样式优先级高于 .vp-doc 的段落、链接规则。
import { withBase } from 'vitepress'
import { data as posts } from '../../data/posts.data'

const map = new Map<string, { name: string; key: string; count: number }>()
for (const p of posts) {
  for (const t of p.tags || []) {
    const key = t.toLowerCase()
    const entry = map.get(key) ?? { name: t, key, count: 0 }
    entry.count++
    map.set(key, entry)
  }
}
const tags = [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))

const tagUrl = (key: string) => withBase(`/pages/tags/${encodeURIComponent(key)}.html`)
</script>

<template>
  <p class="intro">{{ tags.length }} 个标签，按篇数排列</p>
  <div class="flow">
    <a v-for="t in tags" :key="t.key" :href="tagUrl(t.key)">
      {{ t.name }}<span class="count">{{ t.count }}</span><span class="visually-hidden"> 篇</span>
    </a>
  </div>
</template>

<style scoped>
.intro {
  margin: 0.5rem 0 1.75rem;
  font-size: 15px;
  color: var(--vp-c-text-2);
}
.flow {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 30px;
}
.flow a {
  font-size: 17px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.flow a:hover {
  color: var(--vp-c-brand-1);
}
.count {
  margin-left: 5px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}
</style>
