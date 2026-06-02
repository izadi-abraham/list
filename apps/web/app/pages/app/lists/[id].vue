<script setup lang="ts">
import type { ListItem, MemberRole } from '@list/shared'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const listStore = useListStore()
const authStore = useAuthStore()

const listId = computed(() => Number(route.params.id))

const { connected } = useListSync(listId)

const newItemName = ref('')
const addingItem = ref(false)
const addInput = ref<HTMLInputElement | null>(null)
const showChecked = ref(true)

// --- Settings sheet ---
const showSettings = ref(false)
const isOwner = computed(() => listStore.currentList?.ownerId === authStore.user?.id)

// Rename
const renameValue = ref('')
const renaming = ref(false)

watch(showSettings, (open) => {
  if (open) renameValue.value = listStore.currentList?.name ?? ''
})

async function renameList() {
  const name = renameValue.value.trim()
  if (!name || name === listStore.currentList?.name) return
  renaming.value = true
  try {
    const updated = await api.request<any>(`/lists/${listId.value}`, {
      method: 'PATCH',
      body: { name },
    })
    if (listStore.currentList) listStore.currentList.name = updated.name
    // sync dashboard list name too
    const dash = listStore.lists.find(l => l.id === listId.value)
    if (dash) dash.name = updated.name
  } finally {
    renaming.value = false
  }
}

// Invite
const inviteEmail = ref('')
const inviteRole = ref<'editor' | 'viewer'>('editor')
const inviting = ref(false)
const inviteError = ref<string | null>(null)

async function inviteMember() {
  const email = inviteEmail.value.trim()
  if (!email) return
  inviting.value = true
  inviteError.value = null
  try {
    const member = await api.request<any>(`/lists/${listId.value}/members`, {
      method: 'POST',
      body: { email, role: inviteRole.value },
    })
    listStore.currentList?.listMembers.push(member)
    inviteEmail.value = ''
  } catch (e: any) {
    inviteError.value = e?.data?.message ?? t('errors.generic')
  } finally {
    inviting.value = false
  }
}

// Remove member
async function removeMember(userId: number) {
  try {
    await api.request(`/lists/${listId.value}/members/${userId}`, { method: 'DELETE' })
    if (listStore.currentList) {
      listStore.currentList.listMembers = listStore.currentList.listMembers.filter(
        m => m.userId !== userId
      )
    }
  } catch (e: any) {
    alert(e?.data?.message ?? t('errors.generic'))
  }
}

// Delete list
const confirmDelete = ref(false)
const deleting = ref(false)

async function deleteList() {
  deleting.value = true
  try {
    await api.request(`/lists/${listId.value}`, { method: 'DELETE' })
    listStore.lists = listStore.lists.filter(l => l.id !== listId.value)
    await navigateTo('/app')
  } finally {
    deleting.value = false
  }
}

// --- SEO ---
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

