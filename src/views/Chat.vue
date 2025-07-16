<template>
  <div
    ref="containerRef"
    class="flex-center flex h-screen flex-col overflow-y-scroll"
  >
    <UPinInput
      v-if="!roomId"
      size="xl"
      :length="pinLength"
      v-model="pin"
      type="number"
    />

    <div v-if="connected" class="w-full max-w-[500px]">
      <div class="px-8">
        <q-chat-message label="Sunday, 19th" />
        <q-chat-message
          v-for="({ name, text, sent, stamp }, index) in messageList"
          :key="index"
          :name="name"
          :text="text"
          :sent="sent"
          :stamp="stamp"
        />
      </div>

      <div class="sticky bottom-0 rounded-t-md py-4 backdrop-blur-md">
        <q-input
          @keydown.enter="onSend"
          class="mx-4 bg-[#0d1117]"
          standout
          dense
          v-model="message"
        ></q-input>
      </div>
      <!-- <q-btn @click="onSend" label="发送" color="primary"></q-btn> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  useAddRoomID,
  useBack,
  useClosePC,
  useCreatePeerConnection,
  useInitDataChannel,
  useInitRtc,
  useInitSocket,
  useNotify,
  useStartRTC
} from '@/hooks'
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import type { Socket } from 'socket.io-client'

let makingOffer = false
let polite = true
let name = Math.random() * 10 + ''
let pc: RTCPeerConnection | null = null
let socket: Socket | null = null
let dataChannel: RTCDataChannel | null = null
// let lastSendTime = Number.MAX_SAFE_INTEGER
// let lastReceiveTime = Number.MAX_SAFE_INTEGER
// 对方是否收到了文件元信息的标识
// let flag = false
// const pending = '等待中...'
// const sending = '传送中...'
// const sent = '传送完成...'
const receiving = '接收中...'
// const received = '接收完成...'
const message = ref('')
const containerRef = ref(null)
// const receivedBuffer: ArrayBuffer[] = []
const roomId = useRoute().query.roomId as string
const pinLength = 4
const pin = ref([])
const connected = ref(false)
const otherConnected = ref(false)
// 控制传送时的相关信息
// const sendStatus = reactive<
//   {
//     // speed:string,
//     status: '等待中...' | '传送中...' | '传送完成...'
//     progress: string
//   }[]
// >([])
const messageList = reactive([
  // {
  //   name: 'me',
  //   text: ['hey, how are you?', 'aaa'],
  //   sent: true,
  //   stamp: '7 minutes ago'
  // },
  // {
  //   name: 'Jane',
  //   text: ['doing fine, how r you?'],
  //   sent: false,
  //   stamp: '4 minutes ago'
  // }
])

const onSend = async () => {
  dataChannel.send(
    JSON.stringify({
      name,
      sendTime: Date.now(),
      message: message.value
    })
  )

  messageList.push({
    name: 'me',
    // avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
    text: [message.value],
    sent: true,
    stamp: '4 minutes ago'
    // suc: false
  })

  message.value = ''
  scrollToBottom()
}

const scrollToBottom = () => {
  const timer = setTimeout(() => {
    containerRef.value.scrollTo({
      top: containerRef.value.scrollHeight,
      behavior: 'smooth'
    })
    clearTimeout(timer)
  })
}

const onReceiveData = ({ channel }: { channel: RTCDataChannel }) => {
  channel.onmessage = ({ data }: { data: string }) => {
    const { message, name } = JSON.parse(data)
    socket.emit('saved-file', roomId, null)
    messageList.push({
      name,
      // avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
      text: [message],
      sent: false,
      stamp: '4 minutes ago'
      // suc: true
    })
    scrollToBottom()
  }
}

const onFileMetadata = async (roomId: string, data: any) => {
  const o = { ...data }
  o.status = receiving
  socket.emit('receive-file-metadata', roomId, null)
}

const initPC = () => {
  pc = useCreatePeerConnection(socket, roomId, otherConnected, () => {})
  pc.ondatachannel = onReceiveData
  dataChannel = useInitDataChannel(pc)
}

// 当自己加入房间时触发
const onJoined = async (_, __, _polite) => {
  polite = _polite
  connected.value = true

  if (!polite) {
    initPC()
  }

  socket.emit('otherjoin', roomId)
}

// 当其他人加入房间时触发
const onOtherJoin = async (roomId, _) => {
  useNotify('对方加入了房间')
  polite = true
  useClosePC(pc)
  // dataChannel.close()
  initPC()

  try {
    makingOffer = true
    await useStartRTC(pc, socket, roomId)
  } catch (err) {
    console.error(err)
  }

  makingOffer = false
}

const onDisconnect = _ => {
  useClosePC(pc)
  useBack('/chat')
}

const onRtc = (roomId: string, data: any) =>
  useInitRtc(pc, socket, roomId, data, makingOffer, polite)

const initSocket = () => {
  socket = useInitSocket(onJoined, onOtherJoin, onDisconnect, onRtc)
  socket.on('file-metadata', onFileMetadata)
  socket.emit('join', roomId)
}

onMounted(() => {
  if (!roomId) {
    return
  }

  initSocket()
})

watch(pin, v => {
  if (v.length === pinLength) {
    useAddRoomID('chat-', pin)
  }
})
</script>
