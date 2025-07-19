<template>
  <div class="flex-center flex">
    <div
      v-if="!(roomId || remoteroomId || isMatch)"
      class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-end"
    >
      <UPinInput size="xl" :length="pinLength" v-model="pin" />
      <q-breadcrumbs class="text-primary mt-4 cursor-pointer">
        <q-breadcrumbs-el label="匹配" icon="near_me" @click="initMatch">
        </q-breadcrumbs-el>
      </q-breadcrumbs>
    </div>

    <div
      v-if="isMatch"
      class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
    >
      <q-spinner-puff color="primary" size="lg" />
      <div class="mt-4">正在匹配中...</div>
    </div>

    <div
      v-if="joined"
      :class="leaved ? '' : 'pb-[56px]'"
      class="relative min-h-[var(--content-height)] w-full max-w-[500px]"
    >
      <template
        v-for="(
          { type, timestamp, content, sent, stamp }, index
        ) in messageList"
      >
        <q-chat-message
          v-if="type === 'label'"
          :label="formatTimestamp(timestamp)"
        ></q-chat-message>
        <q-chat-message
          v-else
          :avatar="avatar"
          :key="index"
          :text="content"
          :sent="sent"
          :stamp="stamp"
        />
      </template>

      <div v-if="!leaved && !otherConnected" class="flex-center flex flex-col">
        <div>对方未在线...</div>
      </div>

      <div
        v-if="leaved"
        class="flex-center absolute bottom-0 flex w-full flex-col"
      >
        <div>{{ otherLeaved ? '对方' : '你' }}已离开房间...</div>
        <q-btn
          class="full-width !mt-4"
          color="primary"
          :label="
            remoteroomId.startsWith('chat-') ? '重新进入房间' : '重新匹配'
          "
          rounded
          @click="
            remoteroomId.startsWith('chat-') ? onBackRoomPIN() : onRematch()
          "
        ></q-btn>
      </div>
    </div>
  </div>

  <q-page-sticky v-if="joined && !leaved" expand position="bottom">
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
          <q-btn @click="onLeave" round icon="logout">
            <q-tooltip class="!bg-[#0d1117]">退出</q-tooltip>
          </q-btn>
        </template>
        <template v-slot:after>
          <q-btn @click="onExpand" round icon="control_point">
            <q-tooltip class="!bg-[#0d1117]">选项</q-tooltip>
          </q-btn>
        </template>
      </q-input>
      <div
        :class="expanded ? 'h-24' : 'h-0'"
        class="transition-all duration-200"
      ></div>
    </div>
  </q-page-sticky>
</template>

<script lang="ts" setup>
import {
  useClearMessages,
  useClearRoomId,
  useClosePC,
  useCreatePeerConnection,
  useDialog,
  useGetDB,
  useGetRoomId,
  useInitDataChannel,
  useInitRtc,
  useInitSocket,
  useNotify,
  useSaveRoomId,
  useStartRTC
} from '@/hooks'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Socket } from 'socket.io-client'

let timer = null
let lastMsgTimer = null
let lastMsgStampIndex = 0
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
const expanded = ref(false)
// const receivedBuffer: ArrayBuffer[] = []
const { query, path } = useRoute()
const router = useRouter()
const isReconnect = ref(false)
// 双方中任意一方离开时，值会修改为 true
const leaved = ref(false)
const otherLeaved = ref(false)
// 如果服务器中还能获取到 roomId，说明没有退出房间，恢复到上次的房间
const remoteroomId = ref(useGetRoomId())
let roomId = remoteroomId.value || (query.roomId as string)
const isMatch = ref(query.type === 'match')
const pinLength = 4
const pin = ref([])
const joined = ref(false)
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
const minute = 60 * 1000
const fiveMins = 5 * minute
const hour = 60 * minute
const day = 24 * hour
const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  // year: 'numeric',
  // month: 'long',
  // day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'long'
}

const onExpand = () => (expanded.value = !expanded.value)

const formatTimestamp = (timestamp: number) => {
  // TODO: 更久远的记录显示日期甚至年份
  return new Date(timestamp).toLocaleString('zh-CN', dateTimeFormatOptions)
}

type message = {
  roomId?: string
  type: 'message' | 'label'
  content?: string[]
  sent?: boolean
  timestamp: number
  stamp?: string
}

// 添加聊天记录
const addMessage = async (message: message) => db.add('messages', message)

// 获取所有聊天记录
const getMessages = async () => db.getAllFromIndex('messages', 'roomId', roomId)

const messageList = ref<message[]>(roomId ? [...(await getMessages())] : [])
let lastMsgTimeStamp = messageList.value[0]?.timestamp || 0

const addMessageLabel = (timestamp: number) => {
  if (timestamp - lastMsgTimeStamp > fiveMins) {
    addMessage({ roomId, type: 'label', timestamp })
  }

  lastMsgTimeStamp = timestamp
}

