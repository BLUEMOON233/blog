---
layout: page
---

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../../.vitepress/data/posts.data'
const { params } = useData()
const cat = computed(() => params.value.category)
const list = computed(() => posts.filter(p => p.category === cat.value))
</script>

<style scoped>
.list-page { max-width: 960px; margin: 0 auto; padding: 4rem 2rem 6rem; }
.year { font-family: var(--font-mono); font-size: 15px; font-weight: 500; letter-spacing: .06em; color: var(--ink); margin: 3rem 0 1rem; border: none; padding: 0; }
.year:first-of-type { margin-top: 0; }
.back { display: inline-block; margin-top: 3rem; color: var(--accent); text-decoration: none; }
@media (max-width: 640px) { .list-page { padding: 2.25rem 1.25rem 4rem; } }
</style>

<div class="list-page">
  <PageHeader kicker="Section · 分类" :title="cat" :note="`共 ${list.length} 篇`" />
  <PostList :posts="list" />
  <a class="back kicker" href="/pages/categories/">返回全部分类</a>
</div>
