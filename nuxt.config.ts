import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  future: {
    compatibilityVersion: 4,
  },
  experimental: {
    scanPageMeta: "after-resolve",
    sharedPrerenderData: false,
    compileTemplate: true,
    resetAsyncDataToUndefined: true,
    templateUtils: true,
    relativeWatchPaths: true,
    normalizeComponentNames: false,
    spaLoadingTemplateLocation: "within",
    defaults: {
      useAsyncData: {
        deep: true,
      },
    },
  },
  features: {
    inlineStyles: true,
  },
  unhead: {
    renderSSRHeadOptions: {
      omitLineBreaks: false,
    },
  },
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: [
    "@nuxt/test-utils",
    "@nuxt/scripts",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxt/eslint",
  ],
  css: ["/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    apiKey: process.env.GEMINI_API_KEY,
  },
});