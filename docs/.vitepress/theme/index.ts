import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import RecentPosts from './components/RecentPosts.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'home-features-after': () => h(RecentPosts)
    })
  }
}
