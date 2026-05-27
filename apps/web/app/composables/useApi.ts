export function useApi() {
  const { public: { apiBase } } = useRuntimeConfig();
  const authStore = useAuthStore();

  async function request<T>(
    path: string,
    options: Parameters<typeof $fetch>[1] = {}
  ): Promise<T> {
    const authHeader = authStore.accessToken
      ? { Authorization: `Bearer ${authStore.accessToken}` }
      : {};

    try {
      return await $fetch<T>(`${apiBase}${path}`, {
        ...options,
        headers: { ...authHeader, ...(options.headers as object ?? {}) },
      });
    } catch (err: any) {
      if (err?.status === 401 || err?.statusCode === 401) {
        const refreshed = await authStore.tryRefresh();
        if (refreshed && authStore.accessToken) {
          return await $fetch<T>(`${apiBase}${path}`, {
            ...options,
            headers: {
              ...authHeader,
              Authorization: `Bearer ${authStore.accessToken}`,
              ...(options.headers as object ?? {}),
            },
          });
        }
        await navigateTo("/auth/login");
      }
      throw err;
    }
  }

  return { request };
}
