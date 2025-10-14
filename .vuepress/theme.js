import { plumeTheme } from 'vuepress-theme-plume'

export default plumeTheme({
  // 部署域名
  hostname: 'https://weixq709.github.io',

  plugins: {
    shiki: {
      // 启用twoslash
      twoslash: true,
      languages: [
        'sh',
        'css',
        'html',
        'jsx',
        'javascript',
        'js',
        'ts',
        'json',
        'yaml',
        'tsx',
        'dockerfile',
        'bash',
        'yml',
        'md',
        'nginx',
        'toml',
        'rust',
        'vue',
        'java',
        'xml',
        'sql',
        'properties',
        'go'
      ],
    },
    markdownEnhance: { demo: true },
    markdownPower: {
      // 启动隐秘文本
      plot: {
        /**
         * 是否启用 `!! !!`  markdown （该标记为非标准标记，脱离插件将不生效）
         * 如果设置为 false， 则表示不启用该标记，只能使用 <Plot /> 组件
         * @default true
         */
        tag: true,

        /**
         * 遮罩层颜色
         * @type {string | { light: string, dark: string }}
         */
        mask: '#000',

        /**
         * 文本颜色
         * @type {string | { light: string, dark: string }}
         */
        color: '#fff',

        /**
         * 触发方式
         *
         * @default 'hover'
         */
        trigger: 'hover',
      },
      /**
       * 是否使用Can I Use, @see https://theme-plume.vuejs.press/guide/markdown/caniuse/
       */
      caniuse: true,
      jsfiddle: true,
    },
    fileTree: true, // :::file-tree  文件树容器
    icons: true, // :[collect:name]:   内联 iconify 图标

    // docsearch: {
    //   appId: "",
    //   apiKey: "",
    //   indexName: "",
    // },

    // 评论配置
    comment: {
      provider: 'Giscus', // "Artalk" | "Giscus" | "Twikoo" | "Waline"
      comment: true,
      repo: 'weixq709/blog',
      repoId: 'R_kgDOM9OBbw',
      category: 'General',
      categoryId: 'DIC_kwDOM9OBb84CjKry',
      mapping: 'pathname',
      reactionsEnabled: true,
      inputPosition: 'top',
      darkTheme: 'dark_protanopia',
      lightTheme: 'light_protanopia',
    },
  },
})
