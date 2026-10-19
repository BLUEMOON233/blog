<script setup lang="ts">
import { withBase } from 'vitepress'
import type { Post } from '../../data/posts.data'

// 文章列表：圆角卡片，日期 | 标题 + 导语 + 标签 | 栏目；标题链接伸展铺满整张卡片
withDefaults(
  defineProps<{ posts: Post[]; showDesc?: boolean; showYear?: boolean; headingLevel?: 2 | 3 | 4 }>(),
  {
    showDesc: true,
    showYear: true,
    headingLevel: 3
  }
)
// 日期统一用 posts.data 里按 UTC 算好的 iso（YYYY-MM-DD），客户端与 SSR 输出一致
const md = (p: Post) => p.date.iso.slice(5).replace('-', '.')
// 入场错开：第 1 张 120ms，之后每张 +40ms，最多 320ms
const delay = (i: number) => ({ '--fx-delay': `${Math.min(120 + i * 40, 320)}ms` })
</script>

<template>
  <ol class="toc">
    <li v-for="(post, i) in posts" :key="post.url" class="toc-row fx-in" :style="delay(i)">
      <time class="toc-date" :datetime="post.date.iso">
        <span v-if="showYear" class="toc-year">{{ post.date.iso.slice(0, 4) }}.</span>{{ md(post) }}
      </time>
      <div class="toc-main">
        <component :is="`h${headingLevel}`" class="toc-heading">
          <a :href="withBase(post.url)" class="toc-title">{{ post.title }}</a>
        </component>
        <p v-if="showDesc && post.description" class="toc-desc">{{ post.description }}</p>
        <div v-if="post.tags?.length" class="toc-tags">
          <a
            v-for="tag in post.tags"
            :key="tag"
            :href="withBase(`/pages/tags/${encodeURIComponent(tag.toLowerCase())}.html`)"
          >#{{ tag }}</a>
        </div>
      </div>
      <a
        v-if="post.category"
        class="toc-cat"
        :href="withBase(`/pages/categories/${encodeURIComponent(post.category)}.html`)"
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
  position: relative;
  display: grid;
  /* minmax(0, 1fr)：长 URL / 长英文标题不会把卡片撑破 */
  grid-template-columns: 7.5rem minmax(0, 1fr) auto;
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
.toc-main { overflow-wrap: anywhere; }
/* 标题包一层 h2/h3 供读屏按标题跳转，排版沿用原来的行内链接 */
.toc-heading { margin: 0; font-size: inherit; line-height: inherit; font-weight: inherit; }
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
  border-radius: var(--r-md);
}
/* 键盘焦点画在铺满卡片的伪元素上，而不是只框住标题文字 */
.toc-title:focus-visible { outline: none; }
.toc-title:focus-visible::after { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
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
    grid-template-columns: minmax(0, 1fr) auto;
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
