<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { data as posts } from '../../data/posts.data'
import PostList from './PostList.vue'

const { site } = useData()
const lead = posts[0]
const rest = posts.slice(1, 8)
const leadDate = lead ? lead.date.iso.replaceAll('-', '.') : ''
const cats = [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[]
const catUrl = (c: string) => withBase(`/pages/categories/${encodeURIComponent(c)}.html`)
</script>

<template>
  <div class="mag">
    <header class="masthead fx-in">
      <div class="kicker">学习笔记、论文阅读与折腾记录</div>
      <h1 class="mast-title">{{ site.title }}</h1>
      <p class="mast-motto">{{ site.description }}</p>
      <nav class="mast-cats kicker" aria-label="栏目">
        <span aria-hidden="true">栏目</span>
        <a v-for="c in cats" :key="c" :href="catUrl(c)">{{ c }}</a>
      </nav>
    </header>

    <!-- 整张头条卡可点：标题链接伸展铺满卡片；“阅读全文”只是视觉提示，不重复进 Tab 序列和读屏 -->
    <article v-if="lead" class="lead fx-in" style="--fx-delay: 60ms">
      <div class="kicker lead-kicker">
        <span class="lead-flag">最新</span>
        <a v-if="lead.category" :href="catUrl(lead.category)">{{ lead.category }}</a>
        <time :datetime="lead.date.iso">{{ leadDate }}</time>
      </div>
      <h2 class="lead-title"><a :href="withBase(lead.url)">{{ lead.title }}</a></h2>
      <p v-if="lead.description" class="lead-desc">{{ lead.description }}</p>
      <a :href="withBase(lead.url)" class="lead-more kicker" aria-hidden="true" tabindex="-1">阅读全文</a>
    </article>

    <section class="recent">
      <div class="section-head">
        <h2 class="kicker">近期文章</h2>
        <a class="kicker" :href="withBase('/pages/archives/')">全部 {{ posts.length }} 篇</a>
      </div>
      <PostList :posts="rest" />
    </section>
  </div>
</template>

<style scoped>
.mag { max-width: 960px; margin: 0 auto; padding: 4rem 2rem 6rem; }
.masthead { padding-bottom: 2.25rem; border-bottom: 1px solid var(--rule); }
.mast-title {
  font-family: var(--font-serif);
  font-size: clamp(3rem, 9vw, 5.5rem);
  font-weight: var(--fw-head);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0.75rem 0 0;
  color: var(--ink);
}
.mast-motto { font-family: var(--font-serif); font-size: 1.35rem; color: var(--ink-2); margin: 1rem 0 0; }
.mast-cats { display: flex; flex-wrap: wrap; gap: 0.4rem 1.25rem; margin-top: 1.75rem; }

/* 头条：大圆角卡片（--r-lg：桌面 20px，小屏 16px） */
.lead {
  position: relative;
  margin-top: 2.5rem;
  padding: 2.5rem 2.75rem;
  background: var(--card-bg);
  border: var(--bw) solid var(--card-border);
  border-radius: var(--r-lg);
  box-shadow: var(--card-shadow);
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}
.lead:hover {
  transform: translateY(var(--lift));
  box-shadow: var(--card-shadow-hover);
  border-color: var(--card-border-hover);
}
.lead-kicker { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; align-items: center; }
/* 栏目链接浮在伸展链接之上，仍可单独点击 */
.lead-kicker a { position: relative; z-index: 1; }
.lead-flag {
  background: var(--clay);
  color: var(--on-clay);
  border-radius: 999px;
  padding: 0.05rem 0.65rem;
}
.lead-title {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.2;
  font-weight: var(--fw-head);
  letter-spacing: -0.01em;
  margin: 1.1rem 0 0;
  text-wrap: balance;
}
.lead-title a { color: var(--ink); text-decoration: none; transition: color var(--dur) var(--ease); }
.lead-title a::after {
  /* 伸展链接：点击区域铺满整张头条卡 */
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--r-lg);
}
/* 键盘焦点画在铺满卡片的伪元素上 */
.lead-title a:focus-visible { outline: none; }
.lead-title a:focus-visible::after { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.lead:hover .lead-title a { color: var(--accent); }
.lead-desc {
  font-family: var(--font-serif);
  font-size: var(--fs-lede);
  line-height: 1.65;
  color: var(--ink-2);
  margin: 1rem 0 0;
  max-width: 40em;
}
.lead-more { display: inline-block; margin-top: 1.5rem; color: var(--accent); text-decoration: none; }
.lead:hover .lead-more { text-decoration: underline; text-underline-offset: 3px; }

.recent { padding-top: 3rem; }
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
}
.section-head h2 { margin: 0; color: var(--ink); font-weight: 500; }
.section-head a { color: var(--accent); text-decoration: none; }

@media (max-width: 640px) {
  .mag { padding: 2.25rem 1.25rem 4rem; }
  .masthead { padding-bottom: 1.5rem; }
  /* 不用 nowrap：≤360px 屏幕上 2.6rem 的站名会撑出横向滚动条 */
  .mast-title { font-size: clamp(2rem, 10vw, 2.6rem); overflow-wrap: anywhere; }
  .mast-motto { font-size: 1.1rem; }
  .lead { margin-top: 1.75rem; padding: 1.6rem 1.35rem; }
  .lead-desc { font-size: 1.1rem; }
  .recent { padding-top: 2.25rem; }
}
</style>
