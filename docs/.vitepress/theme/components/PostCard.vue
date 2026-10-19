<script setup lang="ts">
import { withBase } from 'vitepress'
import type { Post } from '../../data/posts.data'

defineProps<{ post: Post; headingTag?: string }>()
</script>

<template>
  <article class="post-card">
    <a :href="withBase(post.url)" class="post-link" :aria-label="post.title"></a>
    <div class="post-header">
      <component :is="headingTag || 'h3'" class="post-title">{{ post.title }}</component>
      <time class="post-date" :datetime="new Date(post.date.time).toISOString().slice(0, 10)">
        {{ post.date.string }}
      </time>
    </div>
    <p v-if="post.description || post.excerpt" class="post-description">
      {{ post.description || post.excerpt }}
    </p>
    <div class="post-meta">
      <a
        v-if="post.category"
        class="post-category"
        :href="withBase(`/pages/categories/${post.category}.html`)"
      >{{ post.category }}</a>
      <a
        v-for="tag in post.tags"
        :key="tag"
        class="post-tag"
        :href="withBase(`/pages/tags/${tag.toLowerCase()}.html`)"
      >#{{ tag }}</a>
    </div>
  </article>
</template>

<style scoped>
.post-card {
  position: relative;
  padding: 1.25rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}
.post-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgb(0 0 0 / 8%);
}
/* 整张卡片可点击，同时分类/标签仍是独立链接 */
.post-link {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: 0;
}
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.post-title {
  margin: 0;
  border: none;
  padding: 0;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}
.post-card:hover .post-title {
  color: var(--vp-c-brand-1);
}
.post-date {
  flex-shrink: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}
.post-description {
  margin: 0.5rem 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  font-size: 0.95rem;
}
.post-meta {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
  font-size: 0.78rem;
}
.post-meta a {
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.post-category {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 500;
}
.post-tag {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}
.post-meta a:hover {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}
@media (max-width: 640px) {
  .post-card {
    padding: 1rem 1.1rem;
  }
  .post-header {
    flex-direction: column-reverse;
    gap: 0.2rem;
  }
  .post-title {
    font-size: 1.08rem;
  }
}
</style>
