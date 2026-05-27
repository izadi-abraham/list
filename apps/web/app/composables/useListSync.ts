import type { WsMessage } from "@list/shared";

export function useListSync(listId: Ref<number>) {
  const { public: { wsBase } } = useRuntimeConfig();
  const authStore = useAuthStore();
  const listStore = useListStore();

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  const connected = ref(false);

  function connect() {
    if (!authStore.accessToken) return;
    const url = `${wsBase}/ws/lists/${listId.value}?token=${authStore.accessToken}`;
    ws = new WebSocket(url);

    ws.onopen = () => {
      connected.value = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WsMessage;
        switch (msg.type) {
          case "item:created":
            listStore.addItem(msg.payload);
            break;
          case "item:updated":
            listStore.updateItem(msg.payload);
            break;
          case "item:deleted":
            listStore.removeItem(msg.payload.id);
            break;
          case "item:reordered":
            listStore.reorderItems(msg.payload);
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = (event) => {
      connected.value = false;
      ws = null;
      // Auto-reconnect on unexpected close (not 1000 normal, not 4001/4003 auth errors)
      if (event.code !== 1000 && event.code !== 4001 && event.code !== 4003) {
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      ws?.close();
    };
  }

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close(1000);
    ws = null;
  });

  return { connected: readonly(connected) };
}
