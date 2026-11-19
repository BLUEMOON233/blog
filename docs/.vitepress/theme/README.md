# 博客主题

在 VitePress 默认主题上扩展的「暖色纸感」主题：米白底、墨色文字、标题用常规字重的衬线体，赭橙只用在链接和少数标记上。
整站只在一处用力，就是首页的格言大标题，其余部分保持安静。

- 核对过的 VitePress 版本：**2.0.0-alpha.21**（`package.json` 里写死了版本号）
- 参考资料：Anthropic 官方技能 [brand-guidelines](https://github.com/anthropics/skills/tree/main/skills/brand-guidelines) 和 [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design)，社区整理的 [claude.com 设计规范](https://www.shadcn.io/design/claude)。只借鉴配色和排版思路，不使用 Anthropic 的商标、标识和商业授权字体。

## 目录结构

```
theme/
├── README.md            本文件
├── index.ts             主题入口：继承默认主题、挂上 Layout、加载字体和样式、图片放大
├── Layout.vue           往默认 Layout 的官方插槽里放组件
├── fonts.ts             标题衬线体（Source Serif 4 可变字体，自托管）
├── components/
│   ├── HomeHero.vue     首页大标题（插槽 home-hero-info）
│   ├── PostMeta.vue     文章标题上方的信息行（插槽 doc-before）
│   ├── PostList.vue     细线文章列表，首页、归档、分类和标签详情页共用
│   ├── RecentPosts.vue  首页的近期文章
│   ├── CategoryOverview.vue  分类页：每个分类列出最近三篇（栏目预览）
│   └── TagIndex.vue     标签页：标签名加篇数，自然换行（索引流）
└── styles/
    ├── index.css        样式入口，按下面的分层顺序引入
    ├── tokens.css       ① 设计变量
    ├── doc.css          ③ 正文样式（.vp-doc）
    └── overrides.css    ④ 内部样式覆盖
```

构建时的数据处理在上一级目录：`config.mts`（`transformPageData`）、`postMeta.ts`、`readingStats.ts`、`data/posts.data.ts`。

## 分层和优先级

改外观时，按下面的顺序找办法。上一层能做到，就不用下一层：

| 层 | 用什么 | 写在哪 | 稳定性 |
|---|---|---|---|
| ① 官方变量 | `--vp-*` CSS 变量，以及自己定义的 `--blog-*` 变量 | `styles/tokens.css` | 官方保证 |
| ② 官方插槽和配置 | 布局插槽、`themeConfig`、frontmatter 选项 | `Layout.vue`、`components/`、`config.mts` | 官方保证 |
| ③ 正文样式 | `.vp-doc` 下的元素选择器 | `styles/doc.css` | 通行做法，官方没有承诺不变 |
| ④ 内部样式覆盖 | `.VP*` 组件的 class、第三方库的 class | `styles/overrides.css` | 不保证，升级时最容易失效 |

第 ③、④ 层的每条规则都要登记在下面的清单里。新增、修改或删除时，同步更新本文件。

## 配色

亮色写在 `:root`，暗色写在 `.dark`。对比度按 WCAG 计算，目标是正文、次要文字和链接不低于 4.5:1。

| 用途 | 变量 | 亮色 | 暗色 | 对比度（亮 / 暗） |
|---|---|---|---|---|
| 页面底色 | `--vp-c-bg` | `#faf9f5` | `#1f1e1b` | |
| 下沉面：代码块、搜索框 | `--vp-c-bg-alt` | `#f3eee6` | `#181715` | |
| 浮起面：提示框 | `--vp-c-bg-soft` | `#efe9de` | `#252320` | |
| 浮层：菜单、搜索弹窗 | `--vp-c-bg-elv` | `#ffffff` | `#252320` | |
| 标题、粗体 | `--blog-ink` | `#141413` | `#faf9f5` | 17.5 / 15.8 |
| 正文 | `--vp-c-text-1` | `#3d3d3a` | `#e5e2da` | 10.3 / 12.9 |
| 次要文字：日期、字数、目录 | `--vp-c-text-2` | `#6c6a64` | `#a09d96` | 5.1 / 6.2 |
| 分隔线 | `--vp-c-divider` | `#e6dfd8` | `#34312c` | 只做装饰 |
| 链接、当前导航 | `--vp-c-brand-1` | `#a9583e` | `#e08a6d` | 4.8 / 6.4 |
| 链接悬停 | `--vp-c-brand-2` | `#8f4a33` | `#eba58c` | |
| 行内代码 | `--vp-code-color` / `--vp-code-bg` | `#8f4a33` / `#f4e7e0` | `#e8b49a` / 赭橙 16% | 5.4 / 7.4 |
| 点缀：目录标记 | `--blog-coral` | `#d97757` | `#d97757` | 3.0，**不能用于文字** |
| 首页主按钮 | `--blog-btn-*` | 赭橙 `#b85b38`，白字 | 赭橙 `#d97757`，墨色字 | 4.57 / 5.9 |

主按钮参照 claude.com 用赭橙。claude.com 用的 `#cc785c` 配白字只有 3.28:1，达不到正文大小文字的 4.5:1，所以亮色下加深到 `#b85b38`，悬停时是 `#9e4e30`（5.86:1）。想换回墨黑：把 `--blog-btn-bg`、`--blog-btn-text`、`--blog-btn-hover` 依次改成 `#141413`、`#faf9f5`、`#3d3d3a`。

提示框里，说明类（note、info、tip、important、details）统一用暖色浮起面；警告类（warning、caution、danger）保留 VitePress 默认的语义色。

## 字体

| 用途 | 字体 | 说明 |
|---|---|---|
| 标题 | Source Serif 4（可变字体，带光学尺寸轴）+ 系统宋体 | 开源字体，自托管；拉丁字符约 120 KB，只在用到时下载 |
| 正文、界面 | VitePress 默认（Inter + 系统中文字体） | 不另外加载 |
| 代码 | VitePress 默认的等宽字体 | 不另外加载 |

Windows 自带的宋体比较细，中文标题在 Windows 上会显得单薄一些，这是只用系统中文字体的代价。

## 官方插槽和配置（第 ② 层）

| 效果 | 机制 | 位置 |
|---|---|---|
| 首页大标题和按钮 | 插槽 `home-hero-info`。默认按钮的圆角写死成胶囊形，所以按钮不放在 `hero.actions` 里，改用自定义字段 `hero.links` | `components/HomeHero.vue`，内容在 `docs/index.md` 的 frontmatter |
| 首页正文不套 `.vp-doc` 样式 | frontmatter `markdownStyles: false` | `docs/index.md` |
| 文章标题上方的信息行 | 插槽 `doc-before`，只在 `posts/` 下显示 | `components/PostMeta.vue` |
| 导航栏 logo 和高度 | `themeConfig.logo`、`--vp-nav-logo-height` | `config.mts`、`tokens.css` |
| 导航栏半透明加毛玻璃 | `--vp-nav-bg-color`、`--vp-nav-backdrop-filter`（alpha.20 新增） | `tokens.css` |
| 最后更新于 | `lastUpdated: true`、`themeConfig.lastUpdated` | `config.mts` |
| 上一篇 / 下一篇 | `themeConfig.docFooter` 设小标题；每篇的 frontmatter `prev` / `next` 在 `transformPageData` 里按日期设置 | `config.mts` |
| 提示框、代码颜色 | `--vp-custom-block-*`、`--vp-code-*` | `tokens.css` |
| 图片点击放大 | 主题的 `setup()` 里挂 medium-zoom（社区通行做法），选择器用到了 `.vp-doc img`，见 D4 | `index.ts` |

## 正文样式清单（第 ③ 层，`styles/doc.css`）

默认规则来自 `vitepress/dist/client/theme-default/styles/components/vp-doc.css`。

| 编号 | 我们的规则 | 覆盖的默认值 | 原因 |
|---|---|---|---|
| D1 | `.vp-doc :is(h1, h2, h3)`：衬线体、字重 400、颜色 `--blog-ink` | 标题字重 600，字体和颜色继承正文 | 设计的核心：衬线标题、常规字重。VitePress 没有标题字体变量 |
| D1 | `.vp-doc h1`：2.5rem、行高 1.2 | 1.75rem、行高 1.43 | 衬线大标题需要更大字号、更紧的行高 |
| D1 | `.vp-doc h2`：1.625rem | 1.5rem | 衬线体视觉上偏小，稍微放大 |
| D2 | `.vp-doc`：字号 16.5px | 继承 body 的 16px | 中文正文略大一点更易读。设在容器上，提示框（`--vp-custom-block-font-size`）和表格仍按各自的规则 |
| D2 | `.vp-doc :is(p, li)`：行高 1.85 | `p` 是 1.75，`li` 继承 1.5 | 中文行距更松。提示框里的段落有更具体的默认规则，不受影响 |
| D2 | `.vp-doc strong`：颜色 `--blog-ink` | 只设了字重 600 | 正文颜色较浅，粗体回到标题色 |
| D3 | `.vp-doc a`：字重继承，下划线 1px、离字 4px，悬停 2px | 字重 500，下划线离字 0.125rem | 中文里 500 字重的链接显得重，下划线贴字 |
| D4 | `.vp-doc img`：圆角 8px | 无圆角 | 与代码块、提示框的圆角一致 |

文章列表、分类页、标签页的组件（`PostList.vue`、`CategoryOverview.vue`、`TagIndex.vue`）位于 `.vp-doc` 内，它们的 scoped 样式（类加属性选择器）优先级高于 `.vp-doc` 的列表、段落和链接规则，所以不需要另外覆盖。这几个列表里的链接都不加下划线：整页都是链接，下划线只会显得杂乱；正文里的链接仍按 D3 加下划线。

## 内部样式覆盖清单（第 ④ 层，`styles/overrides.css`）

| 编号 | 选择器 | 默认行为（所在组件） | 原因 | 核对版本 |
|---|---|---|---|---|
| O1 | `.VPNavBarTitle .logo` | logo 图片没有圆角（`VPNavBarTitle.vue` 里的 `VPImage`，class 为 `logo`） | `logo.png` 自带白底，方角在米色底上很突兀 | 2.0.0-alpha.21 |
| O2 | `.VPDocAsideOutline .outline-marker` | 背景色固定为 `--vp-c-brand-1`，没有单独的变量（`VPDocAsideOutline.vue`） | 目录标记用点缀色，和链接色区分开 | 2.0.0-alpha.21 |
| O3 | `.medium-zoom-overlay`、`.medium-zoom-image--opened` | medium-zoom 的放大层没有 z-index，会被导航栏（`--vp-z-index-nav: 30`）盖住 | 放大后的图片要在最上层 | medium-zoom 1.1.2 |

## 构建时的数据

- **字数和阅读时间**（`readingStats.ts`）：统计正文里的汉字和英文单词，跳过 frontmatter、代码块、行间公式、HTML、图片和链接网址。阅读速度按中文每分钟 400 字、英文每分钟 200 词估算。结果写进 `frontmatter.readingStats`，由 `PostMeta.vue` 显示，形如「约 1,100 字，3 分钟读完」。
- **上一篇 / 下一篇**（`postMeta.ts` 的 `listPosts`）：按日期从新到旧排序，同一天按网址排序，与 `posts.data.ts` 的顺序一致。「上一篇」是更早的一篇，「下一篇」是更新的一篇。文章列表在第一次用到时读取一次，所以开发服务器运行期间新增的文章，要重启后才会出现在前后篇里。
- **最后更新于**：VitePress 用 git 提交时间。Vercel 构建时默认浅克隆（只拉最近 10 个提交），更早改动过的文章时间会不准，需要在 Vercel 项目的环境变量里设 `VERCEL_DEEP_CLONE=true`。这个变量是社区通行做法，Vercel 官方文档里没有写。

## 升级 VitePress 时的检查清单

1. 在临时副本里装新版本并构建，对比新旧构建产物：页面列表、标题锚点、RSS、sitemap。
2. 对照新版的 `vp-doc.css` 检查 D1–D4：被覆盖的默认值有没有变化，有没有新增的同名规则抵消我们的设置。
3. 对照新版组件检查 O1–O3：class 名还在不在，有没有新增可以替代覆盖的官方变量。有的话，把覆盖改成变量，并从清单里删掉。
4. 确认插槽名 `home-hero-info`、`doc-before` 还在（`VPHero.vue`、`VPDoc.vue`），以及 `tokens.css` 里用到的变量都还在 `vars.css` 里。
5. 确认 `feedMarkers.ts` 的两道防护还需要：同一个 markdown-it 实例只注册一次，跳过 `renderInline`。
6. 浏览器里打开首页、一篇文章、归档页，亮色和暗色各看一遍。
7. 更新本文件开头和清单里的「核对版本」。
