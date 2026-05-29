<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const fullName = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

async function submit() {
  error.value = null
  loading.value = true
  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
      fullName: fullName.value || undefined,
    })
    await navigateTo('/app')
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.message ?? t('errors.generic')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-900 mb-6">{{ t('auth.createAccount') }}</h2>
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('auth.username') }}</label>
        <input
          v-model="username"
          type="text"
          required
          autocomplete="username"
          class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('auth.fullName') }}</label>
        <input
          v-model="fullName"
          type="text"
          autocomplete="name"
          class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('auth.email') }}</label>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('auth.password') }}</label>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="new-password"
          minlength="8"
          class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
      <p v-if="error" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ error }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
      >
        {{ loading ? '…' : t('auth.createAccount') }}
      </button>
    </form>
    <p class="mt-6 text-center text-sm text-gray-500">
      {{ t('auth.haveAccount') }}
      <NuxtLink to="/auth/login" class="font-medium text-gray-900 hover:underline">
        {{ t('auth.signIn') }}
      </NuxtLink>
    </p>
  </div>
</template>