// --- Item actions ---
async function addItem() {
  const name = newItemName.value.trim()
  if (!name) return
  addingItem.value = true
  try {
    const item = await api.request<ListItem>(`/lists/${listId.value}/items`, {
      method: 'POST',
      body: { name },
    })
    listStore.addItem(item)
    newItemName.value = ''
    addInput.value?.focus()
  } catch {
    // WS will not deliver if it failed
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
    listStore.updateItem(item)
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
    await api.request(`/lists/${listId.value}/items/${item.id}`, { method: 'DELETE' })
  } catch {
    listStore.addItem(item)
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-3 mb-5">
      <NuxtLink to="/app" class="p-1 -ml-1 text-gray-400 hover:text-gray-700 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h1 class="text-xl font-semibold text-gray-900 truncate flex-1">
        {{ listStore.currentList?.name ?? '…' }}
      </h1>
      <span
        :class="['w-2 h-2 rounded-full flex-shrink-0 transition-colors', connected ? 'bg-green-400' : 'bg-gray-300']"
        :title="connected ? 'Live' : 'Connecting…'"
      />
      <button
        @click="showSettings = true"
        class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        :aria-label="t('listSettings.title')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
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
          <button
            @click="toggleCheck(item)"
            class="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center hover:border-gray-500 transition-colors"
            aria-label="Check item"
          />
          <span class="flex-1 text-sm text-gray-900 leading-snug">{{ item.name }}</span>
          <div class="flex items-center gap-1 flex-shrink-0">
            <template v-if="item.quantity !== null">
              <button @click="decrementQty(item)" class="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-base font-medium hover:bg-gray-200 transition-colors leading-none">−</button>
              <span class="w-6 text-center text-sm font-medium tabular-nums">{{ item.quantity }}</span>
              <button @click="incrementQty(item)" class="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-base font-medium hover:bg-gray-200 transition-colors leading-none">+</button>
            </template>
            <button
              v-else
              @click="incrementQty(item)"
              class="w-7 h-7 rounded-lg text-gray-400 flex items-center justify-center text-base hover:bg-gray-100 hover:text-gray-600 transition-colors leading-none opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Add quantity"
            >+</button>
          </div>
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

      <!-- Empty state -->
      <div
        v-if="!listStore.uncheckedItems.length && !listStore.checkedItems.length"
        class="text-center py-16 text-gray-400"
      >
        <p class="text-4xl mb-3">🛒</p>
        <p class="text-sm">{{ t('list.empty') }}</p>
      </div>

      <!-- Checked items -->
      <div v-if="listStore.checkedItems.length">
        <button
          @click="showChecked = !showChecked"
          class="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-2 w-full text-left"
        >
          <svg :class="['w-3.5 h-3.5 transition-transform', showChecked ? 'rotate-90' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    <!-- Settings sheet -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSettings"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center"
          @click.self="showSettings = false"
        >
          <div class="bg-white rounded-t-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
            <!-- Sheet header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 class="text-base font-semibold text-gray-900">{{ t('listSettings.title') }}</h2>
              <button @click="showSettings = false" class="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Scrollable content -->
            <div class="overflow-y-auto flex-1 px-5 py-4 space-y-6">

              <!-- Rename section -->
              <section>
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {{ t('list.listName') }}
                </label>
                <div class="flex gap-2">
                  <input
                    v-model="renameValue"
                    type="text"
                    class="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    @keyup.enter="renameList"
                  />
                  <button
                    @click="renameList"
                    :disabled="renaming || !renameValue.trim() || renameValue.trim() === listStore.currentList?.name"
                    class="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
                  >
                    {{ t('common.save') }}
                  </button>
                </div>
              </section>

              <!-- Members section -->
              <section>
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {{ t('listSettings.members') }}
                </label>
                <div class="space-y-1">
                  <div
                    v-for="m in listStore.currentList?.listMembers"
                    :key="m.userId"
                    class="flex items-center gap-3 py-2"
                  >
                    <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                      {{ (m.user?.fullName || m.user?.username || '?')[0].toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ m.user?.fullName || m.user?.username }}
                        <span v-if="m.userId === authStore.user?.id" class="text-gray-400 font-normal"> · {{ t('listSettings.you') }}</span>
                      </p>
                      <p class="text-xs text-gray-400 capitalize">{{ t(`share.role.${m.role}`) }}</p>
                    </div>
                    <button
                      v-if="isOwner && m.userId !== authStore.user?.id"
                      @click="removeMember(m.userId)"
                      class="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1"
                    >
                      {{ t('common.remove') }}
                    </button>
                  </div>
                </div>
              </section>

              <!-- Invite section (owner only) -->
              <section v-if="isOwner">
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {{ t('share.inviteByEmail') }}
                </label>
                <div class="space-y-2">
                  <input
                    v-model="inviteEmail"
                    type="email"
                    :placeholder="t('auth.email')"
                    class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <div class="flex gap-2">
                    <button
                      v-for="role in (['editor', 'viewer'] as const)"
                      :key="role"
                      type="button"
                      @click="inviteRole = role"
                      :class="[
                        'flex-1 py-2 rounded-xl text-sm font-medium border transition-colors',
                        inviteRole === role
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      ]"
                    >
                      {{ t(`share.role.${role}`) }}
                    </button>
                  </div>
                  <p v-if="inviteError" class="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ inviteError }}</p>
                  <button
                    @click="inviteMember"
                    :disabled="inviting || !inviteEmail.trim()"
                    class="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
                  >
                    {{ inviting ? '…' : t('share.invite') }}
                  </button>
                </div>
              </section>

              <!-- Danger zone (owner only) -->
              <section v-if="isOwner" class="pb-2">
                <label class="block text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
                  {{ t('listSettings.dangerZone') }}
                </label>
                <div v-if="!confirmDelete">
                  <button
                    @click="confirmDelete = true"
                    class="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    {{ t('list.deleteList') }}
                  </button>
                </div>
                <div v-else class="bg-red-50 rounded-xl p-4 space-y-3">
                  <p class="text-sm text-red-700">{{ t('listSettings.confirmDelete') }}</p>
                  <div class="flex gap-2">
                    <button
                      @click="confirmDelete = false"
                      class="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      {{ t('common.cancel') }}
                    </button>
                    <button
                      @click="deleteList"
                      :disabled="deleting"
                      class="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {{ deleting ? '…' : t('common.delete') }}
                    </button>
                  </div>
                </div>
              </section>

            </div>
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
