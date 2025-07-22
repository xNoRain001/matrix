<template>
  <div
    class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
  >
    <div class="flex flex-col items-center">
      <q-btn label="离开房间" @click="leave" color="primary"></q-btn>
      <q-btn
        class="!mt-4"
        label="返回主页"
        @click="router.push('/room')"
        color="primary"
      ></q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

defineProps<{ leave: () => void }>()

const router = useRouter()
</script>