const removeLastMsgStamp = (stampMsg: message) => {
  // 没有消息时，stampMsg 是 undefind
  if (stampMsg?.stamp) {
    stampMsg.stamp = undefined
  }
}

const onSendMsg = async () => {
  const _message = message.value

  if (!_message) {
    return
  }

  const timestamp = Date.now()
  const _messageList = messageList.value
  const stampMsg = _messageList[lastMsgStampIndex]
  const common: message = {
    type: 'message',
    content: [_message],
    sent: true,
    timestamp
  }
  dataChannel.send(
    JSON.stringify({
      timestamp,
      message: _message
    })
  )
  _messageList.push(common)
  addMessageLabel(timestamp)
  addMessage({ roomId, ...common })
  removeLastMsgStamp(stampMsg)
  scrollToBottom()
  message.value = ''
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

const onReceiveMsg = ({ channel }: { channel: RTCDataChannel }) => {
  channel.onmessage = ({ data }: { data: string }) => {
    const { message, timestamp } = JSON.parse(data)
    // socket.emit('saved-file', roomId, null)
    const _messageList = messageList.value
    const stampMsg = _messageList[lastMsgStampIndex]
    const common: message = {
      type: 'message',
      content: [message],
      sent: false,
      timestamp
    }
    _messageList.push(common)
    addMessageLabel(timestamp)
    addMessage({ roomId, ...common })
    removeLastMsgStamp(stampMsg)
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
  pc.ondatachannel = onReceiveMsg
  dataChannel = useInitDataChannel(pc)
}

const formatTimeAgo = timestamp => {
  const diff = Date.now() - timestamp

  return diff < minute
    ? '刚刚'
    : diff < hour
      ? `${Math.floor(diff / minute)} 分钟前`
      : diff < day
        ? `${Math.floor(diff / hour)} 小时前`
        : `${Math.floor(diff / day)} 天前`
}

const updateLastMsgStamp = () => {
  const _messageList = messageList.value
  const { length } = _messageList

  if (length) {
    lastMsgStampIndex = length - 1
    const lastMsg = _messageList[lastMsgStampIndex]
    lastMsg.stamp = formatTimeAgo(lastMsg.timestamp)
  }
}

// 当自己加入房间时触发
const onJoined = async (_, __, _polite) => {
  clearInterval(lastMsgTimer)
  polite = _polite
  joined.value = true

  if (!polite) {
    initPC()
    socket.emit('otherjoin', roomId)
  }

  scrollToBottom()
  updateLastMsgStamp()
  lastMsgTimer = setInterval(() => {
    updateLastMsgStamp()
  }, 2 * minute)
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
  if (!leaved.value) {
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
    remoteroomId.value = roomId = message
    // 记录房间号
    useSaveRoomId(message)
    replaceQuery({ roomId })
    isMatch.value = false
    socket.emit('join', roomId)
    useNotify('匹配成功')
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
    scrollToBottom()
  })

  // 在对方离线的时候，我离开了，对方在线后应该先去服务器看我还在不在
}

const onBackRoomPIN = async () => {
  exitRoom()
  replaceQuery({})
  pin.value.length = 0
}

const onBye = () => (leaved.value = otherLeaved.value = true)

const onRematch = async () => {
  exitRoom()
  initMatch()
}

const initMatch = () => {
  isMatch.value = true
  replaceQuery({ type: 'match' })
  initSocketForMatch()
}

const exitRoom = async () => {
  // 重新匹配时，你可能是没选择离开的人，此时 socket 和 pc 都还存在，需要手动断开
  // 否则新的 socket 生成后，旧的会在几秒后才断开，会触发 disconnect 回调关闭新的 pc
  // 为什么不把关闭的行为放在 onBye 回调中，因为我离开时对方可能不在线，对方在线时
  // 发现我已经离开了，只能点击重新匹配按钮，进入到这里，如果我离开时对方在线，也只能
  // 点击重新匹配按钮，进入到这里
  useClosePC(pc)
  socket.disconnect()
  // 重新匹配时删除聊天记录
  await useClearMessages(roomId)
  useClearRoomId()
  remoteroomId.value = roomId = ''
  leaved.value = joined.value = false
}

const initSocketForRoom = () => {
  initSocket()
  socket.emit('join', roomId)
}

const initSocketForMatch = () => {
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

const replaceQuery = query => router.replace({ path, query })

onMounted(async () => {
  if (roomId) {
    // 如果获取到了远程房间，可能需要更新 query 参数
    replaceQuery({ roomId })
    initSocketForRoom()
  } else if (isMatch.value) {
    initSocketForMatch()
  }
})

watch(pin, async v => {
  if (v.length === pinLength) {
    remoteroomId.value = roomId = 'chat-' + v.join('')
    useSaveRoomId(roomId)
    replaceQuery({ roomId })
    initSocketForRoom()
  }
})
</script>
