<template>
  <UDashboardPanel id="message-2" class="">
    <MessageHeader
      @close="selectUser = null"
      :user="selectUser"
    ></MessageHeader>
    <div class="relative -mt-4 overflow-y-scroll p-4">
      <MessageBody
        :message-list="messageList"
        :msg-stamp="msgStamp"
      ></MessageBody>
    </div>
    <MessageFooter
      :modal-ref="modalRef"
      v-model:message-list="messageList"
      v-model:leaved="leaved"
      v-model:msg-stamp="msgStamp"
    ></MessageFooter>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { message } from '@/types'

const selectUser = defineModel()
const leaved = ref(false)
const messageList = ref<message[]>([])
const msgStamp = ref({ sent: false, value: '' })
const footerRef = ref(null)
const modalRef = computed(() => footerRef.value?.parentNode?.parentNode)
</script>
