---
title: 文章归档
# 列表页：「最后更新」是本页源文件的 git 时间，与文章无关，不显示
lastUpdated: false
---

<script setup>
import { data as posts } from '../../.vitepress/data/posts.data'
import PostList from '../../.vitepress/theme/components/PostList.vue'
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
<PostList :posts="list" />
</template>
