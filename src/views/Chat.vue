<template>
  <div class="flex-center flex">
    <UPinInput
      v-if="!(isMatch || roomId)"
      size="xl"
      :length="pinLength"
      v-model="pin"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    />
    <div
      v-if="isMatch"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <q-spinner-puff color="primary" size="lg" />
      <div class="mt-4">匹配中...</div>
    </div>

    <div
      v-if="connected"
      :class="leaved || otherLeaved ? '' : 'pb-[56px]'"
      class="min-h-[var(--content-height)] w-full max-w-[500px]"
    >
      <!-- <q-chat-message label="Sunday, 19th" /> -->
      <q-chat-message
        v-for="(item, index) in messageList"
        :avatar="avatar"
        :key="index"
        :text="item.content"
        :sent="item.sent"
      />
      <!-- :stamp="timestamp" -->
      <div
        v-if="!(leaved || otherLeaved) && !otherConnected"
        class="flex-center flex flex-col"
      >
        <div>对方未在线...</div>
      </div>

      <div
        v-if="(leaved || otherLeaved) && !isMatch"
        class="flex-center flex flex-col"
      >
        <div>{{ leaved ? '你' : '对方' }}已离开房间...</div>
        <q-btn
          class="full-width !mt-4"
          color="primary"
          label="重新匹配"
          rounded
          @click="onRematch"
        ></q-btn>
      </div>
    </div>
  </div>

  <q-page-sticky
    v-if="connected && !(leaved || otherLeaved)"
    expand
    position="bottom"
  >
    <div
      class="w-full max-w-[calc(500px+2rem)] rounded-t-md py-4 backdrop-blur-md"
    >
      <q-input
        @keydown.enter="onSendMsg"
        class="mx-4"
        standout
        dense
        rounded
        v-model="message"
        :disable="!otherConnected"
      >
        <template v-slot:before>
          <q-btn @click="onLeave" round icon="logout" />
        </template>
      </q-input>
    </div>
  </q-page-sticky>
</template>

<script lang="ts" setup>
import {
  useClearMessages,
  useClosePC,
  useCreatePeerConnection,
  useDialog,
  useGetDB,
  useInitDataChannel,
  useInitRtc,
  useInitSocket,
  useNotify,
  useStartRTC
} from '@/hooks'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Socket } from 'socket.io-client'

let timer = null
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
const { query, path } = useRoute()
const router = useRouter()
const isReconnect = ref(false)
const leaved = ref(false)
const otherLeaved = ref(false)
// 如果服务器中还能获取到 roomId，说明没有退出房间，恢复到上次的房间，
let roomId = localStorage.getItem('roomId') || (query.roomId as string)
const isMatch = ref(query.type === 'match')
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
const addMessage = async message => db.add('messages', message)

// 获取所有聊天记录
const getMessages = async () => db.getAllFromIndex('messages', 'roomId', roomId)

const messageList = ref<
  { content: string[]; sent: boolean; timestamp: number }[]
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
  messageList.value.push({
    content: [_message],
    sent: true,
    timestamp
  })
  addMessage({ roomId, content: [_message], sent: true, timestamp })
  message.value = ''
  scrollToBottom()
}

const scrollToBottom = () => {
  const html = document.documentElement
  const timer = setTimeout(() => {
    html.scrollTo({
      top: html.scrollHeight,
      behavior: 'smooth'
    })
    clearTimeout(timer)
  })
}

const onReceiveData = ({ channel }: { channel: RTCDataChannel }) => {
  channel.onmessage = ({ data }: { data: string }) => {
    const { message, timestamp } = JSON.parse(data)
    socket.emit('saved-file', roomId, null)
    messageList.value.push({
      content: [message],
      sent: false,
      timestamp
    })
    addMessage({ roomId, content: [message], sent: false, timestamp })
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
    socket.emit('otherjoin', roomId)
  }

  scrollToBottom()
}

