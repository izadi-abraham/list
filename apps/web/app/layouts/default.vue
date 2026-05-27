<script setup lang="ts">
const authStore = useAuthStore();
const { t } = useI18n();

async function handleLogout() {
  await authStore.logout();
  await navigateTo("/");
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Top navigation -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/app" class="text-lg font-bold tracking-tight text-gray-900">
          List
        </NuxtLink>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500 hidden sm:block">
            {{ authStore.user?.username }}
          </span>
          <button
            @click="handleLogout"
            class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            {{ t("nav.signOut") }}
          </button>
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      <slot />
    </main>
  </div>
</template>
