import { defineClientConfig } from "vuepress/client";
import CustomComponent from "./src/views/Custom.vue";

export default defineClientConfig({
  enhance({ app }) {
    app.component("CustomComponent", CustomComponent);
  },
});
