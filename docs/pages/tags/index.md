---
title: 标签
---

<script setup>
import { withBase } from 'vitepress'
import { data as posts } from '../../.vitepress/data/posts.data'
// 标签不区分大小写：按小写归并，显示第一次出现时的写法
const tags = new Map()
for (const p of posts) for (const t of p.tags || []) {
  const key = t.toLowerCase()
  const e = tags.get(key) || { name: t, key, count: 0 }
  e.count++
  tags.set(key, e)
}
const list = [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
</script>

# 标签

<ul>
<li v-for="t in list" :key="t.key"><a :href="withBase(`/pages/tags/${encodeURIComponent(t.key)}.html`)">#{{ t.name }}</a>（{{ t.count }} 篇）</li>
</ul>
