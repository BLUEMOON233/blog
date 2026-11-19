// 博客主题：在 VitePress 默认主题上扩展。结构、分层和覆盖清单见同目录 README.md。
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { nextTick, onMounted, watch } from 'vue'
import mediumZoom, { type Zoom } from 'medium-zoom'
import Layout from './Layout.vue'
import './fonts.ts'
import './styles/index.css'

export default {
  extends: DefaultTheme,
  Layout,
  setup() {
    // 正文图片点击放大。路由切换后正文会重新渲染，所以每次切换都重新挂一遍；
    // 链接里的图片不挂，点击仍然跳转
    const route = useRoute()
    let zoom: Zoom | undefined
    const attach = () => {
      zoom ??= mediumZoom({ background: 'var(--vp-c-bg)', margin: 24 })
      zoom.detach()
      zoom.attach('.vp-doc img:not(a img)')
    }
    onMounted(attach)
    watch(() => route.path, () => nextTick(attach))
  }
} satisfies Theme
