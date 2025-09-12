<template>
  <UDrawer
    :close="{ onClick: () => emit('close', false) }"
    title="退出登录"
    description=" "
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
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const emit = defineEmits<{ close: [boolean] }>()
const router = useRouter()

const onLogout = () => {
  emit('close', true)
  localStorage.removeItem('token')
  router.replace('/login')
}
</script>
