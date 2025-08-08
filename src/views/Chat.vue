<template>
  <Full v-if="isFull"></Full>

  <UModal v-else v-model:open="oepnModal" fullscreen title=" " description=" ">
    <template #content></template>
    <template #header>
      <RoomHeader
        :online="online"
        :leaved="leaved"
        :on-click="onLeave"
      ></RoomHeader>
    </template>
    <template #body>
      <template
        v-for="(
          { type, timestamp, content, sent, stamp, showProgress }, index
        ) in messageList"
      >
        <q-chat-message
          v-if="type === 'label'"
          :label="formatTimestamp(timestamp)"
        ></q-chat-message>
        <q-chat-message
          v-if="type === 'image'"
          :avatar="avatar"
          :key="index"
          :text="content"
          :sent="sent"
          :stamp="stamp"
          bg-color="green"
        >
          <img :src="content[0]" />
        </q-chat-message>
        <q-chat-message
          v-if="type === 'video'"
          :avatar="avatar"
          :key="index"
          :text="content"
          :sent="sent"
          :stamp="stamp"
          bg-color="green"
        >
          <video :src="content[0]" controls></video>
        </q-chat-message>
        <q-chat-message
          v-if="type === 'audio'"
          :avatar="avatar"
          :key="index"
          :text="content"
          :sent="sent"
          :stamp="stamp"
          bg-color="green"
        >
          <audio :src="content[0]" controls></audio>
        </q-chat-message>
        <q-chat-message
          v-if="type === 'file'"
          :avatar="avatar"
          :key="index"
          :text="content"
          :sent="sent"
          :stamp="stamp"
          bg-color="green"
        >
          <q-item>
            <q-item-section>
              <q-item-label class="full-width ellipsis">
                {{ content[1] }}
              </q-item-label>
              <q-item-label caption
                >大小：{{
                  (content[2] / 1024 / 1024).toFixed(2)
                }}
                MB</q-item-label
              >
            </q-item-section>
            <q-item-section top side>
              <!-- 关闭进度条的行为在修改 status 为传送完成之后 -->
              <q-btn
                v-if="
                  showProgress && sendFiles[0].fileStatus.status === sending
                "
                color="white"
                dense
                round
                flat
                :label="sendFiles[0].fileStatus.formatedProgress"
              />
              <q-btn
                v-else
                dense
                round
                flat
                icon="cloud_download"
                @click="onDownload(content[0], content[1])"
              />
            </q-item-section>
          </q-item>
        </q-chat-message>
        <q-chat-message
          v-if="type === 'message'"
          :avatar="avatar"
          :key="index"
          :text="content"
          :sent="sent"
          :stamp="stamp"
          bg-color="green"
        />
      </template>
    </template>
    <template #footer>
      <div class="flex w-full items-center justify-center">
        <div v-if="leaved">
          <div>{{ otherLeaved ? '对方' : '你' }}已离开房间...</div>
          <UButton
            class="mt-4"
            @click="simpleLeave"
            :label="isRoomMode ? '重新进入房间' : '重新匹配'"
          ></UButton>
        </div>
        <div v-else class="flex w-full max-w-(--room-width) flex-col">
          <div class="flex w-full">
            <UButton
              variant="ghost"
              color="neutral"
              icon="lucide:mic"
            ></UButton>
            <UInput
              class="grow"
              @keydown.enter="onSendMsg"
              v-model="message"
              :disabled="!online"
            >
            </UInput>
            <UButton
              variant="ghost"
              color="neutral"
              icon="lucide:circle-plus"
              @click="expanded = true"
            ></UButton>
          </div>
          <UCollapsible v-model:open="expanded">
            <template #content>
              <div class="mt-4 grid grid-cols-4 gap-y-4">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="lucide:file-image"
                  @click="onOpenFileSelector(photoInputRef)"
                  label="照片"
                  class="flex flex-col"
                ></UButton>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="lucide:file-video"
                  @click="onOpenFileSelector(videoInputRef)"
                  label="视频"
                  class="flex flex-col"
                ></UButton>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="lucide:file"
                  @click="onOpenFileSelector(fileInputRef)"
                  label="文件"
                  class="flex flex-col"
                ></UButton>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="lucide:file-music"
                  @click="onOpenFileSelector(musicInputRef)"
                  label="音乐"
                  class="flex flex-col"
                ></UButton>
              </div>
            </template>
          </UCollapsible>
        </div>
      </div>
    </template>
  </UModal>

  <input
    ref="photoInputRef"
    @change="onPhotoInputChange"
    type="file"
    hidden
    multiple
    accept="image/*"
  />
  <input
    ref="videoInputRef"
    @change="onVideoInputChange"
    type="file"
    hidden
    multiple
    accept="video/*"
  />
  <input
    ref="fileInputRef"
    @change="onFileInputChange"
    type="file"
    hidden
    multiple
  />
  <input
    ref="musicInputRef"
    @change="onMusicInputChange"
    type="file"
    hidden
    multiple
    accept="audio/*"
  />
