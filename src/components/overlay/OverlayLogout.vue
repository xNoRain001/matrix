<template>
  <UDrawer
    v-if="isMobile"
    :close="{ onClick: () => emit('close', false) }"
    :title="title"
    :description="description"
  >
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        class="justify-center"
        @click="emit('close', false)"
      />
      <UButton label="确认" class="justify-center" @click="onLogout" />
    </template>
  </UDrawer>
  <UModal
    v-else
    :close="{ onClick: () => emit('close', false) }"
    :title="title"
    :description="description"
  >
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        class="justify-center"
        @click="emit('close', false)"
      />
      <UButton label="确认" class="justify-center" @click="onLogout" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const emit = defineEmits<{ close: [boolean] }>()
const { isMobile } = storeToRefs(useUserStore())
const title = '退出登录'
const description = ' '

const onLogout = () => {
  emit('close', true)
  localStorage.removeItem('token')
  location.replace('/login')
}
</script>
