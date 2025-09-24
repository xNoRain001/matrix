<template>
  <USlideover
    v-if="isMobile"
    :close="{ onClick: () => emit('close', false) }"
    :title="title"
    :description="description"
    :ui="{ body: 'flex flex-col gap-4 justify-center items-center' }"
  >
    <template #body>
      <img
        class="size-16"
        style="filter: drop-shadow(rgba(0, 122, 204, 0.3) 0px 8px 24px)"
        src="/images/logo.svg"
      />
      <p class="text-sm">矩阵</p>
      <p class="text-sm">Version: {{ VITE_VERSION }}</p>
      <p class="text-sm">Last Update At: {{ VITE_LATEST_UPDATE_DATE }}</p>
      <p class="mt-8 text-xs">X公司 版权所有</p>
      <p class="text-xs">
        Copyright © 2025-{{ new Date().getFullYear() }} X. All Rights Reserved.
      </p>
    </template>
  </USlideover>
  <UModal
    v-else
    :close="{ onClick: () => emit('close', false) }"
    :title="title"
    :description="description"
    :ui="{ body: 'flex flex-col gap-4 justify-center items-center' }"
  >
    <template #body>
      <img
        class="size-16"
        style="filter: drop-shadow(rgba(0, 122, 204, 0.3) 0px 8px 24px)"
        src="/images/logo.svg"
      />
      <p class="text-sm">矩阵</p>
      <p class="text-sm">Version: {{ VITE_VERSION }}</p>
      <p class="text-sm">Last Update At: {{ VITE_LATEST_UPDATE_DATE }}</p>
      <p class="mt-8 text-xs">X公司 版权所有</p>
      <p class="text-xs">
        Copyright © 2025-{{ new Date().getFullYear() }} X. All Rights Reserved.
      </p>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const emit = defineEmits<{ close: [boolean] }>()
const { isMobile } = storeToRefs(useUserStore())
const title = '关于'
const description = ' '
const { VITE_VERSION, VITE_LATEST_UPDATE_DATE } = import.meta.env
</script>
