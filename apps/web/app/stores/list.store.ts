import type { List, ListItem, ListMember } from "@list/shared";

type ListWithRole = List & { role: string };
type ListWithDetails = List & {
  items: ListItem[];
  listMembers: Array<ListMember & { user: { id: number; username: string; email: string; fullName: string | null } }>;
};

export const useListStore = defineStore("list", () => {
  const lists = ref<ListWithRole[]>([]);
  const currentList = ref<ListWithDetails | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const sortedItems = computed(() =>
    currentList.value
      ? [...currentList.value.items].sort((a, b) => a.position - b.position)
      : []
  );

  const uncheckedItems = computed(() =>
    sortedItems.value.filter((i) => !i.checked)
  );

  const checkedItems = computed(() =>
    sortedItems.value.filter((i) => i.checked)
  );

  // Called by useListSync when WS messages arrive
  function addItem(item: ListItem) {
    if (!currentList.value || currentList.value.id !== item.listId) return;
    if (!currentList.value.items.find((i) => i.id === item.id)) {
      currentList.value.items.push(item);
    }
  }

  function updateItem(updated: ListItem) {
    if (!currentList.value) return;
    const idx = currentList.value.items.findIndex((i) => i.id === updated.id);
    if (idx !== -1) currentList.value.items[idx] = updated;
  }

  function removeItem(id: number) {
    if (!currentList.value) return;
    currentList.value.items = currentList.value.items.filter((i) => i.id !== id);
  }

  function reorderItems(payload: Array<{ id: number; position: number }>) {
    if (!currentList.value) return;
    for (const { id, position } of payload) {
      const item = currentList.value.items.find((i) => i.id === id);
      if (item) item.position = position;
    }
  }

  return {
    lists,
    currentList,
    loading,
    error,
    sortedItems,
    uncheckedItems,
    checkedItems,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
  };
});
