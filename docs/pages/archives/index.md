---
layout: page
title: 文章归档
description: BLUEMOON 的全部文章，按年份归档
---

<script setup>
import { data as posts } from '../../.vitepress/data/posts.data'
import PageHeader from '../../.vitepress/theme/components/PageHeader.vue'
import PostList from '../../.vitepress/theme/components/PostList.vue'
const years = (() => {
  const map = new Map()
  for (const p of posts) {
    const y = p.date.iso.slice(0, 4) // UTC 年份，与 PostList 显示一致
    if (!map.has(y)) map.set(y, [])
    map.get(y).push(p)
  }
  return [...map.entries()]
})()
</script>

<style scoped>
.year { font-family: var(--font-mono); font-size: var(--fs-small); font-weight: 500; letter-spacing: .06em; color: var(--ink); margin: 0 0 1rem; }
section + section { margin-top: 3rem; }
</style>

<div class="list-page">
  <PageHeader kicker="Archive" title="文章归档" :note="`共 ${posts.length} 篇，按年份倒序`" />
  <section v-for="[year, list] in years" :key="year">
    <h2 class="year">{{ year }}</h2>
    <PostList :posts="list" :show-year="false" />
  </section>
</div>
