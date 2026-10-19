---
layout: page
title: 文章归档
description: BLUEMOON 的全部文章，按年份归档
---

<script setup>
import { computed } from 'vue'
import { data as posts } from '../../.vitepress/data/posts.data'

// 按年份分组（posts 已按日期倒序）
const years = computed(() => {
  const map = new Map()
  for (const p of posts) {
    const y = new Date(p.date.time).getFullYear()
    if (!map.has(y)) map.set(y, [])
    map.get(y).push(p)
  }
  return [...map.entries()]
})
</script>

<style scoped>
.archives-container {
  max-width: 880px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}
.archives-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}
.total-count {
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  font-size: 0.9rem;
}
.year {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  margin: 2rem 0 0.9rem;
  font-variant-numeric: tabular-nums;
}
.post-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
@media (max-width: 640px) {
  .archives-container {
    padding: 1.5rem 1rem 3rem;
  }
  .archives-title {
    font-size: 1.5rem;
  }
}
</style>

<div class="archives-container">
  <h1 class="archives-title">文章归档</h1>
  <p class="total-count">共 {{ posts.length }} 篇文章</p>
  <section v-for="[year, list] in years" :key="year">
    <h2 class="year">{{ year }}</h2>
    <div class="post-list">
      <PostCard v-for="post in list" :key="post.url" :post="post" />
    </div>
  </section>
</div>
