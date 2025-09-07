<template>
  <UModal
    fullscreen
    v-model:open="open"
    title=" "
    description=" "
    :ui="{
      content: 'flex items-center'
    }"
  >
    <template #content>
      <div class="w-1/2">
        <ProfileSpace @close="onClose"></ProfileSpace>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const open = ref(true)
const router = useRouter()
const onClose = () => {
  open.value = false
  router.replace('/profile/user-info')
}
</script>
