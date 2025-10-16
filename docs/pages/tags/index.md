---
layout: page
title: 标签
---

<script setup>
import { data as posts } from '../../.vitepress/data/posts.data'
import { computed } from 'vue'

// 统计每个标签的文章数量
const tags = computed(() => {
  const tagMap = new Map()

  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, {
            name: tag,
            count: 0,
            posts: []
          })
        }
        const t = tagMap.get(tag)
        t.count++
        t.posts.push(post)
      })
    }
  })

  return Array.from(tagMap.values()).sort((a, b) => b.count - a.count)
})
</script>

<style scoped>
.tags-container {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.tags-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: var(--vp-c-text-1);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.tag-item {
  display: inline-block;
}

.tag-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 2rem;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.3s;
}

.tag-link:hover {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tag-name {
  font-weight: 500;
}

.tag-count {
  font-size: 0.875rem;
  opacity: 0.8;
}

.total-count {
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}
</style>

<div class="tags-container">
  <h1 class="tags-title">标签</h1>
  <p class="total-count">共 {{ tags.length }} 个标签</p>
  <ul class="tag-cloud">
    <li v-for="tag in tags" :key="tag.name" class="tag-item">
      <a :href="`/pages/tags/${tag.name}.html`" class="tag-link">
        <span class="tag-name">#{{ tag.name }}</span>
        <span class="tag-count">({{ tag.count }})</span>
      </a>
    </li>
  </ul>
</div>
