<template>
  <UModal
    v-model:open="isContactModalOpen"
    title="对方请求添加你为好友"
    description=" "
    :dismissible="false"
  >
    <template #footer>
      <UButton
        label="拒绝"
        color="neutral"
        class="justify-center"
        @click="onRefuseCandidate"
      />
      <UButton
        loading-auto
        label="同意"
        @click="onAgreeCandidate"
        class="justify-center"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { agreeCandidate, refuseCandidate } from '@/apis/contact'
import { useRoomStore } from '@/store'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'

const isContactModalOpen = defineModel() as Ref<boolean>
const props = defineProps<{
  socket
}>()
const { remoteRoomInfo, otherInfo } = storeToRefs(useRoomStore())
const toast = useToast()

const onRefuseCandidate = async () => {
  try {
    await refuseCandidate(otherInfo.value.id)
    isContactModalOpen.value = false
    props.socket.emit('refuse-add-contact', remoteRoomInfo.value.roomId)
  } catch (error) {
    toast.add({ title: error.message, color: 'error' })
  } finally {
    isContactModalOpen.value = false
  }
}

const onAgreeCandidate = async () => {
  try {
    await agreeCandidate(otherInfo.value.id)
    toast.add({ title: '添加好友成功', color: 'success' })
    props.socket.emit('agree-add-contact', remoteRoomInfo.value.roomId)
  } catch (error) {
    toast.add({ title: error.message, color: 'error' })
  } finally {
    isContactModalOpen.value = false
  }
}
</script>
