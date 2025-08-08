<template>
  <Card v-show="showCards"></Card>
  <router-view v-if="!showCards"></router-view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showCards = computed(() => route.path === '/match')
</script>
