<script setup lang="ts">
import type { List, ListType } from '@list/shared'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const api = useApi()
const listStore = useListStore()

const showCreate = ref(false)
const newListName = ref('')
const newListType = ref<ListType>('shopping')
const creating = ref(false)
const createError = ref<string | null>(null)

const typeEmoji: Record<ListType, string> = {
  shopping: '🛒',
  books: '📚',
  movies: '🎬',
  food: '🍽️',
  custom: '📋',
}

onMounted(async () => {
  listStore.loading = true
  listStore.error = null
  try {
    listStore.lists = await api.request<any[]>('/lists')
  } catch (e: any) {
    listStore.error = e?.data?.message ?? t('errors.generic')
  } finally {
    listStore.loading = false
  }
})

async function createList() {
  if (!newListName.value.trim()) return
  createError.value = null
  creating.value = true
  try {
    const list = await api.request<List & { role: string }>('/lists', {
      method: 'POST',
      body: { name: newListName.value.trim(), type: newListType.value },
    })
    listStore.lists.push(list)
    newListName.value = ''
    newListType.value = 'shopping'
    showCreate.value = false
    await navigateTo(`/app/lists/${list.id}`)
  } catch (e: any) {
    createError.value = e?.data?.message ?? t('errors.generic')
  } finally {
    creating.value = false
  }
}

function openCreate() {
  createError.value = null
  showCreate.value = true
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-gray-900">{{ t('nav.myLists') }}</h1>
      <button
        @click="openCreate"
        class="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        + {{ t('list.newList') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="listStore.loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 rounded-2xl animate-pulse" />
    </div>

    <!-- Error -->
    <p v-else-if="listStore.error" class="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
      {{ listStore.error }}
    </p>

    <!-- Empty state -->
    <div v-else-if="!listStore.lists.length" class="text-center py-20 text-gray-400">
      <p class="text-5xl mb-4">📋</p>
      <p class="text-sm">{{ t('list.noLists') }}</p>
    </div>

    <!-- Lists -->
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="list in listStore.lists"
        :key="list.id"
        :to="`/app/lists/${list.id}`"
        class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all active:scale-[0.98]"
      >
        <span class="text-2xl select-none">{{ typeEmoji[list.type as ListType] }}</span>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate">{{ list.name }}</p>
          <p class="text-xs text-gray-400 capitalize mt-0.5">
            {{ t(`list.type.${list.type}`) }}
          </p>
        </div>
        <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>

    <!-- Create list modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showCreate"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          @click.self="showCreate = false"
        >
          <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 class="text-lg font-semibold text-gray-900 mb-5">{{ t('list.newList') }}</h2>
            <form @submit.prevent="createList" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('list.listName') }}</label>
                <input
                  v-model="newListName"
                  type="text"
                  required
                  autofocus
                  class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('list.addItem') }}</label>
                <div class="grid grid-cols-5 gap-2">
                  <button
                    v-for="(emoji, type) in typeEmoji"
                    :key="type"
                    type="button"
                    :title="t(`list.type.${type}`)"
                    @click="newListType = type as ListType"
                    :class="[
                      'flex items-center justify-center p-2.5 rounded-xl border text-2xl transition-colors',
                      newListType === type
                        ? 'border-gray-900 bg-gray-50 shadow-inner'
                        : 'border-gray-100 hover:border-gray-300'
                    ]"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
              <p v-if="createError" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ createError }}</p>
              <div class="flex gap-3 pt-1">
                <button
                  type="button"
                  @click="showCreate = false"
                  class="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="creating"
                  class="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {{ creating ? '…' : t('list.create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
