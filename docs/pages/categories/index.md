---
title: 分类
---

<script setup>
import { withBase } from 'vitepress'
import { data as posts } from '../../.vitepress/data/posts.data'
const counts = new Map()
for (const p of posts) if (p.category) counts.set(p.category, (counts.get(p.category) || 0) + 1)
const categories = [...counts].sort((a, b) => b[1] - a[1])
</script>

# 分类

<ul>
<li v-for="[name, n] in categories" :key="name"><a :href="withBase(`/pages/categories/${encodeURIComponent(name)}.html`)">{{ name }}</a>（{{ n }} 篇）</li>
</ul>
