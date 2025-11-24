<template>
  <USlideover
    v-model:open="isSlideoverOpen"
    title=" "
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #content>
      <ProfileSpace @close="isSlideoverOpen = false" :target-id="userInfo.id" />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const isSlideoverOpen = ref(true)
const { userInfo } = storeToRefs(useUserStore())
</script>
