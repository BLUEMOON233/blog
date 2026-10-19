<script setup lang="ts">
import { withBase } from 'vitepress'
import type { Post } from '../../data/posts.data'

// 杂志目录式文章列表：日期 | 标题 + 导语 | 栏目，细线分隔，无卡片
withDefaults(defineProps<{ posts: Post[]; showDesc?: boolean; showYear?: boolean }>(), {
  showDesc: true,
  showYear: true
})
const d = (p: Post) => new Date(p.date.time)
const pad = (n: number) => String(n).padStart(2, '0')
const md = (p: Post) => `${pad(d(p).getMonth() + 1)}.${pad(d(p).getDate())}`
</script>

<template>
  <ol class="toc">
    <li v-for="post in posts" :key="post.url" class="toc-row">
      <time class="toc-date" :datetime="d(post).toISOString().slice(0, 10)">
        <span v-if="showYear" class="toc-year">{{ d(post).getFullYear() }}.</span>{{ md(post) }}
      </time>
      <div class="toc-main">
        <a :href="withBase(post.url)" class="toc-title">{{ post.title }}</a>
        <p v-if="showDesc && post.description" class="toc-desc">{{ post.description }}</p>
        <div v-if="post.tags?.length" class="toc-tags">
          <a
            v-for="tag in post.tags"
            :key="tag"
            :href="withBase(`/pages/tags/${tag.toLowerCase()}.html`)"
          >#{{ tag }}</a>
        </div>
      </div>
      <a
        v-if="post.category"
        class="toc-cat"
        :href="withBase(`/pages/categories/${post.category}.html`)"
      >{{ post.category }}</a>
    </li>
  </ol>
</template>

<style scoped>
/* 文章列表：12px 圆角卡片，左日期 | 中标题+描述+标签 | 右栏目 */
.toc {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
}
.toc-row {
  display: grid;
  grid-template-columns: 7.5rem 1fr auto;
  gap: 1.5rem;
  align-items: baseline;
  padding: 1.35rem 1.6rem;
  background: var(--card-bg);
  border: var(--bw) solid var(--card-border);
  border-radius: var(--r-md);
  box-shadow: var(--card-shadow);
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}
.toc-row:hover {
  transform: translateY(var(--lift));
  box-shadow: var(--card-shadow-hover);
  border-color: var(--card-border-hover);
}
.toc-date,
.toc-cat,
.toc-tags a {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.02em;
  text-decoration: none;
  font-variant-numeric: tabular-nums;
}
.toc-date { color: var(--meta); white-space: nowrap; }
.toc-cat { justify-self: end; text-align: right; color: var(--accent); white-space: nowrap; }
.toc-cat:hover { text-decoration: underline; text-underline-offset: 3px; }
.toc-title {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-weight: var(--fw-head);
  line-height: 1.4;
  color: var(--ink);
  text-decoration: none;
  transition: color var(--dur) var(--ease);
}
.toc-title::after {
  /* 整张卡片可点：标题链接的点击区域铺满卡片，标签/栏目链接浮在上层 */
  content: "";
  position: absolute;
  inset: 0;
}
.toc-row { position: relative; }
.toc-date, .toc-cat, .toc-tags { position: relative; z-index: 1; }
.toc-row:hover .toc-title { color: var(--accent); }
.toc-desc {
  margin: 0.45rem 0 0;
  color: var(--ink-2);
  font-size: var(--fs-desc);
  line-height: 1.7;
}
.toc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.7rem;
}
.toc-tags a {
  color: var(--ink-2);
  background: var(--inset);
  border: 1px solid var(--chip-border);
  border-radius: var(--r-chip);
  padding: 0.05rem 0.55rem;
  transition: background-color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
/* 悬停只换底色和边框，文字保持 ink-2（accent 叠在浅橙底上不够 4.5） */
.toc-tags a:hover { background: var(--accent-soft); border-color: var(--chip-border-hover); }
@media (max-width: 640px) {
  .toc-row {
    grid-template-columns: 1fr auto;
    grid-template-areas: 'date cat' 'main main';
    gap: 0.4rem 1rem;
    padding: 1.1rem 1.15rem;
  }
  .toc-date { grid-area: date; }
  .toc-cat { grid-area: cat; }
  .toc-main { grid-area: main; }
  .toc-title { font-size: 1.2rem; }
}
</style>
