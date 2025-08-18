<template>
  <ProfileUpdatePassword v-if="isDesktop"></ProfileUpdatePassword>
  <MProfileUpdatePassword v-else></MProfileUpdatePassword>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

const isDesktop = useMediaQuery('(min-width: 768px)')
</script>
