import { defineNotesConfig } from 'vuepress-theme-plume'
import javaNotes from './java'
import dubboNotes from './dubbo'

export default defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [javaNotes, dubboNotes],
})
