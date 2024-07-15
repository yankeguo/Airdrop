<script setup lang="ts">
import { YGTOG } from "@yankeguo/ygtog";

const scanURL = computed(() => {
  if (YGTOG.contract.chain === "gnosis") {
    return `https://gnosis.blockscout.com/token/${YGTOG.contract.address}`;
  }
  return "https://yankeguo.com";
});
</script>

<template>
  <div class="flex flex-col gap-2 lg:gap-3 font-bold">
    <a
      class="flex flex-row items-center text-xl lg:text-2xl"
      :href="scanURL"
      target="_blank"
    >
      <img src="~/assets/token-icon.svg" class="w-6 lg:w-8 ms-2 me-1" />
      <span class="text-lime-400 ms-1">Token of Gratitude by Yanke Guo</span>
    </a>
  </div>
</template>
