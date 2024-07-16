<script setup lang="ts">
onMounted(async () => {
  await wait(1000);

  const route = useRoute();

  const redirect_uri = new URL(location.href);
  redirect_uri.search = "";

  const { success } = (await invokeAPI("/account/twitter/sign_in", {
    method: "POST",
    body: {
      code: route.query.code,
      state: route.query.state,
      host: location.host,
      redirect_uri: redirect_uri.toString(),
    },
  })) as { success: boolean };

  if (success) {
    navigateTo("/");
  }
});
</script>

<template>
  <div
    class="w-screen h-screen flex flex-row justify-center items-center font-semibold text-lg lg:text-xl"
  >
    <span>Please wait while we are redirecting you back...</span>
  </div>
</template>
