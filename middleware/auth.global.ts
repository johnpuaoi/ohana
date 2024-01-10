export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();

  // If user is already authenticated, continue
  if (user.value) {
    // If user are going to sign in page, redirect to defaultRedirect
    if (to.path === "/") {
      return navigateTo(
        (useAppConfig().defaultRedirect as string) || "/dashboard",
      );
    }
    return;
  }

  // If no user and they are going to sign in page, continue
  if (!user.value && to.path === "/") {
    return;
  }

  // If user and they are going to sign in page, redirect to dashboard with onAuthRedirectTo query param set to the original path they were trying to go to
  if (!user.value && to.path !== "/") {
    return navigateTo(`/?onAuthRedirectTo=${to.path}`);
  }

  // If user and onAuthRedirectTo query param is not set, redirect to defaultRedirect
  const defaultRedirect =
    (useAppConfig().defaultRedirect as string) || "/dashboard";

  return navigateTo(defaultRedirect);
});
