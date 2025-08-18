<template>
  <ProfileNotifications v-if="isDesktop"></ProfileNotifications>
  <MProfileNotifications v-else></MProfileNotifications>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

const isDesktop = useMediaQuery('(min-width: 768px)')
</script>
