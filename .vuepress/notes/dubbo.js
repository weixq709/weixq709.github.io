import { defineNotesConfig } from 'vuepress-theme-plume'

export default defineNotesConfig({
  dir: 'dubbo',
  link: '/dubbo/',
  sidebar: [
    {
      text: 'dubbo',
      link: '/dubbo/',
      items: ['Dubbo SPI加载流程', 'Dubbo与Spring整合源码解析'],
    },
  ],
})
