import { plumeTheme } from "vuepress-theme-plume";

export default plumeTheme({
  // 部署域名
  hostname: "",

  plugins: {
    shiki: {
      lineNumbers: 10,
      languages: [
        "sh",
        "css",
        "html",
        "jsx",
        "javascript",
        "js",
        "ts",
        "json",
        "yaml",
        "tsx",
        "dockerfile",
        "bash",
        "yml",
        "md",
        "nginx",
        "toml",
        "rust",
        "vue",
      ],
    },
    markdownEnhance: { demo: true },
    markdownPower: { caniuse: true, jsfiddle: true },

    // docsearch: {
    //   appId: "",
    //   apiKey: "",
    //   indexName: "",
    // },

    // 评论配置
    // comment: {
    //   provider: "Giscus", // "Artalk" | "Giscus" | "Twikoo" | "Waline"
    //   comment: true,
    //   repo: "",
    //   repoId: "",
    //   category: "",
    //   categoryId: "",
    //   mapping: "pathname",
    //   reactionsEnabled: true,
    //   inputPosition: "top",
    //   darkTheme: "dark_protanopia",
    //   lightTheme: "light_protanopia",
    // },
  },
});
