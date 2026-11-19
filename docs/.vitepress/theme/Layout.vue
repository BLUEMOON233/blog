<script setup lang="ts">
// 只往默认主题的官方布局插槽里放组件，不改 Layout 本身。用到的插槽见 README.md「官方插槽」。
import DefaultTheme from 'vitepress/theme'
import HomeHero from './components/HomeHero.vue'
import PostMeta from './components/PostMeta.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero-info>
      <HomeHero />
    </template>
    <template #doc-before>
      <PostMeta />
    </template>
  </Layout>
</template>
