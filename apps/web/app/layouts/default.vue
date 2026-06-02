<script setup lang="ts">
const authStore = useAuthStore();
const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/app" class="text-lg font-bold tracking-tight text-gray-900">
          List
        </NuxtLink>
        <div class="flex items-center gap-1">
          <NuxtLink
            to="/app/settings"
            class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            :aria-label="t('nav.settings')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </header>
    <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      <slot />
    </main>
  </div>
</template>
