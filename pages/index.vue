<script setup lang="ts">
import { isAddress } from "web3-validator";

const uiReady = ref(false);

const fetchingAccountTwitter = ref(0);
const updatingAccountTwitter = ref(0);

const accountTwitterID = ref("");
const accountTwitterUsername = ref("");

const buttonTwitterDisabled = computed(() => {
  return (
    !uiReady.value ||
    fetchingAccountTwitter.value > 0 ||
    updatingAccountTwitter.value > 0
  );
});

const buttonTwitterLoading = computed(() => {
  return updatingAccountTwitter.value > 0;
});

async function fetchAccountTwitter() {
  fetchingAccountTwitter.value++;
  try {
    const { id, username }: { id: string; username: string } =
      await invokeAPI("/account/twitter");
    accountTwitterID.value = id;
    accountTwitterUsername.value = username;
  } finally {
    fetchingAccountTwitter.value--;
  }
}

async function connectTwitter() {
  updatingAccountTwitter.value++;
  try {
    const { url }: { url: string } = await invokeAPI(
      "/account/twitter/authorize_url",
      {
        query: { host: location.host },
      },
    );
    uiReady.value = false;
    navigateTo(url, { external: true });
  } finally {
    updatingAccountTwitter.value--;
  }
}

async function disconnectTwitter() {
  if (!confirm("Confirm to disconnect X (Twitter) account?")) return;
  updatingAccountTwitter.value++;
  try {
    await invokeAPI("/account/twitter/sign_out", {
      method: "POST",
      body: {},
    });
    await fetchAccountTwitter();
    await fetchAirdrops();
  } finally {
    updatingAccountTwitter.value--;
  }
}

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
  if (isAddress(address.value)) {
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

  await Promise.all([
    fetchAccountGitHub(),
    fetchAccountTwitter(),
    fetchAirdrops(),
  ]);

  uiReady.value = true;
});
</script>

<template>
  <UContainer class="py-6 lg:py-8">
    <IndexTitle class="mb-4 lg:mb-6"></IndexTitle>

    <div class="flex flex-col gap-4 md:gap-6">
      <div class="grid grid-col-1 md:grid-cols-2 gap-4 md:gap-6">
        <UCard
          :ui="{
            background: 'bg-white dark:bg-gray-900',
            divide: 'divide-y divide-gray-200 dark:divide-gray-600',
            ring: 'ring-1 ring-gray-200 dark:ring-gray-600',
            header: {
              padding: 'p-2',
              base: 'flex flex-row justify-start items-center',
            },
            body: { padding: 'p-3', base: 'flex flex-col gap-4' },
          }"
        >
          <template #header>
            <span class="font-semibold">1. Connect Accounts</span>
          </template>

          <UButton
            v-if="!accountGitHubID"
            class="underline"
            variant="link"
            color="lime"
            icon="i-simple-icons-github"
            label="Connect GitHub"
            :disabled="buttonGitHubDisabled"
            :loading="buttonGitHubLoading"
            @click="connectGitHub"
            :padded="false"
          >
          </UButton>
          <div class="flex flex-row items-center" v-if="accountGitHubID">
            <UIcon name="i-simple-icons-github"></UIcon>
            <span class="ms-2">Connected as</span>
            <span class="ms-1 font-semibold"
              >@{{ accountGitHubUsername }},</span
            >
            <UButton
              class="ms-2 underline"
              color="red"
              variant="link"
              size="xl"
              @click="disconnectGitHub"
              :padded="false"
              label="disconnect"
            >
            </UButton>
          </div>

          <UButton
            v-if="!accountTwitterID"
            class="underline"
            variant="link"
            color="lime"
            icon="i-simple-icons-x"
            label="Connect Twitter"
            :disabled="buttonTwitterDisabled"
            :loading="buttonTwitterLoading"
            @click="connectTwitter"
            :padded="false"
          >
          </UButton>
          <div class="flex flex-row items-center" v-if="accountTwitterID">
            <UIcon name="i-simple-icons-x"></UIcon>
            <span class="ms-2">Connected as</span>
            <span class="ms-1 font-semibold"
              >@{{ accountTwitterUsername }},</span
            >
            <UButton
              class="ms-2 underline"
              color="red"
              variant="link"
              size="xl"
              @click="disconnectTwitter"
              :padded="false"
              label="disconnect"
            >
            </UButton>
          </div>
        </UCard>
        <UCard
          :ui="{
            background: 'bg-white dark:bg-gray-900',
            divide: 'divide-y divide-gray-200 dark:divide-gray-600',
            ring: 'ring-1 ring-gray-200 dark:ring-gray-600',
            header: {
              padding: 'p-2',
              base: 'flex flex-row justify-start items-center',
            },
            body: { padding: 'p-3', base: 'flex flex-row items-center' },
          }"
        >
          <template #header>
            <span class="font-semibold">2. Set Ethereum Address</span>
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
      </div>
      <UCard
        :ui="{
          background: 'bg-white dark:bg-gray-900',
          divide: 'divide-y divide-gray-200 dark:divide-gray-600',
          ring: 'ring-1 ring-gray-200 dark:ring-gray-600',
          header: {
            padding: 'p-2',
            base: 'flex flex-row justify-start items-center',
          },
          body: { padding: 'p-3' },
        }"
        class="col-span-2"
      >
        <template #header>
          <span class="font-semibold">3. Claim Items</span>
        </template>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
        >
          <UCard
            :ui="{
              background: 'bg-white dark:bg-gray-900',
              divide: 'divide-y divide-gray-200 dark:divide-gray-600',
              ring: 'ring-1 ring-gray-200 dark:ring-gray-600',
              header: {
                padding: 'p-2 ',
                base: 'flex flex-row justify-center items-center',
              },
              footer: {
                padding: 'p-2',
                base: 'flex flex-row justify-center items-center',
              },
              body: {
                padding: 'p-2',
                base: 'flex flex-col justify-start items-center',
              },
            }"
            v-for="(item, idx) in airdrops"
          >
            <template #header>
              <UButton
                variant="link"
                color="lime"
                class="font-semibold"
                size="xl"
                :to="createAirdropScanURL(item)"
                :label="item.name"
                target="_blank"
                :padded="false"
              >
              </UButton>
            </template>
            <UPopover mode="hover">
              <img class="w-full" :src="item.image" />
              <template #panel>
                <div class="w-64 p-4 prose-sm dark:prose-invert">
                  <p>{{ item.description }}</p>
                </div>
              </template>
            </UPopover>
            <template #footer>
              <UButton
                v-if="item.is_minted"
                color="lime"
                :to="createGnosisTxURL(item.mint_tx!)"
                icon="i-heroicons-check-badge"
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
                <div
                  class="flex flex-row items-center justify-center text-amber-400 pt-1"
                >
                  <span>NOT ELIGIBLE</span>
                  <UIcon
                    class="ms-1"
                    name="i-heroicons-question-mark-circle"
                  ></UIcon>
                </div>
                <template #panel>
                  <div
                    class="w-64 p-4 prose-sm dark:prose-invert"
                    v-html="item.helper"
                  ></div>
                </template>
              </UPopover>
            </template>
          </UCard>
        </div>
      </UCard>
      <div
        class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 justify-between text-slate-400"
      >
        <div>
          If you encounter any issues, please contact me via
          <a href="mailto:hi@yankeguo.com">hi@yankeguo.com</a>
        </div>
        <div>Copyright © 2024, Yanke Guo, All Rights Reserved.</div>
      </div>
    </div>
  </UContainer>
</template>
