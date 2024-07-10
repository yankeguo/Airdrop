<script setup lang="ts">
const walletStatus = ref(0);

const checkWalletStatus = () => {
  return (
    typeof window !== "undefined" && "ethereum" in window && "ethers" in window
  );
};

onMounted(async () => {
  if (!checkWalletStatus()) {
    walletStatus.value = -1;
    return;
  }
  walletStatus.value = 1;
});
</script>

<template>
  <UContainer class="pt-6 lg:pt-8">
    <div
      class="flex flex-row justify-center lg:justify-start items-center font-bold text-xl lg:text-3xl"
    >
      <span>claim your</span>
      <img src="~/assets/token-icon.svg" class="w-8 ms-2 me-1" />
      <span class="text-lime-400">YGTOG</span><span class="ms-2">drop</span>
    </div>
    <div
      class="flex flex-row justify-start items-center font-semibold text-lg lg:text-xl mt-6"
    >
      <span>1. connect a wallet</span>
    </div>
    <ClientOnly>
      <div
        class="flex flex-row justify-start items-center text-lg lg:text-xl mt-4 ms-4"
      >
        <template v-if="walletStatus === 0">
          <span>loading...</span>
        </template>
        <template v-if="walletStatus === -1">
          <span class="text-red-400"
            >wallet not found, please install one.</span
          >
          <UButton
            to="https://metamask.io/download/"
            variant="outline"
            icon="i-logos-metamask-icon"
            color="orange"
            label="Metamask"
            class="ms-3"
          >
            <template #trailing>
              <UIcon name="i-heroicons-arrow-right-20-solid" class="w-5 h-5" />
            </template>
          </UButton>
        </template>
      </div>
    </ClientOnly>
  </UContainer>
</template>
