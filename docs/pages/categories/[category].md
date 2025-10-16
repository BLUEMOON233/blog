---
layout: page
---

<script setup>
import { data as posts } from '../../.vitepress/data/posts.data'
import { useData } from 'vitepress'
import { computed } from 'vue'

const { params } = useData()
const currentCategory = computed(() => params.value.category)

// 过滤当前分类的文章
const categoryPosts = computed(() => {
  return posts.filter(post => post.category === currentCategory.value)
})
</script>

<style scoped>
.category-detail-container {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.category-header {
  margin-bottom: 2rem;
}

.category-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.category-count {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-size: 0.875rem;
}

.back-link:hover {
  text-decoration: underline;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.post-item:last-child {
  border-bottom: none;
}

.post-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.post-title a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s;
}

.post-title a:hover {
  color: var(--vp-c-brand-2);
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.75rem;
}

.post-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.125rem 0.5rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: background-color 0.2s;
}

.tag:hover {
  background-color: var(--vp-c-bg-mute);
}

.post-excerpt {
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
</style>

<div class="category-detail-container">
  <a href="/pages/categories/" class="back-link">← 返回分类列表</a>

  <div class="category-header">
    <h1 class="category-title">
      <span>📁</span>
      <span>{{ currentCategory }}</span>
    </h1>
    <p class="category-count">共 {{ categoryPosts.length }} 篇文章</p>
  </div>

  <ul class="post-list">
    <li v-for="post in categoryPosts" :key="post.url" class="post-item">
      <h2 class="post-title">
        <a :href="post.url">{{ post.title }}</a>
      </h2>
      <div class="post-meta">
        <span class="post-date">
          <span>📅</span>
          <span>{{ post.date.string }}</span>
        </span>
      </div>
      <div v-if="post.tags && post.tags.length" class="post-tags">
        <a
          v-for="tag in post.tags"
          :key="tag"
          :href="`/pages/tags/${tag}.html`"
          class="tag"
        >
          #{{ tag }}
        </a>
      </div>
      <p v-if="post.description || post.excerpt" class="post-excerpt">
        {{ post.description || post.excerpt }}
      </p>
    </li>
  </ul>
</div>
