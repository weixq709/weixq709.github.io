import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";
import theme from "./.vuepress/theme";
import { getDirname, path } from 'vuepress/utils'

const __dirname = getDirname(import.meta.url);
const resolve = (...dirs) => path.resolve(__dirname, ...dirs);

const isProd = process.env.NODE_ENV === "production";

export default defineUserConfig({
  base: '/blog/',
  lang: "zh-CN",
  locales: {
    "/": { lang: "zh-CN", title: "魏小强", description: "热爱生活" },
  },
  dest: "docs",
  public: resolve("public"),
  temp: resolve(".vuepress/.temp"),
  cache: resolve(".vuepress/.cache"),
  plugins: [],

  bundler: viteBundler(),

  theme,
});
