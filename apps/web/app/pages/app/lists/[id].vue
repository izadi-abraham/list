<script setup lang="ts">
import type { ListItem } from '@list/shared'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const listStore = useListStore()

const listId = computed(() => Number(route.params.id))

// Real-time sync
const { connected } = useListSync(listId)

// Add item form
const newItemName = ref('')
const addingItem = ref(false)
const addInput = ref<HTMLInputElement | null>(null)

// Checked section expand/collapse
const showChecked = ref(true)

useSeoMeta({
  title: computed(() => listStore.currentList?.name ?? 'List'),
})

onMounted(async () => {
  listStore.loading = true
  listStore.error = null
  listStore.currentList = null
  try {
    listStore.currentList = await api.request<any>(`/lists/${listId.value}`)
  } catch (e: any) {
    listStore.error = e?.data?.message ?? t('errors.generic')
  } finally {
    listStore.loading = false
  }
})

async function addItem() {
  const name = newItemName.value.trim()
  if (!name) return
  addingItem.value = true
  try {
    const item = await api.request<ListItem>(`/lists/${listId.value}/items`, {
      method: 'POST',
      body: { name },
    })
    // Optimistically add; WS deduplicates
    listStore.addItem(item)
    newItemName.value = ''
    addInput.value?.focus()
  } catch {
    // ignore – WS will not deliver if it failed
  } finally {
    addingItem.value = false
  }
}

async function toggleCheck(item: ListItem) {
  const updated = { ...item, checked: !item.checked }
  listStore.updateItem(updated)
  try {
    await api.request(`/lists/${listId.value}/items/${item.id}`, {
      method: 'PATCH',
      body: { checked: !item.checked },
    })
  } catch {
    listStore.updateItem(item) // rollback
  }
}

async function incrementQty(item: ListItem) {
  const qty = (item.quantity ?? 0) + 1
  const updated = { ...item, quantity: qty }
  listStore.updateItem(updated)
  try {
    await api.request(`/lists/${listId.value}/items/${item.id}`, {
      method: 'PATCH',
      body: { quantity: qty },
    })
  } catch {
    listStore.updateItem(item)
  }
}

async function decrementQty(item: ListItem) {
  const qty = item.quantity && item.quantity > 1 ? item.quantity - 1 : null
  const updated = { ...item, quantity: qty }
  listStore.updateItem(updated)
  try {
    await api.request(`/lists/${listId.value}/items/${item.id}`, {
      method: 'PATCH',
      body: { quantity: qty },
    })
  } catch {
    listStore.updateItem(item)
  }
}

async function deleteItem(item: ListItem) {
  listStore.removeItem(item.id)
  try {
    await api.request(`/lists/${listId.value}/items/${item.id}`, {
      method: 'DELETE',
    })
  } catch {
    // Re-add optimistically removed item
    listStore.addItem(item)
  }
}
</script>

<template>
  <div>
    <!-- Header row -->
    <div class="flex items-center gap-3 mb-5">
      <NuxtLink to="/app" class="p-1 -ml-1 text-gray-400 hover:text-gray-700 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h1 class="text-xl font-semibold text-gray-900 truncate flex-1">
        {{ listStore.currentList?.name ?? '…' }}
      </h1>
      <!-- WS connection dot -->
      <span
        :class="['w-2 h-2 rounded-full flex-shrink-0 transition-colors', connected ? 'bg-green-400' : 'bg-gray-300']"
        :title="connected ? 'Live' : 'Connecting…'"
      />
    </div>

    <!-- Loading skeleton -->
    <div v-if="listStore.loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-2xl animate-pulse" />
    </div>

    <!-- Error -->
    <p v-else-if="listStore.error" class="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
      {{ listStore.error }}
    </p>

    <template v-else>
      <!-- Add item form -->
      <form @submit.prevent="addItem" class="flex gap-2 mb-6">
        <input
          ref="addInput"
          v-model="newItemName"
          type="text"
          :placeholder="t('item.addPlaceholder')"
          class="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <button
          type="submit"
          :disabled="addingItem || !newItemName.trim()"
          class="px-5 py-3 bg-gray-900 text-white rounded-2xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          {{ t('list.addItem') }}
        </button>
      </form>

      <!-- Unchecked items -->
      <div v-if="listStore.uncheckedItems.length" class="space-y-2 mb-4">
        <div
          v-for="item in listStore.uncheckedItems"
          :key="item.id"
          class="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 group transition-all"
        >
          <!-- Check button -->
          <button
            @click="toggleCheck(item)"
            class="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center hover:border-gray-500 transition-colors"
            aria-label="Check item"
          />

          <!-- Name -->
          <span class="flex-1 text-sm text-gray-900 leading-snug">{{ item.name }}</span>

          <!-- Quantity stepper -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <template v-if="item.quantity !== null">
              <button
                @click="decrementQty(item)"
                class="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-base font-medium hover:bg-gray-200 transition-colors leading-none"
              >−</button>
              <span class="w-6 text-center text-sm font-medium tabular-nums">{{ item.quantity }}</span>
              <button
                @click="incrementQty(item)"
                class="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-base font-medium hover:bg-gray-200 transition-colors leading-none"
              >+</button>
            </template>
            <button
              v-else
              @click="incrementQty(item)"
              class="w-7 h-7 rounded-lg text-gray-400 flex items-center justify-center text-base hover:bg-gray-100 hover:text-gray-600 transition-colors leading-none opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Add quantity"
            >+</button>
          </div>

          <!-- Delete -->
          <button
            @click="deleteItem(item)"
            class="w-7 h-7 rounded-lg text-gray-300 flex items-center justify-center hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            :aria-label="t('item.delete')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty state (no items at all) -->
      <div
        v-if="!listStore.uncheckedItems.length && !listStore.checkedItems.length"
        class="text-center py-16 text-gray-400"
      >
        <p class="text-4xl mb-3">🛒</p>
        <p class="text-sm">{{ t('list.empty') }}</p>
      </div>

      <!-- Checked items section -->
      <div v-if="listStore.checkedItems.length">
        <button
          @click="showChecked = !showChecked"
          class="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-2 w-full text-left"
        >
          <svg
            :class="['w-3.5 h-3.5 transition-transform', showChecked ? 'rotate-90' : '']"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          {{ listStore.checkedItems.length }} {{ t('list.checkedCount', listStore.checkedItems.length) }}
        </button>

        <div v-if="showChecked" class="space-y-2">
          <div
            v-for="item in listStore.checkedItems"
            :key="item.id"
            class="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 opacity-50 group transition-all"
          >
            <!-- Uncheck button -->
            <button
              @click="toggleCheck(item)"
              class="w-6 h-6 rounded-full bg-gray-400 border-2 border-gray-400 flex-shrink-0 flex items-center justify-center hover:bg-gray-500 transition-colors"
              aria-label="Uncheck item"
            >
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </button>

            <span class="flex-1 text-sm text-gray-500 line-through">{{ item.name }}</span>

            <button
              @click="deleteItem(item)"
              class="w-7 h-7 rounded-lg text-gray-300 flex items-center justify-center hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              :aria-label="t('item.delete')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
