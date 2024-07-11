<script setup lang="ts">
import { ethers } from "ethers";

const uiReady = ref(false);

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

const address = ref("");
const addressConfirmed = ref(false);

const blockscoutNFTLink = computed(() => {
  return createGnosisBlockscoutAddressNFTLink(address.value);
});

const inputAddressDisabled = computed(() => {
  return !uiReady.value || addressConfirmed.value;
});

const buttonAddressConfirmDisabled = computed(() => {
  return !uiReady.value || !address.value;
});

const buttonAddressClearDisabled = computed(() => {
  return !uiReady.value;
});

function confirmAddress() {
  if (ethers.isAddress(address.value)) {
    addressConfirmed.value = true;
    setCachedAddress(address.value);
  } else {
    const toast = useToast();
    toast.add({
      title: "Invalid Address",
      description: "Please input a valid Ethereum address.",
      color: "red",
      timeout: 0,
    });
  }
}

function clearAddress() {
  addressConfirmed.value = false;
  setCachedAddress("");
}

onMounted(async () => {
  address.value = getCachedAddress() ?? "";

  if (address.value) {
    addressConfirmed.value = true;
  }

  await fetchAccountGitHub();

  uiReady.value = true;
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
    <IndexTitle class="mb-6 lg:mb-8"></IndexTitle>

    <div class="grid grid-cols-2 gap-6">
      <UCard
        :ui="{
          background: 'bg-white dark:bg-gray-900',
          divide: 'divide-y divide-gray-200 dark:divide-gray-600',
          ring: 'ring-1 ring-gray-200 dark:ring-gray-600',
          header: {
            padding: 'p-1 sm:p-2',
            base: 'flex flex-row justify-center items-center',
          },
          body: { padding: 'p-2 sm:p-4' },
        }"
      >
        <template #header>
          <span class="text-lg lg:text-xl">1. Connect Account</span>
        </template>

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
      </UCard>
      <UCard
        :ui="{
          background: 'bg-white dark:bg-gray-900',
          divide: 'divide-y divide-gray-200 dark:divide-gray-600',
          ring: 'ring-1 ring-gray-200 dark:ring-gray-600',
          header: {
            padding: 'p-1 sm:p-2',
            base: 'flex flex-row justify-center items-center',
          },
          body: { padding: 'p-2 sm:p-4', base: 'flex flex-row items-center' },
        }"
      >
        <template #header>
          <span class="text-lg lg:text-xl">2. Input Address</span>
        </template>
        <UInput
          :disabled="inputAddressDisabled"
          class="flex-grow me-2"
          v-model="address"
          placeholder="0xAaBbCcDdEe..."
        >
        </UInput>
        <UButton
          v-if="!addressConfirmed"
          :disabled="buttonAddressConfirmDisabled"
          size="sm"
          icon="i-heroicons-check-circle"
          @click="confirmAddress"
          label="Confirm"
        >
        </UButton>
        <UButton
          v-if="addressConfirmed"
          :disabled="buttonAddressClearDisabled"
          size="sm"
          variant="outline"
          color="red"
          icon="i-heroicons-x-circle"
          @click="clearAddress"
          label="Clear"
        >
        </UButton>
      </UCard>
      <UCard
        :ui="{
          background: 'bg-white dark:bg-gray-900',
          divide: 'divide-y divide-gray-200 dark:divide-gray-600',
          ring: 'ring-1 ring-gray-200 dark:ring-gray-600',
          header: {
            padding: 'p-1 px-2 sm:p-2 sm:px-4',
            base: 'flex flex-row justify-start items-center',
          },
          body: { padding: 'p-2 sm:p-4' },
        }"
        class="col-span-2"
      >
        <template #header>
          <span class="text-lg lg:text-xl">3. Claim Items</span>
        </template>
        <p></p>
      </UCard>
      <UCard
        :ui="{
          background: 'bg-white dark:bg-gray-900',
          divide: 'divide-y divide-gray-200 dark:divide-gray-600',
          ring: 'ring-1 ring-gray-200 dark:ring-gray-600',
          header: {
            padding: 'p-1 px-2 sm:p-2 sm:px-4',
            base: 'flex flex-row justify-start items-center',
          },
          body: {
            padding: 'p-2 sm:p-4',
            base: 'flex flex-row justify-start items-center',
          },
        }"
        class="col-span-2"
      >
        <template #header>
          <span class="text-lg lg:text-xl">4. Verify</span>
        </template>
        <template v-if="addressConfirmed">
          <span> Check your NFTs on </span>
          <UButton
            class="ms-1"
            color="lime"
            variant="link"
            size="xl"
            :padded="false"
            :to="blockscoutNFTLink"
            target="_blank"
            label="Blockscout (Gnosis)"
          >
          </UButton>
        </template>
        <p v-if="!addressConfirmed && uiReady" class="text-red-600">
          Please input your Ethereum address to proceed.
        </p>
      </UCard>
    </div>
  </UContainer>
</template>
