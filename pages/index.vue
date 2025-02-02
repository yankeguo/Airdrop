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
    <IndexHeader class="mb-6 lg:mb-8"></IndexHeader>

    <div class="flex flex-col gap-6 md:gap-8">
      <!-- Connect -->
      <div class="md:w-1/2 flex flex-col gap-4 md:gap-6">
        <IndexTitle
          icon="i-heroicons-link"
          label="Connect Accounts"
        ></IndexTitle>
        <div class="grid grid-cols-2 gap-4">
          <UButtonGroup
            class="w-full"
            v-if="accountGitHubID"
            size="sm"
            orientation="horizontal"
          >
            <UButton
              class="flex-grow justify-center"
              icon="i-simple-icons-github"
              :label="accountGitHubUsername"
              color="white"
            />
            <UButton
              variant="outline"
              size="sm"
              icon="i-heroicons-link-slash"
              color="red"
              @click="disconnectGitHub"
            />
          </UButtonGroup>
          <UButton
            v-else
            variant="outline"
            color="lime"
            icon="i-simple-icons-github"
            label="GitHub"
            size="sm"
            :block="true"
            :disabled="buttonGitHubDisabled"
            :loading="buttonGitHubLoading"
            @click="connectGitHub"
          >
          </UButton>

          <UButtonGroup
            v-if="accountTwitterID"
            size="sm"
            orientation="horizontal"
          >
            <UButton
              class="flex-grow justify-center"
              icon="i-simple-icons-x"
              :label="accountTwitterUsername"
              color="white"
            />
            <UButton
              variant="outline"
              size="sm"
              icon="i-heroicons-link-slash"
              color="red"
              @click="disconnectTwitter"
            />
          </UButtonGroup>
          <UButton
            v-else
            variant="outline"
            color="lime"
            icon="i-simple-icons-x"
            label="Twitter"
            size="sm"
            :block="true"
            :disabled="buttonTwitterDisabled"
            :loading="buttonTwitterLoading"
            @click="connectTwitter"
          >
          </UButton>
        </div>
      </div>

      <!-- Address -->
      <div class="md:w-1/2 flex flex-col gap-4 md:gap-6">
        <IndexTitle
          icon="i-heroicons-wallet"
          label="Set Ethereum Address"
        ></IndexTitle>
        <div class="flex flex-row gap-4">
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
        </div>
      </div>

      <!-- Claim -->
      <div class="flex flex-col gap-4 md:gap-6">
        <IndexTitle
          icon="i-heroicons-archive-box-arrow-down"
          label="Claim Items"
        ></IndexTitle>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
        >
          <UCard
            :ui="{
              background: '',
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
                  class="flex flex-row items-center justify-center pt-1 text-amber-400"
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
      </div>
    </div>
    <IndexFooter class="mt-8 md:mt-12"></IndexFooter>
  </UContainer>
</template>
