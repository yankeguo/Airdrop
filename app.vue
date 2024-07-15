<script setup lang="ts">
import linkAssetsIcon32x32 from "~/assets/icon-32x32.png";
</script>

<template>
  <div>
    <Html>
      <Head>
        <Title>Token of Gratitude by Yanke Guo</Title>
        <Link
          rel="icon"
          type="image/png"
          size="32x32"
          :href="linkAssetsIcon32x32"
        >
        </Link>
      </Head>
    </Html>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <UNotifications />
  </div>
</template>
