export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchMe();
  }
});
