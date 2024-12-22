import { defineNotesConfig } from 'vuepress-theme-plume'

export default defineNotesConfig({
  dir: 'java',
  link: '/java/',
  sidebar: [{
    dir: 'spring',
    text: 'Spring',
    items: ['aop']
  }],
})
