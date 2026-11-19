---
layout: home

hero:
  name: BLUEMOON的博客
  text: 朝闻道，夕可死矣
  tagline: 记录学习、分享经验、探索未知
  actions:
    - theme: brand
      text: 全部文章
      link: /pages/archives/
    - theme: alt
      text: 关于
      link: /pages/about
---

<script setup>
import { withBase } from 'vitepress'
import { data as posts } from './.vitepress/data/posts.data'
const recent = posts.slice(0, 10)
</script>

## 近期文章

<ul>
<li v-for="p in recent" :key="p.url"><a :href="withBase(p.url)">{{ p.title }}</a> · {{ p.date.iso }}</li>
</ul>

[全部 {{ posts.length }} 篇文章](/pages/archives/)
