---
layout: page
title: 标签
description: 按标签浏览 BLUEMOON 的文章
---

<script setup>
import { data as posts } from '../../.vitepress/data/posts.data'
import PageHeader from '../../.vitepress/theme/components/PageHeader.vue'
import TermIndex from '../../.vitepress/theme/components/TermIndex.vue'
const m = new Map()
for (const p of posts) for (const t of p.tags || []) {
  const k = t.toLowerCase()
  const e = m.get(k) || { name: t, slug: k, count: 0 }
  e.count++; m.set(k, e)
}
const terms = [...m.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
</script>

<style scoped>
.list-page { max-width: 960px; margin: 0 auto; padding: 4rem 2rem 6rem; }
.year { font-family: var(--font-mono); font-size: 15px; font-weight: 500; letter-spacing: .06em; color: var(--ink); margin: 3rem 0 1rem; border: none; padding: 0; }
.year:first-of-type { margin-top: 0; }
.back { display: inline-block; margin-top: 3rem; color: var(--accent); text-decoration: none; }
@media (max-width: 640px) { .list-page { padding: 2.25rem 1.25rem 4rem; } }
</style>

<div class="list-page">
  <PageHeader kicker="Index" title="标签" :note="`${terms.length} 个标签`" />
  <TermIndex :terms="terms" base="/pages/tags/" prefix="#" />
</div>
