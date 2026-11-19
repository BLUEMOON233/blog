---
layout: home
# 官方选项：首页正文不套 .vp-doc 样式，近期文章由 RecentPosts 组件自己排版
markdownStyles: false

# 大标题由 theme/components/HomeHero.vue 渲染（官方插槽 home-hero-info）：
# text 是大标题，tagline 是下面的说明，links 是按钮（theme: brand 为主按钮）
hero:
  text: 朝闻道，夕可死矣
  tagline: BLUEMOON 的博客。记录论文阅读、部署折腾，以及课程和研究项目里的笔记。
  links:
    - text: 全部文章
      link: /pages/archives/
      theme: brand
    - text: 关于
      link: /pages/about
---

<script setup>
import RecentPosts from './.vitepress/theme/components/RecentPosts.vue'
</script>

<RecentPosts />
