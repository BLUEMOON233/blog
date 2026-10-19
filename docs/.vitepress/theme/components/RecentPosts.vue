<script setup lang="ts">
import { withBase } from 'vitepress'
import { data as posts } from '../../data/posts.data'
import PostCard from './PostCard.vue'

const recentPosts = posts.slice(0, 5)
</script>

<template>
  <section class="recent-posts">
    <h2 class="section-title">近期更新</h2>
    <div class="posts-container">
      <PostCard v-for="post in recentPosts" :key="post.url" :post="post" />
    </div>
    <div class="view-all">
      <a :href="withBase('/pages/archives/')" class="view-all-link">查看全部 {{ posts.length }} 篇文章 →</a>
    </div>
  </section>
</template>

<style scoped>
.recent-posts {
  max-width: 880px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
  color: var(--vp-c-text-1);
}
.posts-container {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.view-all {
  text-align: center;
  margin-top: 2rem;
}
.view-all-link {
  display: inline-block;
  padding: 0.6rem 1.5rem;
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  border-radius: 999px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: background 0.25s, color 0.25s;
}
.view-all-link:hover {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}
@media (max-width: 640px) {
  .recent-posts {
    padding: 1.5rem 1rem 3rem;
  }
}
</style>
