<template>
  <UModal
    fullscreen
    default-open
    title=" "
    description=" "
    :ui="{
      content: 'flex items-center'
    }"
  >
    <template #content>
      <ProfileSpace
        class="!w-1/2"
        @close="router.replace('/profile/user-info')"
      ></ProfileSpace>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
