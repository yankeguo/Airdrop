<script setup lang="ts">
const props = defineProps<{
  icon: string;
  label: string;
}>();
</script>

<template>
  <div class="flex flex-row items-center">
    <UIcon :name="icon" class="text-lg lg:text-xl"></UIcon>
    <span class="font-semibold text-md lg:text-lg ms-2">{{ label }}</span>
  </div>
</template>
