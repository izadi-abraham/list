<script setup lang="ts">
// Public landing page — server-rendered for SEO
useSeoMeta({
  title: "List — Your personal list app",
  description: "A flexible personal list app for shopping, books, movies, meals, and more. Share lists in real time.",
  ogTitle: "List",
  ogDescription: "A flexible personal list app. Share lists in real time.",
});
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center p-8">
    <h1 class="text-4xl font-bold mb-4">List</h1>
    <p class="text-lg text-gray-600 mb-8 text-center max-w-md">
      A simple, flexible list app for your everyday life.
    </p>
    <div class="flex gap-4">
      <NuxtLink to="/auth/login" class="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
        Sign in
      </NuxtLink>
      <NuxtLink to="/auth/register" class="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
        Create account
      </NuxtLink>
    </div>
  </main>
</template>
