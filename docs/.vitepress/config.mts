import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'


// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "zh-CN",
  title: "BLUEMOON的博客",
  description: "朝闻道，夕可死矣",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/pages/archives/' },
      { text: '分类', link: '/pages/categories/' },
      { text: '标签', link: '/pages/tags/' },
      { text: '待办', link: '/pages/todo' },
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
    ['link',{ rel: 'icon', href: '/logo.png'}],
  ],

  markdown: {
      config: (md) => {
        md.use(mathjax3)
      }
    }

})
