import { defineNotesConfig } from 'vuepress-theme-plume'
import demoNotes from './demo'

export default defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [demoNotes],
})
