<script setup lang="ts">
defineProps<{ kicker?: string; title: string; note?: string }>()
</script>

<template>
  <header class="page-header">
    <div v-if="kicker" class="kicker">{{ kicker }}</div>
    <h1 class="page-title">{{ title }}</h1>
    <p v-if="note" class="page-note">{{ note }}</p>
  </header>
</template>

<style scoped>
.page-header {
  margin: 0 0 2.5rem;
}
.page-title {
  font-family: var(--font-serif);
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
  margin: 0.6rem 0 0;
  color: var(--ink);
}
.page-note {
  margin: 0.9rem 0 0;
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--ink-2);
}
</style>