// 当其他人加入房间时触发
const onOtherJoin = async (roomId, _) => {
  polite = true
  useClosePC(pc)
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

  // connect 回调中判断出如果是重连，会发送 join
  // socket 连接成功时是重连的前提是双方都没有离开
  if (!(leaved.value || otherLeaved.value)) {
    isReconnect.value = true
  }
}

const onRtc = (roomId: string, data: any) =>
  useInitRtc(pc, socket, roomId, data, makingOffer, polite)

const onMatched = data => {
  const { type, message } = data

  if (type === 'fail') {
    useNotify(message, 'negative')
    timer = setTimeout(() => {
      socket.emit('match')
      clearTimeout(timer)
    }, 10000)
  } else if (type === 'suc') {
    // 可能出现匹配失败，等待再次匹配的过程中被别人给匹配到了
    clearTimeout(timer)
    roomId = message
    // 记录房间号
    localStorage.setItem('roomId', message)
    router.replace({
      path,
      query: { roomId }
    })
    isMatch.value = false
    socket.emit('join', roomId)
  }
}

const onLeave = async () => {
  useDialog({
    class: 'bg-[#0d1117]',
    title: '离开',
    message: '你确定要离开房间吗？',
    persistent: true,
    dark: true,
    ok: '确定',
    cancel: '取消',
    color: 'primary'
  }).onOk(async () => {
    // 服务器 leave 回调中发送 bye，然后触发本地 leaved
    leaved.value = true
    socket.emit('leave', roomId)
    await useClearMessages(roomId)
    localStorage.removeItem('roomId')
    scrollToBottom()
  })

  // 在对方离线的时候，我离开了，对方在线后应该先去服务器看我还在不在
}

const onBye = () => {
  otherLeaved.value = true
}

const onRematch = async () => {
  // 重新匹配时，你可能是没选择离开的人，此时 socket 和 pc 都还存在，需要手动断开
  // 否则新的 socket 生成后，旧的会在几秒后才断开，会触发 disconnect 回调关闭新的 pc
  // 为什么不把关闭的行为放在 onBye 回调中，因为我离开时对方可能不在线，对方在线时
  // 发现我已经离开了，只能点击重新匹配按钮，进入到这里，如果我离开时对方在线，也只能
  // 点击重新匹配按钮，进入到这里
  useClosePC(pc)
  socket.disconnect()

  // 后离开的一方需要在重新匹配时删除聊天记录
  // TODO: 先离开的一方在 onLeave 中已经删除了，这里还会触发一次
  await useClearMessages(roomId)
  messageList.value = []
  leaved.value = false
  otherLeaved.value = false
  router.replace({
    path,
    query: { type: 'match' }
  })
  isMatch.value = true
  initSocket()
  socket.on('matched', onMatched)
  socket.emit('joinmatch')
  socket.emit('match')
}

const initSocket = () => {
  socket = useInitSocket(
    onJoined,
    onOtherJoin,
    onDisconnect,
    onRtc,
    isReconnect,
    roomId
  )
  // 其他人离开房间
  socket.on('bye', onBye)
  socket.on('file-metadata', onFileMetadata)
}

onMounted(async () => {
  if (roomId) {
    // 如果获取到了远程房间，可能需要更新 query 参数
    router.replace({
      path,
      query: { roomId }
    })
    isMatch.value = false
  }

  const _isMatch = isMatch.value

  if (_isMatch || roomId) {
    initSocket()

    if (_isMatch) {
      socket.on('matched', onMatched)
      socket.emit('joinmatch')
      socket.emit('match')
    } else {
      socket.emit('join', roomId)
    }
  }
})

watch(pin, async v => {
  if (v.length === pinLength) {
    roomId = 'chat-' + v.join('')
    router.replace({
      path,
      query: { roomId }
    })

    // 尝试获取聊天记录
    messageList.value = await getMessages()
    initSocket()
    socket.emit('join', roomId)
  }
})
</script>
