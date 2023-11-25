// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@vueuse/nuxt', '@nuxtjs/google-fonts', '@nuxtjs/fontaine'],
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
    voiceModelId: process.env.VOICE_MODEL_ID,
  },
  googleFonts: {
    display: "swap",
    families: {
      Inter: [400, 500, 600, 700, 800, 900],
    },
  },
})
