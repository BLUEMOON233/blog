---
title: 文章归档
---

<script setup>
import { withBase } from 'vitepress'
import { data as posts } from '../../.vitepress/data/posts.data'
// 按年份分组（posts 已按日期倒序）
const years = new Map()
for (const p of posts) {
  const y = p.date.iso.slice(0, 4)
  if (!years.has(y)) years.set(y, [])
  years.get(y).push(p)
}
</script>

# 文章归档

共 {{ posts.length }} 篇。

<template v-for="[year, list] in years" :key="year">
<h2 :id="`_${year}`">{{ year }}</h2>
<ul>
<li v-for="p in list" :key="p.url"><a :href="withBase(p.url)">{{ p.title }}</a> · {{ p.date.iso }}</li>
</ul>
</template>
