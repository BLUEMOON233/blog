import { defineConfig } from 'vitepress'
import { genFeed } from './feed'
import { postHead } from './postHead'
import { parseDate } from './date'

const HOSTNAME = 'https://blog.bluemoon233.com'
const SITE_TITLE = 'BLUEMOON的博客'
const SITE_DESC = '朝闻道，夕可死矣'

const draftUrls = new Set<string>()
const isDraft = (fm?: Record<string, any>) => fm?.draft === true


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

    // 右侧目录标题
    outline: {
      label: '目录'
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
        // 自定义渲染函数：移除 h2–h6 标题，只保留纯文本内容
        _render: async (src, env, md) => {
          // 渲染 Markdown 为 HTML（VitePress 2 的 md 是 MarkdownItAsync，同步 render 会留下代码高亮占位符）
          const html = await md.renderAsync(src, env)
          // 自定义 _render 会绕过默认的 search: false 检查，这里补上，并排除草稿；返回空串即不进索引
          if (env.frontmatter?.search === false || isDraft(env.frontmatter)) return ''
          // 移除 h2–h6 标题标签，只保留文本内容用于搜索
          return html.replace(/<h[2-6][^>]*>.*?<\/h[2-6]>/gi, '')
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
    // 与 tokens.css 的 --paper 一致（亮 / 暗）
    ['meta', { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#faf9f5' }],
    ['meta', { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#1f1e1d' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: SITE_TITLE, href: '/feed.xml' }],
  ],

  markdown: {
    // 官方数学公式支持（依赖 markdown-it-mathjax3），会给公式加 v-pre，避免 {{ }} 被 Vue 解析
    math: true,
    codeTransformers: [
      {
        // github-light / github-dark 的注释色 #6A737D 在暖色代码底上不足 4.5:1
        // （亮色 #f0eee6 上 4.15，暗色 #1a1918 上 3.65），换成同色系更深 / 更浅的灰
        name: 'blog:comment-contrast',
        span(node) {
          const style = node.properties.style
          if (typeof style !== 'string') return
          node.properties.style = style
            .replace(/--shiki-light:#6a737d/i, '--shiki-light:#5f666e')
            .replace(/--shiki-dark:#6a737d/i, '--shiki-dark:#8b949e')
        }
      }
    ],
    config: (md) => {
      md.use(postHead)
    }
  }

})
