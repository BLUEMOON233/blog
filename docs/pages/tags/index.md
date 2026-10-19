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

<div class="list-page">
  <PageHeader kicker="Index" title="标签" :note="`${terms.length} 个标签`" />
  <TermIndex :terms="terms" base="/pages/tags/" prefix="#" />
</div>
