import { defineClientConfig } from 'vuepress/client'
import CustomComponent from './src/views/Custom.vue'
import './.vuepress/styles/index.css'

export default defineClientConfig({
  enhance({ app }) {
    app.component('CustomComponent', CustomComponent)
  },
})
