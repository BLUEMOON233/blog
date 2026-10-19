import type { Theme } from 'vitepress'
// 不打包默认主题自带的 Inter 字体（我们的字体栈不用它）
import DefaultTheme from 'vitepress/theme-without-fonts'

import './fonts' // 免费自托管网络字体；删掉这一行即只用系统字体
import './styles/index.css'

// 组件（HomeMag / PostList / PageHeader / TermIndex）不在这里全局注册，由各列表页自己 import，
// 这样 posts.data 只打进首页和列表页的 chunk，文章页不用下载全站文章数据。
export default {
  extends: DefaultTheme
} satisfies Theme
