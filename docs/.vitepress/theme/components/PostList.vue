<script setup lang="ts">
// 文章列表（细线分隔）：日期 | 标题 + 简介 | 分类。首页、归档、分类、标签页共用。
// 在 .vp-doc 正文里使用时，scoped 样式的特异性（类 + 属性）高于 .vp-doc 的列表、段落、链接规则，
// 所以不需要额外的覆盖。
import { withBase } from 'vitepress'
import type { Post } from '../../data/posts.data'

// showCategory：分类详情页里每篇都属于同一分类，不再重复显示
withDefaults(defineProps<{ posts: Post[]; showDesc?: boolean; showCategory?: boolean }>(), {
  showDesc: true,
  showCategory: true
})

const dateText = (p: Post) => p.date.iso.replaceAll('-', '.')
const categoryUrl = (c: string) => withBase(`/pages/categories/${encodeURIComponent(c)}.html`)
</script>

<template>
  <ol class="post-list">
    <li v-for="p in posts" :key="p.url" class="item">
      <time class="date" :datetime="p.date.iso">{{ dateText(p) }}</time>
      <div class="main">
        <a class="title" :href="withBase(p.url)">{{ p.title }}</a>
        <p v-if="showDesc && p.description" class="desc">{{ p.description }}</p>
      </div>
      <a v-if="showCategory && p.category" class="category" :href="categoryUrl(p.category)">{{ p.category }}</a>
    </li>
  </ol>
</template>

<style scoped>
.post-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr) auto;
  gap: 28px;
  align-items: baseline;
  margin: 0;
  padding: 22px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.date {
  font-size: 14px;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.main {
  min-width: 0;
}
.title {
  font-family: var(--blog-font-serif);
  font-weight: 400;
  font-size: 21px;
  line-height: 1.4;
  color: var(--blog-ink);
  text-decoration: none;
  overflow-wrap: anywhere;
}
.title:hover {
  color: var(--vp-c-brand-1);
}
.desc {
  margin: 6px 0 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}
.category {
  font-size: 14px;
  font-weight: 400;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  white-space: nowrap;
}
.category:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 640px) {
  .item {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px 12px;
    padding: 18px 0;
  }
  .main {
    grid-column: 1 / -1;
    grid-row: 2;
  }
  .title {
    font-size: 19px;
  }
}
</style>
