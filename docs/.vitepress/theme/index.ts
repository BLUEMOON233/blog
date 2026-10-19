import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import HomeMag from './components/HomeMag.vue'
import PostList from './components/PostList.vue'
import PageHeader from './components/PageHeader.vue'
import TermIndex from './components/TermIndex.vue'

import './custom.css'
import './typography.css'

export default {
  extends: DefaultTheme,

  enhanceApp({ app }) {
    // 全局注册组件，首页/归档/分类/标签页直接使用
    app.component('HomeMag', HomeMag)
    app.component('PostList', PostList)
    app.component('PageHeader', PageHeader)
    app.component('TermIndex', TermIndex)
  }
} satisfies Theme
