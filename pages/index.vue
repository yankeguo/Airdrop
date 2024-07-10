<script setup lang="ts">
import { ethers } from "ethers";

const GNOSIS_MAINNET_PARAMS = {
  chainId: "0x64",
  chainName: "Gnosis",
  nativeCurrency: {
    name: "XDAI",
    symbol: "XDAI",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.gnosischain.com/"],
  blockExplorerUrls: ["https://gnosisscan.io/"],
};

declare global {
  interface Window {
    ethereum: any;
    walletProvider: ethers.BrowserProvider;
  }
}

enum WALLET_STATUS {
  LOADING = "loading",
  OK = "ok",
  NOT_FOUND = "not_found",
}

const walletStatus = ref(WALLET_STATUS.LOADING);
const address = ref("");

onMounted(async () => {
  walletStatus.value =
    typeof window !== "undefined" && window.ethereum
      ? WALLET_STATUS.OK
      : WALLET_STATUS.NOT_FOUND;

  if (walletStatus.value === WALLET_STATUS.NOT_FOUND) {
    return;
  }

  window.walletProvider = new ethers.BrowserProvider(window.ethereum);
});

async function connectWallet() {
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [GNOSIS_MAINNET_PARAMS],
  });
  const signer = await window.walletProvider.getSigner();
  address.value = await signer.getAddress();
}
</script>

<template>
  <UContainer class="pt-6 lg:pt-8">
    <div
      class="flex flex-row justify-center lg:justify-start items-center font-bold text-xl lg:text-3xl"
    >
      <span>claim your</span>
      <img src="~/assets/token-icon.svg" class="w-8 ms-2 me-1" />
      <span class="text-lime-400">YGTOG</span><span class="ms-2">airdrop</span>
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
        <template v-if="walletStatus === WALLET_STATUS.LOADING">
          <span>loading...</span>
        </template>
        <template v-if="walletStatus === WALLET_STATUS.NOT_FOUND">
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
        <template v-if="walletStatus === WALLET_STATUS.OK">
          <UButton
            variant="outline"
            label="connect wallet"
            @click="connectWallet"
          ></UButton>
          <span>{{ address }}</span>
        </template>
      </div>
    </ClientOnly>
  </UContainer>
</template>
