import { defineThemeConfig } from 'vuepress-theme-plume'
import notes from './notes/index.js'
import navbar from './navbar.js'

export default defineThemeConfig({
  logo: '/images/profile.png',
  // 文档git仓库
  docsRepo: 'https://github.com/weixq709/blog',
  //
  docsDir: 'src',

  navbar,
  notes,

  profile: {
    name: 'Steele Wayne',
    avatar: '/images/profile.png',
    description: '慢慢来反而是最快的',
    circle: true,
    location: '杭州 中国',
  },
  // 社交链接
  social: [
    { icon: 'github', link: 'https://github.com/weixq709' },
    { icon: 'gitee', link: 'https://gitee.com/plato8311' },
  ],

  blog: {
    /**
     * 通过 glob string 配置包含文件，
     * 默认读取 源目录中的所有 `.md` 文件，但会排除 `notes` 配置中用于笔记的目录。
     */
    include: ['**/*.md'],
    // 如果希望只将源目录下某个目录下的文章读取为博客文章，比如 `blog` 目录，可以配置为：
    // include: ['blog/**/*.md'],

    /**
     * 通过 glob string 配置排除的文件，相对于 源目录
     */
    exclude: ['views'],

    // 禁用分页
    // pagination: false,
    // 每页显示的文章数量
    pagination: 15,
  },

  editLinkText: '在 GitHub 上编辑此页',
  footer: { copyright: `Copyright © ${new Date().getFullYear()}-present weixiaoqiang` },
  externalLinkIcon: false,
})
