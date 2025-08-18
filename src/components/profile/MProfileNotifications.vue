<template>
  <UDrawer
    :handle="false"
    v-model:open="openNotificationsDrawer"
    @animation-end="open => useBackToProfile(open, router)"
    direction="right"
    class="w-[80vw]"
    title=" "
    description=" "
    :ui="{ body: 'flex flex-col gap-4' }"
  >
    <template #header>
      <div class="flex items-center">
        <UButton
          variant="ghost"
          color="neutral"
          icon="lucide:chevron-left"
          class="cursor-pointer"
          @click="openNotificationsDrawer = false"
        />
        <div class="absolute left-1/2 -translate-x-1/2">通知</div>
      </div>
    </template>
    <template #content></template>
    <template #body>
      <ProfileNotifications></ProfileNotifications>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { useBackToProfile } from '@/hooks'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const openNotificationsDrawer = ref(true)
const router = useRouter()
</script>
