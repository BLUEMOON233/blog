import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import RecentPosts from './components/RecentPosts.vue'
import TodoList from './components/TodoList.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'home-features-after': () => h(RecentPosts)
    })
  },
  enhanceApp({ app }) {
    // 全局注册组件
    app.component('TodoList', TodoList)
  }
} satisfies Theme
