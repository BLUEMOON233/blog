---
layout: page
title: 文章归档
---

<script setup>
import { data as posts } from '../../.vitepress/data/posts.data'
import { useData } from 'vitepress'

const { site } = useData()
</script>

<style scoped>
.archives-container {
  max-width: 1152px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.archives-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
  text-align: center;
}

.total-count {
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  font-size: 0.875rem;
  text-align: center;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  display: block;
}

.post-card {
  display: block;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  transition: all 0.3s;
  text-decoration: none;
  color: inherit;
}

.post-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  line-height: 1.4;
  margin: 0;
  flex: 1;
}

.post-date {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.post-category {
  color: var(--vp-c-text-2);
}

.post-category a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.post-category a:hover {
  color: var(--vp-c-brand-1);
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.125rem 0.5rem;
  background: var(--vp-c-bg-mute);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: all 0.2s;
}

.tag:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.post-excerpt {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .post-header {
    flex-direction: column;
  }

  .archives-title {
    font-size: 1.5rem;
  }
}
</style>

<div class="archives-container">
  <h1 class="archives-title">文章归档</h1>
  <p class="total-count">共 {{ posts.length }} 篇文章</p>
  <ul class="post-list">
    <li v-for="post in posts" :key="post.url" class="post-item">
      <a :href="post.url" class="post-card">
        <div class="post-header">
          <h2 class="post-title">{{ post.title }}</h2>
          <span class="post-date">📅 {{ post.date.string }}</span>
        </div>
        <div class="post-meta">
          <span v-if="post.category" class="post-category">
            📁 {{ post.category }}
          </span>
          <div v-if="post.tags && post.tags.length" class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </div>
        </div>
        <p v-if="post.description || post.excerpt" class="post-excerpt">
          {{ post.description || post.excerpt }}
        </p>
      </a>
    </li>
  </ul>
</div>
