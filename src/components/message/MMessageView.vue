<template>
  <USlideover v-model:open="isMessagePanelOpen" title=" " description=" ">
    <template #header>
      <MessageHeader
        @close="selectUser = null"
        :user="selectUser"
      ></MessageHeader>
    </template>
    <template #content></template>
    <div class="relative -mt-4 overflow-y-scroll p-4">
      <MessageBody
        :message-list="messageList"
        :msg-stamp="msgStamp"
      ></MessageBody>
    </div>
    <template #footer></template>
  </USlideover>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { message } from '@/types'

const messageList = ref<message[]>([])
const msgStamp = ref({ sent: false, value: '' })
const selectUser = defineModel()
const isMessagePanelOpen = computed({
  get() {
    return Boolean(selectUser.value)
  },
  set(value: boolean) {
    if (!value) {
      selectUser.value = null
    }
  }
})
</script>
