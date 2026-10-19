// 自托管免费网络字体（@fontsource，OFL-1.1），只加载拉丁子集 + 用到的字重：
//   Source Serif 4 400（标题，约 21 KB；与中文宋体常规字重视觉一致） + IBM Plex Mono 400（元信息/代码，约 15 KB）
//   IBM Plex Mono 500：目录标题、提示框标题、首页“近期文章”、归档年份用的 500 字重
//   Source Serif 4 400 斜体 / 600：引用块里的 *斜体* 和 **加粗**，避免浏览器合成伪斜体 / 伪粗体
//   latin-ext 400：Schölkopf 这类带变音符号的字母
// 字体文件带 unicode-range，且只在页面真正用到该字形/字重时才下载；中文字符不会触发下载，中文仍走系统宋体/苹方。
// 想完全不用网络字体：在 theme/index.ts 里删掉 `import './fonts'` 这一行即可，
// 字体栈会自动回退到 Georgia / 宋体 / SF Mono 等系统字体。
import '@fontsource/source-serif-4/latin-400.css'
import '@fontsource/source-serif-4/latin-ext-400.css'
import '@fontsource/source-serif-4/latin-400-italic.css'
import '@fontsource/source-serif-4/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-ext-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
