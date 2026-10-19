<script setup lang="ts">
import { withBase } from 'vitepress'
// 分类 / 标签索引：大号衬线词条 + 等宽篇数，细线分隔
defineProps<{ terms: { name: string; slug: string; count: number }[]; base: string; prefix?: string }>()
</script>

<template>
  <ul class="terms">
    <li v-for="t in terms" :key="t.slug">
      <a :href="withBase(`${base}${t.slug}.html`)">
        <span class="term-name">{{ prefix }}{{ t.name }}</span>
        <span class="term-count">{{ String(t.count).padStart(2, '0') }}</span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
/* 分类 / 标签索引：小卡片网格，衬线词条 + 等宽篇数 */
.terms {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 12px;
}
.terms a {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1rem 1.25rem;
  text-decoration: none;
  color: var(--ink);
  background: var(--card-bg);
  border: var(--bw) solid var(--card-border);
  border-radius: var(--r-md);
  box-shadow: var(--card-shadow);
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}
.terms a:hover {
  transform: translateY(var(--lift));
  box-shadow: var(--card-shadow-hover);
  border-color: var(--card-border-hover);
}
.term-name { font-family: var(--font-serif); font-size: 1.25rem; font-weight: var(--fw-head); }
.term-count { font-family: var(--font-mono); font-size: var(--fs-meta); color: var(--meta); }
.terms a:hover .term-name { color: var(--accent); }
</style>
