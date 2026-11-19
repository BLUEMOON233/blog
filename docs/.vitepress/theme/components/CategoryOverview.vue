<script setup lang="ts">
// 分类页（栏目预览）：每个分类一块，标题行是栏目名和「全部 N 篇」，下面列出最近三篇。
// 分类按最近一篇文章的时间排序（posts 已按日期从新到旧）。
// 在 .vp-doc 正文里使用，scoped 样式优先级高于 .vp-doc 的段落、列表、链接规则。
import { withBase } from 'vitepress'
import { data as posts, type Post } from '../../data/posts.data'

const categories: { name: string; posts: Post[] }[] = []
for (const p of posts) {
  if (!p.category) continue
  let c = categories.find((x) => x.name === p.category)
  if (!c) categories.push((c = { name: p.category, posts: [] }))
  c.posts.push(p)
}

const categoryUrl = (name: string) => withBase(`/pages/categories/${encodeURIComponent(name)}.html`)
const dateText = (p: Post) => p.date.iso.replaceAll('-', '.')
</script>

<template>
  <p class="intro">{{ categories.length }} 个分类，每类列出最近三篇</p>
  <section v-for="c in categories" :key="c.name" class="block">
    <div class="head">
      <a class="name" :href="categoryUrl(c.name)">{{ c.name }}</a>
      <a class="all" :href="categoryUrl(c.name)">全部 {{ c.posts.length }} 篇</a>
    </div>
    <ol class="list">
      <li v-for="p in c.posts.slice(0, 3)" :key="p.url" class="item">
        <time :datetime="p.date.iso">{{ dateText(p) }}</time>
        <a :href="withBase(p.url)">{{ p.title }}</a>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.intro {
  margin: 0.5rem 0 1.75rem;
  font-size: 15px;
  color: var(--vp-c-text-2);
}
.block + .block {
  margin-top: 2.75rem;
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--blog-ink);
}
.name {
  font-family: var(--blog-font-serif);
  font-weight: 400;
  font-size: 24px;
  line-height: 1.3;
  color: var(--blog-ink);
  text-decoration: none;
}
.name:hover {
  color: var(--vp-c-brand-1);
}
.all {
  font-size: 14px;
  font-weight: 400;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  white-space: nowrap;
}
.all:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item {
  display: grid;
  grid-template-columns: 6.5rem minmax(0, 1fr);
  gap: 20px;
  align-items: baseline;
  margin: 0;
  padding: 12px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.item time {
  font-size: 14px;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}
.item a {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  text-decoration: none;
  overflow-wrap: anywhere;
}
.item a:hover {
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .item {
    grid-template-columns: minmax(0, 1fr);
    gap: 2px;
  }
}
</style>
