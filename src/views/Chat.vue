<template>
  <div class="flex-center flex">
    <UPinInput
      v-if="!roomId"
      size="xl"
      :length="pinLength"
      v-model="pin"
      type="number"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    />

    <div v-if="connected" class="w-full max-w-[500px] pb-[56px]">
      <!-- <q-chat-message label="Sunday, 19th" /> -->
      <q-chat-message
        v-for="(item, index) in messageList"
        :avatar="avatar"
        :key="index"
        :text="item.content"
        :sent="item.sent"
      />
    </div>
    <!-- :stamp="timestamp" -->
  </div>

  <q-page-sticky v-if="connected" expand position="bottom">
    <div class="w-full max-w-[500px] rounded-t-md py-4 backdrop-blur-md">
      <q-input
        @keydown.enter="onSendMsg"
        class="mx-4 bg-[#0d1117]"
        standout
        dense
        v-model="message"
      ></q-input>
      <!-- :disable="!otherConnected" -->
    </div>
  </q-page-sticky>
</template>

<script lang="ts" setup>
import {
  useAddRoomID,
  useBack,
  useClosePC,
  useCreatePeerConnection,
  useGetDB,
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
let avatar = 'https://cdn.quasar.dev/img/avatar4.jpg'
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

const db = await useGetDB()

// 添加聊天记录
const addMessage = async message => {
  await db.add('messages', message)
}

// 获取所有聊天记录
const getMessages = async () => {
  return db.getAllFromIndex('messages', 'roomId', roomId)
}

const messageList = reactive<
  { content: string[]; id?: number; sent: boolean; timestamp: number }[]
>(roomId ? [...(await getMessages())] : [])

const onSendMsg = async () => {
  const _message = message.value

  if (!_message) {
    return
  }

  const timestamp = Date.now()

  dataChannel.send(
    JSON.stringify({
      timestamp,
      message: _message
    })
  )
  messageList.push({
    content: [_message],
    sent: true,
    timestamp
  })
  addMessage({ roomId, content: [_message], sent: true, timestamp })
  message.value = ''
  scrollToBottom()
}

const scrollToBottom = () => {
  const timer = setTimeout(() => {
    document.documentElement.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    })
    clearTimeout(timer)
  })
}

const onReceiveData = ({ channel }: { channel: RTCDataChannel }) => {
  channel.onmessage = ({ data }: { data: string }) => {
    const { message, timestamp } = JSON.parse(data)
    socket.emit('saved-file', roomId, null)
    messageList.push({
      content: [message],
      sent: false,
      timestamp
    })
    scrollToBottom()
    addMessage({ roomId, content: [message], sent: false, timestamp })
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
  scrollToBottom()
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
