<script setup lang="ts">
import { ethers } from "ethers";

const uiReady = ref(false);

const address = ref("");

const fetchingAccountGitHub = ref(0);
const updatingAccountGitHub = ref(0);

const accountGitHubID = ref("");
const accountGitHubUsername = ref("");

const buttonGitHubDisabled = computed(() => {
  return (
    !uiReady.value ||
    fetchingAccountGitHub.value > 0 ||
    updatingAccountGitHub.value > 0
  );
});

const buttonGitHubLoading = computed(() => {
  return updatingAccountGitHub.value > 0;
});

async function fetchAccountGitHub() {
  fetchingAccountGitHub.value++;
  try {
    const { id, username }: { id: string; username: string } =
      await invokeAPI("/account/github");
    accountGitHubID.value = id;
    accountGitHubUsername.value = username;
  } finally {
    fetchingAccountGitHub.value--;
  }
}

async function connectGitHub() {
  updatingAccountGitHub.value++;
  try {
    const { url }: { url: string } = await invokeAPI(
      "/account/github/authorize_url",
      {
        query: { host: location.host },
      },
    );
    uiReady.value = false;
    navigateTo(url, { external: true });
  } finally {
    updatingAccountGitHub.value--;
  }
}

async function disconnectGitHub() {
  if (!confirm("Confirm to disconnect GitHub account?")) return;
  updatingAccountGitHub.value++;
  try {
    await invokeAPI("/account/github/sign_out", {
      method: "POST",
      body: {},
    });
    await fetchAccountGitHub();
  } finally {
    updatingAccountGitHub.value--;
  }
}

onMounted(async () => {
  uiReady.value = true;

  address.value = getCachedAddress() ?? "";

  await fetchAccountGitHub();
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
    <IndexTitle class="mb-6"></IndexTitle>

    <IndexSectionTitle>
      <span>1. Connect Account</span>
    </IndexSectionTitle>

    <IndexSectionContent class="mt-4">
      <UButton
        v-if="!accountGitHubID"
        color="lime"
        icon="i-simple-icons-github"
        label="Connect GitHub"
        :disabled="buttonGitHubDisabled"
        :loading="buttonGitHubLoading"
        @click="connectGitHub"
      ></UButton>
      <template v-if="accountGitHubID">
        <span class="me-2">Connected as</span>
        <UIcon name="i-simple-icons-github"></UIcon>
        <span class="ms-2 font-semibold">{{ accountGitHubUsername }},</span>
        <UButton
          class="ms-2"
          color="red"
          variant="link"
          size="xl"
          @click="disconnectGitHub"
          :padded="false"
          label="disconnect"
        >
        </UButton>
      </template>
    </IndexSectionContent>

    <IndexSectionTitle class="mt-4">
      <span>2. Setup Address</span>
    </IndexSectionTitle>

    <IndexSectionContent class="mt-4"> </IndexSectionContent>
  </UContainer>
</template>
