<script setup lang="ts"></script>
<template>
  <main class="min-h-screen bg-black text-white font-noto">
    <NuxtLoadingIndicator />
    <div class="container">
      <slot />
    </div>
  </main>
</template>

<style scoped></style>
