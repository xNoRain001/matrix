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
      <div class="w-1/2">
        <ProfileSpace
          @close="router.replace('/profile/user-info')"
        ></ProfileSpace>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