</template>

<script lang="ts" setup>
import {
  useClearMessages,
  useClosePC,
  useCreatePeerConnection,
  useDisconnect,
  useExtendFileStatus,
  useGetDB,
  useInitDataChannel,
  useInitRtc,
  useInitSocket,
  useOtherJoin,
  useReceiveFile,
  useScrollToBottom,
  useSendFile,
  useJoined,
  useMounted,
  useBeforeUnmount,
  useBye,
  useLeave,
  useExportFile
} from '@/hooks'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { received, receiving, sending, sent } from '@/const'

import type { Socket } from 'socket.io-client'
import type { extendedFiles, fileTypes, receivedFiles } from '@/types'
// import { exportFile } from 'quasar'
import { useRoomStore, useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'
import { updateLatestRoom, getLatestRoom, isExitRoom } from '@/apis/latest-room'

let lastMsgTimer = null
let lastMsgStampIndex = 0
const oepnModal = ref(true)
const makingOffer = ref(false)
const polite = ref(true)
let avatar = 'https://cdn.quasar.dev/img/avatar4.jpg'
let pc: RTCPeerConnection | null = null
let socket: Socket | null = null
let dataChannel: RTCDataChannel | null = null
// 对方是否收到了文件元信息的标识
const flag = ref(false)
const message = ref('')
const expanded = ref(false)
const {
  path,
  query,
  meta: { tab, parentPath }
} = useRoute()
const isRoomMode = tab === 'room'
const router = useRouter()
const isReconnect = ref(false)
const online = ref(false)
const { remoteRoomInfo, otherInfo } = storeToRefs(useRoomStore())
const { userInfo } = storeToRefs(useUserInfoStore())
const _userInfo = userInfo.value
let hasRemoteRoomId = false
let isExit = false
const updateRoomInfo = async () => {
  const latestRoomInfo = (await getLatestRoom()).data
  // 如果 latestId 有值，说明自身还没离开房间
  const latestId = latestRoomInfo?.latestId
  hasRemoteRoomId = Boolean(latestId)

  if (hasRemoteRoomId) {
    remoteRoomInfo.value = latestRoomInfo
    isExit = (await isExitRoom(latestId)).data
    latestRoomInfo.inRoom = !isExit
  }
}
remoteRoomInfo.value.skipRequest ? null : await updateRoomInfo()
let _remoteRoomInfo = remoteRoomInfo.value
_remoteRoomInfo.roomId = _remoteRoomInfo.roomId || (query.roomId as string)
// 双方中任意一方离开时，值会修改为 true
const leaved = ref(isExit)
const otherLeaved = ref(isExit)
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
const photoInputRef = ref<HTMLInputElement | null>(null)
const videoInputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const musicInputRef = ref<HTMLInputElement | null>(null)
const inSending = ref(false)
const inReceving = ref(false)
const receivedFiles: receivedFiles = ref([])
const sendFiles = ref<extendedFiles>([])
const receiveStartTime = ref(0)
const isFull = ref(false)

const onDownload = (url, filename) => {
  fetch(url)
    .then(res => res.blob())
    .then(blob => useExportFile(filename, blob))
}

const onOpenFileSelector = target => target.click()

const sendFile = async (files: extendedFiles, type: fileTypes) => {
  useExtendFileStatus(files)
  inSending.value = true
  for (let i = 0, l = files.length; i < l; i++) {
    const file = files[i]
    const { name, size, type: fileType } = file
    const timestamp = Date.now()
    const messageRecord: dbMessage = {
      type,
      content: [file, name, size, fileType],
      sent: true,
      timestamp
    }
    // 直接保存 File，取出时再转化成 Blob URL
    await addMessagesToDB(messageRecord)
    addMessageToView(messageRecord)
    const t = messageList.value
    const msg = t[t.length - 1]
    msg.showProgress = true
    sendFiles.value.push(file)
    await useSendFile(
      pc,
      socket,
      dataChannel,
      _remoteRoomInfo.roomId,
      file as any,
      flag,
      sending,
      sent,
      type
    )
    msg.showProgress = false
    sendFiles.value.pop()
  }
  inSending.value = false
}

const onMusicInputChange = async () => {
  const musicInput = musicInputRef.value
  const { files } = musicInput
  sendFile(files as unknown as extendedFiles, 'audio')
  musicInput.value = ''
}

const onFileInputChange = async () => {
  const fileInput = fileInputRef.value
  const { files } = fileInput
  sendFile(files as unknown as extendedFiles, 'file')
  fileInput.value = ''
}

const onVideoInputChange = async () => {
  const videoInpu = videoInputRef.value
  const { files } = videoInpu
  sendFile(files as unknown as extendedFiles, 'video')
  videoInpu.value = ''
}

const onPhotoInputChange = async () => {
  const photoInput = photoInputRef.value
  const { files } = photoInput
  sendFile(files as unknown as extendedFiles, 'image')
  photoInput.value = ''
}

const formatTimestamp = (timestamp: number) => {
  // TODO: 更久远的记录显示日期甚至年份
  return new Date(timestamp).toLocaleString('zh-CN', dateTimeFormatOptions)
}

type commonMessage = {
  roomId?: string
  type: 'message' | 'label' | fileTypes
  sent?: boolean
  timestamp: number
  stamp?: string
}

type message = commonMessage & {
  showProgress?: boolean // 控制是否显示发送文件时的进度
  content?:
    | [string]
    | [string, string, number, string] // url 文件名 大小 文件类型
    | [string, string, number, string] // url 文件名 大小 文件类型
}

type dbMessage = commonMessage & {
  content?:
    | [string]
    | [File, string, number, string] // File 文件名 大小 文件类型
    | [Blob, string, number, string] // Blob 文件名 大小 文件类型
}

// 添加聊天记录
const addMessageToDB = async (message: dbMessage) =>
  await db.add('messages', message)

// 获取所有聊天记录
const getMessages = async () => {
  const data = await db.getAllFromIndex(
    'messages',
    'roomId',
    _remoteRoomInfo.roomId
  )
  data.forEach(({ type, content }) => {
    if (
      type === 'image' ||
      type === 'video' ||
      type === 'file' ||
      type === 'audio'
    ) {
      content[0] = URL.createObjectURL(content[0])
    }
  })
  return data
}

const messageList = ref<message[]>(
  _remoteRoomInfo.roomId ? [...(await getMessages())] : []
)
const t = messageList.value
let lastMsgTimeStamp = t[t.length - 1]?.timestamp || 0

const overFiveMins = timestamp => timestamp - lastMsgTimeStamp > fiveMins

const addMessageLabelToDB = async (timestamp: number) => {
  if (overFiveMins(timestamp)) {
    await addMessageToDB({
      roomId: _remoteRoomInfo.roomId,
      type: 'label',
      timestamp
    })
  }

  // 不在这里更新 lastMsgTimeStamp，因为此时视图中还没添加 message label
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

  const type = 'message'
  const timestamp = Date.now()
  const messageRecord: dbMessage = {
    type,
    content: [_message],
    sent: true,
    timestamp
  }
  dataChannel.send(
    JSON.stringify({
      type,
      timestamp,
      message: _message
    })
  )
  await addMessagesToDB(messageRecord)
  addMessagesToView(messageRecord)
  message.value = ''
}

const addMessagesToView = (messageRecord: dbMessage) => {
  addMessageLabelToView(messageRecord)
  addMessageToView(messageRecord)
}

const addMessageLabelToView = (messageRecord: dbMessage) => {
  const { timestamp } = messageRecord

  if (overFiveMins(timestamp)) {
    messageList.value.push({
      roomId: _remoteRoomInfo.roomId,
      type: 'label',
      timestamp
    })
  }

  lastMsgTimeStamp = timestamp
}

const addMessageToView = (messageRecord: dbMessage) => {
  const _messageList = messageList.value
  const stampMsg = _messageList[lastMsgStampIndex]
  const { type } = messageRecord

  if (type !== 'message' && type !== 'label') {
    messageRecord.content[0] = URL.createObjectURL(
      messageRecord.content[0] as Blob
    )
  }

  _messageList.push(messageRecord as message)
  removeLastMsgStamp(stampMsg)
  useScrollToBottom()
}

const addMessagesToDB = async (messageRecord: dbMessage) => {
  await addMessageLabelToDB(messageRecord.timestamp)
  await addMessageToDB({ roomId: _remoteRoomInfo.roomId, ...messageRecord })
}

const onReceiveMsg = ({ channel }: { channel: RTCDataChannel }) => {
  channel.onmessage = async ({ data }: { data: string | ArrayBuffer }) => {
    let messageRecord = null

    if (Object.prototype.toString.call(data) === '[object ArrayBuffer]') {
      const res = useReceiveFile(
        socket,
        data as ArrayBuffer,
        inReceving,
        receivedFiles,
        received,
        _remoteRoomInfo.roomId,
        receiveStartTime
      )

      if (!res) {
        return
      }

      const { blob, name, size, type, timestamp, messageType } = res
      messageRecord = {
        type: messageType,
        content: [blob, name, size, type], // 直接保存 Blob，取出时转为 Blob URL
        sent: false,
        timestamp
      }
    } else {
      const { timestamp, message, type } = JSON.parse(data as string)
      messageRecord = {
        type,
        content: [message],
        sent: false,
        timestamp
      }
    }
    // 本地记录中会将 blob 转为 url，因为必须先保存记录进数据库
    await addMessagesToDB(messageRecord)
    addMessagesToView(messageRecord)
  }
}

const onFileMetadata = async (roomId: string, data: any) => {
  receiveStartTime.value = Date.now()
  const o = { ...data }
  o.status = receiving
  o.formatSize = (data.size / 1024 / 1024).toFixed(2) + 'MB'
  o.progress = '0 %'
  o.time = '0 s'
  // o.speed = '0 MB/s'
  receivedFiles.value.push(o)
  socket.emit('receive-file-metadata', roomId, null)
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

// TODO: 和 file-transfer 合并
const initPC = () => {
  pc = useCreatePeerConnection(
    isRoomMode ? '/room/chat' : '/match/chat',
    socket,
    _remoteRoomInfo,
    online,
    () => {}
  )
  pc.ondatachannel = onReceiveMsg
  dataChannel = useInitDataChannel(pc)
  return pc
}

// 当自己加入房间时触发
const onJoined = (_, __, _polite) => {
  clearInterval(lastMsgTimer)
  useJoined(socket, polite, _remoteRoomInfo.roomId, initPC, _polite)
  useScrollToBottom()
  updateLastMsgStamp()
  lastMsgTimer = setInterval(() => {
    updateLastMsgStamp()
  }, 2 * minute)
}

// 当其他人加入房间时触发
const onOtherJoin = () =>
  useOtherJoin(
    pc,
    socket,
    _remoteRoomInfo.roomId,
    polite,
    makingOffer,
    initPC,
    _userInfo
  )

const onDisconnect = () => useDisconnect(pc, leaved, isReconnect)

const onRtc = (roomId: string, data: any) =>
  useInitRtc(pc, socket, roomId, data, makingOffer, polite, _userInfo)

const simpleLeave = () => {
  _remoteRoomInfo.roomId = _remoteRoomInfo.path = _remoteRoomInfo.latestId = ''
  _remoteRoomInfo.inRoom = false
  router.replace(parentPath)
}

// 双方已建立连接后，其中一方离开
const leaveAfterConnected = async () => {
  useClosePC(pc)
  socket.disconnect()
  // 清空房间信息
  await useClearMessages(_remoteRoomInfo.roomId)
  await updateLatestRoom()
  useScrollToBottom()
  leaved.value = true
  otherInfo.value = null
  online.value = false
}

// 主动离开
const onLeave = async close => {
  useLeave(close, _remoteRoomInfo, socket, simpleLeave)
}

const onBye = async () => useBye(leaveAfterConnected, otherLeaved)

const initSocket = () => {
  socket = useInitSocket(
    onJoined,
    onOtherJoin,
    onDisconnect,
    onRtc,
    isReconnect,
    _remoteRoomInfo.roomId,
    isFull,
    leaveAfterConnected
  )
  // 其他人离开房间
  socket.on('bye', onBye)
  socket.on('file-metadata', onFileMetadata)
  socket.on('receive-file-metadata', onReceiveFileMetadata)
  socket.on('saved-file', onSavedFile)
  socket.emit('join', _remoteRoomInfo.roomId)

  return socket
}

const onReceiveFileMetadata = () => (flag.value = true)

const onSavedFile = () => (flag.value = true)

onMounted(async () => {
  useMounted(initSocket, router, hasRemoteRoomId, path, _remoteRoomInfo)
})

onBeforeUnmount(() => useBeforeUnmount(socket))
</script>
