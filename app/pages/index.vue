<script setup lang="ts">
useSeoMeta({
  title: "Jasper Chat with Gemini AI: Easy & Powerful Interaction",
  description: "Experience simple and intuitive chat powered by Google's Gemini AI. Ask questions, brainstorm ideas, and explore the capabilities of generative AI in an easy-to-use chatbox.",
  ogTitle: "Jasper Chat with Gemini AI: Easy & Powerful Interaction",
  ogDescription: "Engage in seamless conversations with Google's Gemini AI through our simple chatbox. Discover the power of generative AI today!",
  ogImage: "/chat.png", // Replace with a relevant image URL (e.g., a screenshot of the chatbox or a Gemini logo)
  ogUrl: "https://jasper.re/chat", // Replace with the actual URL of this chat page
  twitterTitle: "Jasper Gemini AI Chat: Easy to Use",
  twitterDescription: "Chat effortlessly with Google's Gemini AI. A simple and powerful way to interact with generative intelligence.",
  twitterImage: "/chat.png", // Replace with a relevant image URL optimized for Twitter
  twitterCard: "summary",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
  ],
});
</script>
<template>
  <ChatBox />
</template>

<style scoped></style>
