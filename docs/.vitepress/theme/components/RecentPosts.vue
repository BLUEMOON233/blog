<script setup lang="ts">
import { data as posts } from '../../data/posts.data'

const recentPosts = posts.slice(0, 5)
</script>

<template>
  <div class="recent-posts">
    <h2 class="section-title">📝 近期更新</h2>

    <div class="posts-container">
      <a
        v-for="post in recentPosts"
        :key="post.url"
        :href="post.url"
        class="post-card"
      >
        <div class="post-header">
          <h3 class="post-title">{{ post.title }}</h3>
          <span class="post-date">📅 {{ post.date.string }}</span>
        </div>

        <div class="post-meta">
          <span v-if="post.category" class="post-category">
            📁 {{ post.category }}
          </span>
          <div v-if="post.tags && post.tags.length" class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="post-tag">
              #{{ tag }}
            </span>
          </div>
        </div>

        <p v-if="post.description || post.excerpt" class="post-description">
          {{ post.description || post.excerpt }}
        </p>
      </a>
    </div>

    <div class="view-all">
      <a href="/pages/archives/" class="view-all-link">
        查看全部文章 →
      </a>
    </div>
  </div>
</template>

<style scoped>
.recent-posts {
  max-width: 1152px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--vp-c-text-1);
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.post-tag {
  padding: 0.125rem 0.5rem;
  background: var(--vp-c-bg-mute);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.post-description {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

.view-all {
  text-align: center;
  margin-top: 2rem;
}

.view-all-link {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--vp-c-brand-1);
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.view-all-link:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .post-header {
    flex-direction: column;
  }

  .section-title {
    font-size: 1.5rem;
  }
}
</style>
