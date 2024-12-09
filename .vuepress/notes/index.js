import { defineNotesConfig } from 'vuepress-theme-plume'
import javaNotes from './java'

export default defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [javaNotes],
})
