<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

// 文章页标题上方的日期 / 分类 / 标签（只对 posts/ 下的文章生效）
const { frontmatter, page } = useData()
const show = computed(() => page.value.relativePath.startsWith('posts/') && frontmatter.value.date)
const date = computed(() => {
  const d = new Date(frontmatter.value.date)
  d.setUTCHours(12)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
})
</script>

<template>
  <div v-if="show" class="post-meta-bar">
    <time>{{ date }}</time>
    <a
      v-if="frontmatter.category"
      :href="withBase(`/pages/categories/${frontmatter.category}.html`)"
    >{{ frontmatter.category }}</a>
    <a
      v-for="tag in frontmatter.tags || []"
      :key="tag"
      :href="withBase(`/pages/tags/${String(tag).toLowerCase()}.html`)"
    >#{{ tag }}</a>
  </div>
</template>

<style scoped>
.post-meta-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.9rem;
  margin-bottom: 1.25rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}
.post-meta-bar a {
  color: var(--vp-c-text-2);
  text-decoration: none;
}
.post-meta-bar a:hover {
  color: var(--vp-c-brand-1);
}
</style>
