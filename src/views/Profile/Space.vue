<template>
  <UModal
    fullscreen
    default-open
    title=" "
    description=" "
    :ui="{
      content: 'flex items-center',
      description: 'hidden'
    }"
  >
    <template #content>
      <ProfileSpace
        class="max-w-md"
        @close="router.replace('/profile/user-info')"
        :target-id="userInfo.id"
        :target-profile="userInfo.profile"
      ></ProfileSpace>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const { userInfo } = storeToRefs(useUserStore())
</script>
