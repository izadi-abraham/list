export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  modules: [
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/google-fonts",
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "http://localhost:4000",
      wsBase: process.env.NUXT_PUBLIC_WS_BASE ?? "ws://localhost:4000",
    },
  },

  i18n: {
    locales: [
      { code: "en", name: "English", dir: "ltr", file: "en.json" },
      { code: "fa", name: "فارسی", dir: "rtl", file: "fa.json" },
      { code: "nl", name: "Nederlands", dir: "ltr", file: "nl.json" },
    ],
    defaultLocale: "en",
    langDir: "locales/",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      redirectOn: "root",
    },
  },

  googleFonts: {
    families: { Vazirmatn: [300, 400, 500, 600, 700] },
    display: "swap",
  },

  tailwindcss: {
    viewer: false,
  },

  build: {
    transpile: ["@list/shared"],
  },
});
