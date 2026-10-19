import { defineConfig } from 'vitepress'
import { genFeed } from './feed'
import { postHead } from './postHead'

const HOSTNAME = 'https://blog.bluemoon233.com'
const SITE_TITLE = 'BLUEMOON的博客'
const SITE_DESC = '朝闻道，夕可死矣'

const draftUrls = new Set<string>()
const isDraft = (fm: Record<string, any>) => fm?.draft === true


// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "zh-CN",
  title: SITE_TITLE,
  description: SITE_DESC,

  // 草稿（frontmatter 写 draft: true）不进 sitemap / RSS / 文章列表
  sitemap: {
    hostname: HOSTNAME,
    transformItems: (items) => items.filter((i) => !draftUrls.has(i.url))
  },

  transformPageData(pageData) {
    if (isDraft(pageData.frontmatter) && pageData.relativePath.startsWith('posts/')) {
      draftUrls.add(pageData.relativePath.replace(/\.md$/, '.html'))
    }
  },

  // 每页的 canonical / Open Graph / 描述
  transformHead({ pageData, title, description }) {
    const path = pageData.relativePath
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, '.html')
    const url = encodeURI(`${HOSTNAME}/${path}`)
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
    if (isPost && fm.date) {
      head.push(['meta', { property: 'article:published_time', content: new Date(fm.date).toISOString() }])
      for (const t of fm.tags || []) head.push(['meta', { property: 'article:tag', content: String(t) }])
    }
    if (isPost && isDraft(fm)) head.push(['meta', { name: 'robots', content: 'noindex' }])
    return head
  },

  buildEnd: (config) => genFeed(config, { hostname: HOSTNAME, title: SITE_TITLE, description: SITE_DESC }),
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/pages/archives/' },
      { text: '分类', link: '/pages/categories/' },
      { text: '标签', link: '/pages/tags/' },
      { text: '关于', link: '/pages/about' }
    ],

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
        // 自定义渲染函数：移除标题，只保留纯文本内容
        _render: (src, env, md) => {
          // 渲染 Markdown 为 HTML
          const html = md.render(src, env)
          // 移除所有标题标签，只保留文本内容用于搜索
          return html.replace(/<h[2-6][^>]*>.*?<\/h[1-6]>/gi, '')
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
    ['meta', { name: 'theme-color', content: '#3451b2' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: SITE_TITLE, href: '/feed.xml' }],
  ],

  markdown: {
    // 官方数学公式支持（依赖 markdown-it-mathjax3），会给公式加 v-pre，避免 {{ }} 被 Vue 解析
    math: true,
    config: (md) => {
      md.use(postHead)
    }
  }

})
