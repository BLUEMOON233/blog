<script setup lang="ts">
// 首页大标题下方的近期文章。首页 frontmatter 设了 markdownStyles: false（官方选项），
// 内容不套 .vp-doc 样式，所以这里自己负责宽度和标题样式；左右留白与默认 hero 容器对齐。
import { withBase } from 'vitepress'
import { data as posts } from '../../data/posts.data'
import PostList from './PostList.vue'

const recent = posts.slice(0, 10)
</script>

<template>
  <section class="recent">
    <h2 class="heading">近期文章</h2>
    <PostList :posts="recent" />
    <a class="more" :href="withBase('/pages/archives/')">全部 {{ posts.length }} 篇文章</a>
  </section>
</template>

<style scoped>
/* 左右留白跟随 VPHero：24px，640px 起 48px，960px 起 64px；内容最宽 72rem */
.recent {
  max-width: calc(72rem + 128px);
  margin: 0 auto;
  padding: 8px 24px 88px;
}
@media (min-width: 640px) {
  .recent {
    padding-inline: 48px;
  }
}
@media (min-width: 960px) {
  .recent {
    padding-inline: 64px;
  }
}
.heading {
  margin: 0 0 8px;
  font-family: var(--blog-font-serif);
  font-weight: 400;
  font-size: 28px;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--blog-ink);
}
.more {
  display: inline-block;
  margin-top: 28px;
  font-size: 15px;
  color: var(--vp-c-brand-1);
  text-underline-offset: 4px;
}
</style>
