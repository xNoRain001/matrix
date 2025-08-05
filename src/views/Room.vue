<template>
  <Card type="room" v-if="showCards"></Card>
  <router-view v-else></router-view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showCards = computed(() => route.path === '/room')
</script>
