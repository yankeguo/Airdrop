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
  <div
    class="flex flex-col items-center md:items-start font-semibold text-lg md:text-xl"
  >
    <a :href="scanURL" class="flex flex-row items-center">
      <img src="~/assets/token-icon.svg" class="w-6 lg:w-8 ms-2 me-1" />
      <span class="text-lime-400 ms-1">Token of Gratitude by Yanke Guo</span>
    </a>
  </div>
</template>
