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
.toc {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--ink);
}
.toc-row {
  display: grid;
  grid-template-columns: 7.5rem 1fr 6rem;
  gap: 1.5rem;
  align-items: baseline;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--rule);
}
.toc-date,
.toc-cat,
.toc-tags a {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: var(--ink-3);
  text-decoration: none;
  font-variant-numeric: tabular-nums;
}
.toc-cat {
  justify-self: end;
  text-align: right;
  color: var(--accent);
}
.toc-cat:hover,
.toc-tags a:hover {
  text-decoration: underline;
  color: var(--accent);
}
.toc-title {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--ink);
  text-decoration: none;
  background-image: linear-gradient(var(--accent), var(--accent));
  background-size: 0 1px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.3s, color 0.2s;
}
.toc-title:hover {
  color: var(--accent);
  background-size: 100% 1px;
}
.toc-desc {
  margin: 0.4rem 0 0;
  color: var(--ink-2);
  font-size: 0.95rem;
  line-height: 1.7;
}
.toc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 0.9rem;
  margin-top: 0.5rem;
}
@media (max-width: 640px) {
  .toc-row {
    grid-template-columns: 1fr auto;
    grid-template-areas: 'date cat' 'main main';
    gap: 0.35rem 1rem;
    padding: 1.25rem 0;
  }
  .toc-date { grid-area: date; }
  .toc-cat { grid-area: cat; }
  .toc-main { grid-area: main; }
  .toc-title { font-size: 1.2rem; }
}
</style>
