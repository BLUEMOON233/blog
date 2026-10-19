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
.terms {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--ink);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  column-gap: 2.5rem;
}
.terms li {
  border-bottom: 1px solid var(--rule);
}
.terms a {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1rem 0;
  text-decoration: none;
  color: var(--ink);
}
.term-name {
  font-family: var(--font-serif);
  font-size: 1.3rem;
  font-weight: 600;
  transition: color 0.2s;
}
.term-count {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-3);
}
.terms a:hover .term-name {
  color: var(--accent);
}
</style>
