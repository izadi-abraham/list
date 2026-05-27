export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const publicPaths = ["/", "/auth/login", "/auth/register"];
  const isPublic = publicPaths.includes(to.path) || publicPaths.some((p) =>
    to.path.startsWith(`${p}/`)
  );

  if (!isPublic && !authStore.isAuthenticated) {
    return navigateTo("/auth/login");
  }

  if (
    (to.path === "/auth/login" || to.path === "/auth/register") &&
    authStore.isAuthenticated
  ) {
    return navigateTo("/app");
  }
});
