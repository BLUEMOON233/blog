import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vitepress'
import { genFeed } from './feed.ts'
import { feedMarkers } from './feedMarkers.ts'
import { parseDate } from './date.ts'
import { listPosts, type PostEntry } from './postMeta.ts'
import { readingStats } from './readingStats.ts'

const HOSTNAME = 'https://blog.bluemoon233.com'
const SITE_TITLE = 'BLUEMOON的博客'
const SITE_DESC = '朝闻道，夕可死矣'

// 全部文章（新到旧），第一次用到时读取一次。开发服务器运行中新增文章，上一篇 / 下一篇要重启后才更新
let posts: PostEntry[] | undefined

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "zh-CN",
  title: SITE_TITLE,
  description: SITE_DESC,

  // 文末「最后更新于」，时间取自 git 提交。Vercel 默认浅克隆，需设环境变量 VERCEL_DEEP_CLONE=true
  lastUpdated: true,

  sitemap: {
    hostname: HOSTNAME
  },

  transformPageData(pageData, { siteConfig }) {
    // 文章：标题上方信息行用的字数 / 阅读时间，以及文末的上一篇（更早）/ 下一篇（更新）
    if (pageData.relativePath.startsWith('posts/')) {
      const fm = pageData.frontmatter
      fm.readingStats = readingStats(readFileSync(join(siteConfig.srcDir, pageData.relativePath), 'utf8'))
      posts ??= listPosts(siteConfig.srcDir)
      const i = posts.findIndex((p) => p.url === '/' + pageData.relativePath.replace(/\.md$/, '.html'))
      if (i >= 0) {
        const older = posts[i + 1]
        const newer = posts[i - 1]
        fm.prev = older ? { text: older.title, link: older.url } : false
        fm.next = newer ? { text: newer.title, link: newer.url } : false
      }
    }

    // 分类/标签详情页是动态路由，没有 frontmatter title 也没有 Markdown H1，按路由参数补标题和描述
    const p = pageData.params
    if (p?.category) {
      pageData.title = `分类：${p.category}`
      pageData.description = `「${p.category}」栏目下的全部文章`
    }
    if (p?.tag) {
      pageData.title = `标签：#${p.tag}`
      pageData.description = `标签 #${p.tag} 下的全部文章`
    }
  },

  // 每页的 canonical / Open Graph / 描述
  transformHead({ pageData, title, description }) {
    const path = pageData.relativePath
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, '.html')
    // 逐段 encodeURIComponent：encodeURI 不转义 #/?，“c#”这类标签页的 canonical 会被截断
    const url = `${HOSTNAME}/${path.split('/').map(encodeURIComponent).join('/')}`
    const fm = pageData.frontmatter
    const isPost = path.startsWith('posts/')
    const head: [string, Record<string, string>][] = [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:site_name', content: SITE_TITLE }],
      ['meta', { property: 'og:type', content: isPost ? 'article' : 'website' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: `${HOSTNAME}/logo.png` }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],
      ['meta', { name: 'twitter:card', content: 'summary' }]
    ]
    if (isPost) {
      // date 缺失或写错时不输出发布时间，免得 toISOString() 抛错中断构建
      const published = parseDate(fm.date)
      if (published) head.push(['meta', { property: 'article:published_time', content: published.toISOString() }])
      for (const t of fm.tags || []) head.push(['meta', { property: 'article:tag', content: String(t) }])
    }
    return head
  },

  buildEnd: (config) => genFeed(config, { hostname: HOSTNAME, title: SITE_TITLE, description: SITE_DESC }),
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',

    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/pages/archives/' },
      { text: '分类', link: '/pages/categories/' },
      { text: '标签', link: '/pages/tags/' },
      { text: '关于', link: '/pages/about' }
    ],

    // 右侧目录标题
    outline: {
      label: '目录'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'medium', timeStyle: 'short' }
    },

    // 文末翻页的小标题；每篇的前后篇由上面的 transformPageData 设置
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/BLUEMOON233' }
    ],

    // 启用本地搜索
    search: {
      provider: 'local',
      options: {
        // 配置 MiniSearch 搜索行为
        miniSearch: {
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
          }
        },
        // 官方文档的写法：https://vitepress.dev/reference/default-theme-search#custom-content-renderer
        // 本地搜索按带锚点的标题切分小节，第一个标题之前的内容不进索引。
        // 正文没有一级标题的文章（标题来自文件名），在前面补上 frontmatter 的标题，否则整篇搜不到。
        _render: async (src, env, md) => {
          const html = await md.renderAsync(src, env)
          // 自定义 _render 会绕过默认的 search: false 检查，需要自己处理；env 在渲染之后才填好
          if (env.frontmatter?.search === false) return ''
          if (env.frontmatter?.title && !/<h1[^>]*>.*?class="header-anchor"/.test(html)) {
            return (await md.renderAsync(`# ${env.frontmatter.title}`)) + html
          }
          return html
        },
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    // 手机浏览器地址栏颜色，与 theme/styles/tokens.css 的 --vp-c-bg 一致（亮 / 暗）
    ['meta', { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#faf9f5' }],
    ['meta', { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#1f1e1b' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: SITE_TITLE, href: '/feed.xml' }],
  ],

  markdown: {
    // 官方数学公式支持（依赖 markdown-it-mathjax3），会给公式加 v-pre，避免 {{ }} 被 Vue 解析
    math: true,
    config: (md) => {
      md.use(feedMarkers)
    }
  }

})
