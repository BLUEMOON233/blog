<script setup lang="ts">
// kicker 是英文小标题，自动标 lang="en"；中英混排时改用 #kicker 插槽自己标
defineProps<{ kicker?: string; title: string; note?: string }>()
</script>

<template>
  <header class="page-header">
    <div v-if="kicker || $slots.kicker" class="kicker">
      <slot name="kicker"><span lang="en">{{ kicker }}</span></slot>
    </div>
    <h1 class="page-title">{{ title }}</h1>
    <p v-if="note" class="page-note">{{ note }}</p>
  </header>
</template>

<style scoped>
.page-header { margin: 0 0 2.5rem; padding-bottom: 2rem; border-bottom: 1px solid var(--rule); }
.page-title {
  font-family: var(--font-serif);
  font-size: clamp(2.4rem, 6vw, 3.75rem);
  font-weight: var(--fw-head);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0.6rem 0 0;
  color: var(--ink);
  overflow-wrap: anywhere; /* “#很长的英文标签”在小屏上不溢出 */
}
.page-note {
  margin: 0.9rem 0 0;
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--ink-2);
}
</style>
