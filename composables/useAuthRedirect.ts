/**
 * Watches the user, when a user logs in, if there is a query param `onAuthRedirectTo` it will redirect to that url, otherwise it will redirect to the defaultRedirect (default: appConfig.defaultRedirect or /dashboard), if the user logs out, it will redirect to the root url. The only exposed item is the `setDefaultRedirect` function, use it to set where the user should be redirected when there is no onAuthRedirectTo query param. Use this composable in app.vue.
 */
const useAuthRedirect = () => {
  const user = useSupabaseUser();
  const route = useRoute();
  const defaultRedirect = ref(
    (useAppConfig().defaultRedirect as string) || "/dashboard",
  );

  watch(user, async (newUser, oldUser) => {
    // User signed out
    if (oldUser && !newUser) {
      await navigateTo("/");
    }

    // User signed in
    if (!oldUser && newUser) {
      // If there is a query param onAuthRedirectTo, redirect to that url
      if (route.query.onAuthRedirectTo) {
        await navigateTo(route.query.onAuthRedirectTo as string);
        return;
      } else {
        await navigateTo(defaultRedirect.value);
      }
    }
  });

  function setDefaultRedirect(url: string) {
    defaultRedirect.value = url;
  }

  return {
    setDefaultRedirect,
  };
};

export default useAuthRedirect;
