<template>
  <UDashboardPanel id="message-2">
    <MessageHeader
      @close="selectUser = null"
      :user="selectUser"
    ></MessageHeader>
    <div ref="bodyRef" class="relative grow overflow-y-scroll p-4">
      <MessageBody
        :message-list="messageList"
        :msg-stamp="msgStamp"
      ></MessageBody>
    </div>
    <MessageFooter
      :body-ref="bodyRef"
      :tmpRoomId="tmpRoomId"
      v-model:message-list="messageList"
      v-model:leaved="leaved"
      v-model:msg-stamp="msgStamp"
    ></MessageFooter>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { message } from '@/types'

defineProps<{ tmpRoomId: string }>()

const selectUser = defineModel()
const leaved = ref(false)
const messageList = ref<message[]>([])
const msgStamp = ref({ sent: false, value: '' })
const bodyRef = ref(null)
</script>
