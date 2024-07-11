<script setup lang="ts">
onMounted(async () => {
  await wait(1000);

  const route = useRoute();

  const { success } = (await invokeAPI("/account/github/sign_in", {
    method: "POST",
    body: {
      code: route.query.code,
      state: route.query.state,
      host: location.host,
      redirect_uri: location.href,
    },
  })) as { success: boolean };

  if (success) {
    navigateTo("/");
  }
});
</script>

<template>
  <div
    class="w-screen h-screen flex flex-row justify-center items-center font-bold text-xl lg:text-3xl"
  >
    <span>Please wait while we are redirecting you back...</span>
  </div>
</template>
