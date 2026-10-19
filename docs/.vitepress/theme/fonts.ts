// 自托管免费网络字体（@fontsource，OFL-1.1），只加载拉丁子集 + 用到的字重：
//   Source Serif 4 400（标题，约 21 KB；与中文宋体常规字重视觉一致） + IBM Plex Mono 400（元信息/代码，约 15 KB）
// 字体文件带 unicode-range，中文字符不会触发下载，中文仍走系统宋体/苹方。
// 想完全不用网络字体：在 theme/index.ts 里删掉 `import './fonts'` 这一行即可，
// 字体栈会自动回退到 Georgia / 宋体 / SF Mono 等系统字体。
import '@fontsource/source-serif-4/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
