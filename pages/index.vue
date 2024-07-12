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
    await fetchAirdrops();
  } finally {
    updatingAccountGitHub.value--;
  }
}

const address = ref("");
const addressConfirmed = ref(false);

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

interface Airdrop {
  id: string;
  chain: string;
  standard: string;
  contract: string;
  token: string;
  name: string;
  description: string;
  helper: string;
  image: string;
  is_eligible: boolean;
  eligible_at: number | null;
  is_claimed: boolean;
  claimed_at: number | null;
  claim_address: string | null;
  is_minted: boolean;
  minted_at: number | null;
  mint_tx: string | null;
}

const airdrops: Ref<Airdrop[]> = ref([]);

const fetchingAirdrop = ref(0);
const updatingAirdrop = ref(0);

const claimButtonDisabled = computed(() => {
  return !addressConfirmed.value || updatingAirdrop.value > 0;
});

const claimButtonLoading = computed(() => {
  return updatingAirdrop.value > 0;
});

async function fetchAirdrops() {
  fetchingAirdrop.value++;
  try {
    airdrops.value = await invokeAPI("/airdrop/list");
  } finally {
    fetchingAirdrop.value--;
  }
}

function createAirdropScanURL(item: Airdrop) {
  if (item.chain === "gnosis") {
    return `https://gnosis.blockscout.com/token/${item.contract}/instance/${item.token}`;
  }
  return "";
}

function createGnosisTxURL(tx: string) {
  return `https://gnosis.blockscout.com/tx/${tx}`;
}

async function claimAirdrop(id: string) {
  if (!confirm(`confirm to claim airdrop ${id} to ${address.value}?`)) return;
  updatingAirdrop.value++;
  try {
    await invokeAPI("/airdrop/claim", {
      method: "POST",
      body: { nft_id: id, address: address.value },
    });
    await fetchAirdrops();
  } finally {
    updatingAirdrop.value--;
  }
}

onMounted(async () => {
  address.value = getCachedAddress() ?? "";

  if (address.value) {
    addressConfirmed.value = true;
  }

  await Promise.all([fetchAccountGitHub(), fetchAirdrops()]);

  uiReady.value = true;
});
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
          <span class="text-lg lg:text-xl">1. Connect Accounts</span>
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
          <span class="text-lg lg:text-xl"
            >2. Set Beneficiary Ethereum Address</span
          >
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
          <span class="text-lg lg:text-xl">3. Claim Airdrops</span>
          <span class="text-lg lg:text-xl font-bold text-red-400 ms-2"
            >[THIS FEATURE IS STILL UNDERDEVELOPMENT, PLEASE WAIT FOR
            MINTED]</span
          >
        </template>
        <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <UCard
            :ui="{
              background: 'bg-white dark:bg-gray-900',
              divide: 'divide-y divide-gray-200 dark:divide-gray-600',
              ring: 'ring-1 ring-gray-200 dark:ring-gray-600',
              header: {
                padding: 'p-1 px-2 sm:p-2 sm:px-4',
                base: 'flex flex-row justify-start items-center',
              },
              footer: {
                padding: 'p-1 px-2 sm:p-2 sm:px-4',
                base: 'flex flex-row justify-center items-center',
              },
              body: {
                padding: 'p-2 sm:p-4',
                base: 'flex flex-col justify-start items-center',
              },
            }"
            v-for="(item, idx) in airdrops"
          >
            <template #header>
              <UButton
                variant="link"
                class="font-semibold"
                :to="createAirdropScanURL(item)"
                :label="item.name"
                target="_blank"
              >
              </UButton>
            </template>
            <UPopover mode="hover">
              <img class="w-full" :src="item.image" />
              <template #panel>
                <div class="w-64 p-4">
                  <p>{{ item.description }}</p>
                </div>
              </template>
            </UPopover>
            <template #footer>
              <UButton
                v-if="item.is_minted"
                color="lime"
                :to="createGnosisTxURL(item.mint_tx!)"
                label="MINTED"
                target="_blank"
                variant="link"
              >
              </UButton>
              <span v-else-if="item.is_claimed" class="text-green-400"
                >CLAIMED, MINTING</span
              >
              <UButton
                v-else-if="item.is_eligible"
                color="lime"
                label="Claim"
                block
                :disabled="claimButtonDisabled"
                :loading="claimButtonLoading"
                @click="claimAirdrop(item.id)"
              >
              </UButton>
              <UPopover v-else mode="hover">
                <span class="text-amber-400">NOT ELIGIBLE</span>
                <template #panel>
                  <div class="w-64 p-4">
                    <p>{{ item.helper }}</p>
                  </div>
                </template>
              </UPopover>
            </template>
          </UCard>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
