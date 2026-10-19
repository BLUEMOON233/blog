import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import RecentPosts from './components/RecentPosts.vue'
import PostMeta from './components/PostMeta.vue'
import PostCard from './components/PostCard.vue'

import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'home-features-after': () => h(RecentPosts),
      'doc-before': () => h(PostMeta)
    })
  },
  enhanceApp({ app }) {
    // 全局注册组件（归档等页面里直接用 <PostCard>）
    app.component('PostCard', PostCard)
  }
} satisfies Theme
