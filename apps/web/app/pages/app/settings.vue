<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t, locale, setLocale } = useI18n()
const api = useApi()
const authStore = useAuthStore()

const fullName = ref(authStore.user?.fullName ?? '')
const saving = ref(false)
const saved = ref(false)

async function saveProfile() {
  saving.value = true
  saved.value = false
  try {
    await api.request('/users/me', {
      method: 'PATCH',
      body: { fullName: fullName.value.trim() || null },
    })
    await authStore.fetchMe()
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } finally {
    saving.value = false
  }
}

async function switchLocale(code: 'en' | 'fa' | 'nl') {
  await setLocale(code)
  await api.request('/users/me', { method: 'PATCH', body: { locale: code } })
}

const locales = [
  { code: 'en' as const, label: 'English' },
  { code: 'fa' as const, label: 'فارسی' },
  { code: 'nl' as const, label: 'Nederlands' },
]
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-xl font-semibold text-gray-900">{{ t('nav.settings') }}</h1>

    <!-- Profile section -->
    <section>
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {{ t('settings.profile') }}
      </h2>
      <div class="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('auth.fullName') }}</label>
          <input
            v-model="fullName"
            type="text"
            class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            @keyup.enter="saveProfile"
          />
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="saveProfile"
            :disabled="saving"
            class="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {{ saving ? '…' : t('common.save') }}
          </button>
          <Transition name="fade">
            <span v-if="saved" class="text-sm text-green-600">{{ t('settings.saved') }}</span>
          </Transition>
        </div>
        <div class="pt-1 border-t border-gray-100 text-sm text-gray-500 space-y-0.5">
          <p>{{ authStore.user?.username }}</p>
          <p>{{ authStore.user?.email }}</p>
        </div>
      </div>
    </section>

    <!-- Language section -->
    <section>
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {{ t('settings.language') }}
      </h2>
      <div class="bg-white rounded-2xl border border-gray-100 p-4">
        <div class="flex gap-2">
          <button
            v-for="loc in locales"
            :key="loc.code"
            @click="switchLocale(loc.code)"
            :class="[
              'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors',
              locale === loc.code
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            ]"
          >
            {{ loc.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Account section -->
    <section>
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Account
      </h2>
      <div class="bg-white rounded-2xl border border-gray-100 p-4">
        <button
          @click="authStore.logout().then(() => navigateTo('/'))"
          class="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
        >
          {{ t('nav.signOut') }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
