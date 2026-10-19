---
layout: page
title: 文章归档
description: BLUEMOON 的全部文章，按年份归档
---

<script setup>
import { data as posts } from '../../.vitepress/data/posts.data'
const years = (() => {
  const map = new Map()
  for (const p of posts) {
    const y = new Date(p.date.time).getFullYear()
    if (!map.has(y)) map.set(y, [])
    map.get(y).push(p)
  }
  return [...map.entries()]
})()
</script>

<style scoped>
.list-page { max-width: 960px; margin: 0 auto; padding: 4rem 2rem 6rem; }
.year { font-family: var(--font-mono); font-size: 15px; font-weight: 500; letter-spacing: .06em; color: var(--ink); margin: 3rem 0 1rem; border: none; padding: 0; }
.year { margin-top: 0; }
section + section { margin-top: 3rem; }
.back { display: inline-block; margin-top: 3rem; color: var(--accent); text-decoration: none; }
@media (max-width: 640px) { .list-page { padding: 2.25rem 1.25rem 4rem; } }
</style>

<div class="list-page">
  <PageHeader kicker="Archive" title="文章归档" :note="`共 ${posts.length} 篇，按年份倒序`" />
  <section v-for="[year, list] in years" :key="year">
    <h2 class="year">{{ year }}</h2>
    <PostList :posts="list" :show-year="false" />
  </section>
</div>
