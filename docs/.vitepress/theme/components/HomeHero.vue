<script setup lang="ts">
// 首页大标题，放在官方插槽 home-hero-info 里，代替默认的 name / text / tagline。
// 内容来自首页 frontmatter：hero.text（大标题）、hero.tagline（说明）、hero.links（按钮）。
// 按钮不用 hero.actions：默认按钮的圆角写死成胶囊形，这里自己画 8px 圆角的按钮。
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

interface HeroLink {
  text: string
  link: string
  theme?: 'brand' | 'alt'
}

const { frontmatter } = useData()
const hero = computed(() => frontmatter.value.hero ?? {})
const links = computed<HeroLink[]>(() => hero.value.links ?? [])
</script>

<template>
  <div class="home-hero">
    <h1 class="title">{{ hero.text }}</h1>
    <p v-if="hero.tagline" class="lede">{{ hero.tagline }}</p>
    <div v-if="links.length" class="actions">
      <a
        v-for="l in links"
        :key="l.link"
        class="button"
        :class="l.theme === 'brand' ? 'brand' : 'alt'"
        :href="withBase(l.link)"
      >{{ l.text }}</a>
    </div>
  </div>
</template>

<style scoped>
.title {
  margin: 0;
  max-width: 14em;
  font-family: var(--blog-font-serif);
  font-weight: 400;
  font-size: 4.5rem;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--blog-ink);
}
.lede {
  margin: 1.75rem 0 0;
  max-width: 34em;
  font-size: 19px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 2.25rem;
}
.button {
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s, border-color 0.2s;
}
.button.brand {
  background-color: var(--blog-btn-bg);
  color: var(--blog-btn-text);
}
.button.brand:hover {
  background-color: var(--blog-btn-hover);
}
.button.alt {
  border-color: var(--vp-c-border);
  color: var(--blog-ink);
}
.button.alt:hover {
  background-color: var(--vp-c-bg-alt);
}

@media (max-width: 640px) {
  .title {
    font-size: 2.75rem;
  }
  .lede {
    font-size: 17px;
  }
}
</style>
