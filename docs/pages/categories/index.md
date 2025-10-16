---
layout: page
title: 分类
---

<script setup>
import { data as posts } from '../../.vitepress/data/posts.data'
import { computed } from 'vue'

// 统计每个分类的文章数量
const categories = computed(() => {
  const categoryMap = new Map()

  posts.forEach(post => {
    if (post.category) {
      if (!categoryMap.has(post.category)) {
        categoryMap.set(post.category, {
          name: post.category,
          count: 0,
          posts: []
        })
      }
      const cat = categoryMap.get(post.category)
      cat.count++
      cat.posts.push(post)
    }
  })

  return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count)
})
</script>

<style scoped>
.categories-container {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.categories-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: var(--vp-c-text-1);
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  background: var(--vp-c-bg-soft);
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.3s;
  border: 1px solid var(--vp-c-divider);
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand-1);
}

.category-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.5rem;
}

.category-count {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.total-count {
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}
</style>

<div class="categories-container">
  <h1 class="categories-title">分类</h1>
  <p class="total-count">共 {{ categories.length }} 个分类</p>
  <ul class="category-list">
    <li v-for="category in categories" :key="category.name" class="category-item">
      <a :href="`/pages/categories/${category.name}.html`" class="category-link">
        <div class="category-name">📁 {{ category.name }}</div>
        <div class="category-count">{{ category.count }} 篇文章</div>
      </a>
    </li>
  </ul>
</div>
