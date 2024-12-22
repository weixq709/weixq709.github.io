import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import theme from './.vuepress/theme'
import { getDirname, path } from 'vuepress/utils'

const __dirname = getDirname(import.meta.url)
const resolve = (...dirs) => path.resolve(__dirname, ...dirs)

const isProd = process.env.NODE_ENV === 'production'

export default defineUserConfig({
  lang: 'zh-CN',
  hostname: 'https://weixq709.github.io/blog/',
  locales: {
    '/': { lang: 'zh-CN', title: 'Steele\'s Blog', description: '一个后端开发者的博客' },
  },
  dest: 'docs',
  public: resolve('public'),
  temp: resolve('.vuepress/.temp'),
  cache: resolve('.vuepress/.cache'),
  plugins: [],

  bundler: viteBundler(),

  theme,
})
