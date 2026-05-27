import type { User, AuthResponse } from "@list/shared";

export const useAuthStore = defineStore("auth", () => {
  const { public: { apiBase } } = useRuntimeConfig();

  const accessToken = useCookie<string | null>("list_at", {
    maxAge: 60 * 15,
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });
  const refreshToken = useCookie<string | null>("list_rt", {
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });

  const user = useState<User | null>("auth_user", () => null);
  const isAuthenticated = computed(() => !!accessToken.value);

  async function login(email: string, password: string) {
    const res = await $fetch<AuthResponse>(`${apiBase}/auth/login`, {
      method: "POST",
      body: { email, password },
    });
    accessToken.value = res.accessToken;
    refreshToken.value = res.refreshToken;
    user.value = res.user;
    return res.user;
  }

  async function register(data: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }) {
    const res = await $fetch<AuthResponse>(`${apiBase}/auth/register`, {
      method: "POST",
      body: data,
    });
    accessToken.value = res.accessToken;
    refreshToken.value = res.refreshToken;
    user.value = res.user;
    return res.user;
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await $fetch(`${apiBase}/auth/logout`, {
          method: "POST",
          headers: accessToken.value
            ? { Authorization: `Bearer ${accessToken.value}` }
            : {},
          body: { refreshToken: refreshToken.value },
        });
      }
    } finally {
      accessToken.value = null;
      refreshToken.value = null;
      user.value = null;
    }
  }

  async function tryRefresh(): Promise<boolean> {
    if (!refreshToken.value) return false;
    try {
      const res = await $fetch<{ accessToken: string; refreshToken: string }>(
        `${apiBase}/auth/refresh`,
        { method: "POST", body: { refreshToken: refreshToken.value } }
      );
      accessToken.value = res.accessToken;
      refreshToken.value = res.refreshToken;
      return true;
    } catch {
      accessToken.value = null;
      refreshToken.value = null;
      user.value = null;
      return false;
    }
  }

  async function fetchMe() {
    if (!accessToken.value) return;
    try {
      user.value = await $fetch<User>(`${apiBase}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      });
    } catch (err: any) {
      if (err?.status === 401 || err?.statusCode === 401) {
        const ok = await tryRefresh();
        if (ok && accessToken.value) {
          user.value = await $fetch<User>(`${apiBase}/users/me`, {
            headers: { Authorization: `Bearer ${accessToken.value}` },
          }).catch(() => null);
        }
      }
    }
  }

  return {
    accessToken: computed(() => accessToken.value),
    refreshToken: computed(() => refreshToken.value),
    user: readonly(user),
    isAuthenticated,
    login,
    register,
    logout,
    tryRefresh,
    fetchMe,
  };
});
