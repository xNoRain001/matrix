<template>
  <UDashboardPanel id="home">
    <template #header>
      <IndexHeader />
    </template>
    <template #body>
      <IndexBody></IndexBody>
    </template>
    <template v-if="isMobile" #footer>
      <div class="h-16"></div>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const { isMobile } = storeToRefs(useUserStore())
</script>
