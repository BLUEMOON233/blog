---
layout: page
title: 分类
description: 按栏目浏览 BLUEMOON 的文章
---

<script setup>
import { data as posts } from '../../.vitepress/data/posts.data'
import PageHeader from '../../.vitepress/theme/components/PageHeader.vue'
import TermIndex from '../../.vitepress/theme/components/TermIndex.vue'
const m = new Map()
for (const p of posts) if (p.category) m.set(p.category, (m.get(p.category) || 0) + 1)
const terms = [...m].map(([name, count]) => ({ name, slug: name, count })).sort((a, b) => b.count - a.count)
</script>

<div class="list-page">
  <PageHeader kicker="Sections" title="分类" :note="`${terms.length} 个栏目`" />
  <TermIndex :terms="terms" base="/pages/categories/" />
</div>
