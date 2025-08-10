<template>
  <Full v-if="isFull"></Full>

  <UModal v-else v-model:open="oepnModal" fullscreen title=" " description=" ">
    <template #content></template>
    <template #header>
      <Header :online="online" :leaved="leaved" :on-click="onLeave"></Header>
    </template>
    <template #body>
      <div
        ref="messageListRef"
        class="-mt-4 flex w-full items-center justify-center pb-4"
      >
        <div class="relative w-full max-w-(--room-width)">
          <div
            v-for="(
              { separator, type, timestamp, content, sent, showProgress }, index
            ) in messageList"
            :key="index"
          >
            <div v-if="type === 'label'" class="mt-4 text-center text-sm">
              {{ formatTimestamp(timestamp) }}
            </div>
            <div v-else-if="type === 'message'">
              <div
                :class="separator ? 'mt-4' : 'mt-1'"
                v-if="sent"
                class="flex items-center justify-end gap-3"
              >
                <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
                  {{ content[0] }}
                </div>
                <UAvatar
                  v-if="separator"
                  :text="userInfo.nickname[0] || ''"
                  size="md"
                />
                <div v-else class="h-8 w-8"></div>
              </div>
              <div
                v-else
                :class="separator ? 'mt-4' : 'mt-1'"
                class="flex items-center gap-3"
              >
                <UAvatar
                  v-if="separator"
                  :text="otherInfo?.nickname[0] || ''"
                  size="md"
                />
                <div v-else class="w-8"></div>
                <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
                  {{ content[0] }}
                </div>
              </div>
            </div>
            <div v-else-if="type === 'image'">
              <div
                :class="separator ? 'mt-4' : 'mt-1'"
                v-if="sent"
                class="flex items-center justify-end gap-3"
              >
                <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
                  <img :src="content[0]" />
                </div>
                <UAvatar
                  v-if="separator"
                  :text="userInfo.nickname[0] || ''"
                  size="md"
                />
                <div v-else class="h-8 w-8"></div>
              </div>
              <div
                v-else
                :class="separator ? 'mt-4' : 'mt-1'"
                class="flex items-center gap-3"
              >
                <UAvatar
                  v-if="separator"
                  :text="otherInfo?.nickname[0] || ''"
                  size="md"
                />
                <div v-else class="w-8"></div>
                <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
                  <img :src="content[0]" />
                </div>
              </div>
            </div>
            <div v-else-if="type === 'video'">
              <div
                :class="separator ? 'mt-4' : 'mt-1'"
                v-if="sent"
                class="flex items-center justify-end gap-3"
              >
                <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
                  <video :src="content[0]" controls></video>
                </div>
                <UAvatar
                  v-if="separator"
                  :text="userInfo.nickname[0] || ''"
                  size="md"
                />
                <div v-else class="h-8 w-8"></div>
              </div>
              <div
                v-else
                :class="separator ? 'mt-4' : 'mt-1'"
                class="flex items-center gap-3"
              >
                <UAvatar
                  v-if="separator"
                  :text="otherInfo?.nickname[0] || ''"
                  size="md"
                />
                <div v-else class="w-8"></div>
                <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
                  <video :src="content[0]" controls></video>
                </div>
              </div>
            </div>
            <div v-else-if="type === 'file'">
              <div
                :class="separator ? 'mt-4' : 'mt-1'"
                v-if="sent"
                class="flex items-center justify-end gap-3"
              >
                <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
                  <div class="flex items-center justify-between gap-1.5">
                    <div class="grow">
                      <div>
                        {{ content[1] }}
                      </div>
                      <div class="text-muted text-sm">
                        {{ (content[2] / 1024 / 1024).toFixed(2) }} MB
                      </div>
                      <UProgress
                        v-if="
                          showProgress &&
                          sendFiles[0].fileStatus.status === sending
                        "
                        :ui="{ status: 'justify-start' }"
                        status
                        v-model="sendFiles[0].fileStatus.progress"
                        :max="100"
                      />
                    </div>
                    <UButton
                      icon="lucide:cloud-download"
                      variant="ghost"
                      color="neutral"
                      @click="onDownload(content[0], content[1])"
                    />
                  </div>
                </div>
                <UAvatar
                  v-if="separator"
                  :text="userInfo.nickname[0] || ''"
                  size="md"
                />
                <div v-else class="h-8 w-8"></div>
              </div>
              <div
                v-else
                :class="separator ? 'mt-4' : 'mt-1'"
                class="flex items-center gap-3"
              >
                <UAvatar
                  v-if="separator"
                  :text="otherInfo?.nickname[0] || ''"
                  size="md"
                />
                <div v-else class="w-8"></div>
                <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
                  <div class="flex items-center justify-between gap-1.5">
                    <div class="grow">
                      <div>
                        {{ content[1] }}
                      </div>
                      <div class="text-muted text-sm">
                        {{ (content[2] / 1024 / 1024).toFixed(2) }} MB
                      </div>
                      <UProgress
                        v-if="
                          showProgress &&
                          sendFiles[0].fileStatus.status === sending
                        "
                        :ui="{ status: 'justify-start' }"
                        status
                        v-model="sendFiles[0].fileStatus.progress"
                        :max="100"
                      />
                    </div>
                    <UButton
                      icon="lucide:cloud-download"
                      variant="ghost"
                      color="neutral"
                      @click="onDownload(content[0], content[1])"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="type === 'audio'">
              <div
                :class="separator ? 'mt-4' : 'mt-1'"
                v-if="sent"
                class="flex items-center justify-end gap-3"
              >
                <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
                  <audio :src="content[0]" controls></audio>
                </div>
                <UAvatar
                  v-if="separator"
                  :text="userInfo.nickname[0] || ''"
                  size="md"
                />
                <div v-else class="h-8 w-8"></div>
              </div>
              <div
                v-else
                :class="separator ? 'mt-4' : 'mt-1'"
                class="flex items-center gap-3"
              >
                <UAvatar
                  v-if="separator"
                  :text="otherInfo?.nickname[0] || ''"
                  size="md"
                />
                <div v-else class="w-8"></div>
                <div class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2">
                  <audio :src="content[0]" controls></audio>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="msgStamp.value"
            class="absolute -bottom-5 text-xs"
            :class="msgStamp.sent ? 'right-11' : 'left-11'"
          >
            {{ msgStamp.value }}
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full items-center justify-center">
        <div v-if="leaved" class="flex flex-col items-center justify-center">
          <div>{{ otherLeaved ? '对方' : '你' }}已离开房间...</div>
          <UButton
            class="mt-4"
            @click="simpleLeave"
            :label="isMatch ? '重新匹配' : '重新进入房间'"
          ></UButton>
        </div>
        <div v-else class="flex w-full max-w-(--room-width) flex-col">
          <div class="flex gap-2">
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
              icon="lucide:smile"
            ></UButton>
            <UButton
              variant="ghost"
              color="neutral"
              :icon="expanded ? 'lucide:circle-x' : 'lucide:circle-plus'"
              @click="expanded = !expanded"
            ></UButton>
          </div>
          <UCollapsible v-model:open="expanded">
            <template #content>
              <div class="mt-4 grid grid-cols-4 gap-y-4 p-4">
                <div class="flex flex-col items-center">
                  <UButton
                    color="neutral"
                    icon="lucide:file-image"
                    @click="onOpenFileSelector(photoInputRef)"
                  ></UButton>
                  <div class="mt-2 text-xs">照片</div>
                </div>
                <div class="flex flex-col items-center">
                  <UButton
                    color="neutral"
                    icon="lucide:file-video"
                    @click="onOpenFileSelector(videoInputRef)"
                  ></UButton>
                  <div class="mt-2 text-xs">视频</div>
                </div>
                <div class="flex flex-col items-center">
                  <UButton
                    color="neutral"
                    icon="lucide:file"
                    @click="onOpenFileSelector(fileInputRef)"
                  ></UButton>
                  <div class="mt-2 text-xs">文件</div>
                </div>
                <div class="flex flex-col items-center">
                  <UButton
                    color="neutral"
                    icon="lucide:file-music"
                    @click="onOpenFileSelector(musicInputRef)"
                  ></UButton>
                  <div class="mt-2 text-xs">音乐</div>
                </div>
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
import { onBeforeUnmount, onMounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { received, receiving, sending, sent } from '@/const'

import type { Socket } from 'socket.io-client'
import type { extendedFiles, fileTypes, receivedFiles } from '@/types'
import { useRoomStore, useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'
import { updateLatestRoom, getLatestRoom, isExitRoom } from '@/apis/latest-room'

let lastMsgTimer = null
const messageListRef = ref('messageListRef')
const oepnModal = ref(true)
const makingOffer = ref(false)
const polite = ref(true)
let pc: RTCPeerConnection | null = null
let socket: Socket | null = null
let dataChannel: RTCDataChannel | null = null
// 对方是否收到了文件元信息的标识
const flag = ref(false)
const message = ref('')
const expanded = ref(false)
const {
  path,
  query: { roomId }
} = useRoute()
const router = useRouter()
const isReconnect = ref(false)
const online = ref(false)
const { isMatch, remoteRoomInfo, otherInfo } = storeToRefs(useRoomStore())
const { userInfo } = storeToRefs(useUserInfoStore())
const _userInfo = userInfo.value
let isExit = false
const updateRoomInfo = async () => {
  const latestRoomInfo = (await getLatestRoom()).data
  // 如果 latestId 有值，说明自身还没离开房间
  const { latestId } = latestRoomInfo

  if (latestId) {
    remoteRoomInfo.value = latestRoomInfo
    isExit = (await isExitRoom(latestId)).data
    latestRoomInfo.inRoom = !isExit
  }
}
remoteRoomInfo.value.skipRequest ? null : await updateRoomInfo()
let _remoteRoomInfo = remoteRoomInfo.value
_remoteRoomInfo.roomId = _remoteRoomInfo.roomId || (roomId as string)
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
const msgStamp = reactive({ sent: false, value: '' })

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
  separator?: boolean
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
  const hasLabel = overFiveMins(timestamp)

  if (hasLabel) {
    await addMessageToDB({
      roomId: _remoteRoomInfo.roomId,
      type: 'label',
      timestamp
    })
  }

  return hasLabel

  // 不在这里更新 lastMsgTimeStamp，因为此时视图中还没添加 message label
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
  const { type } = messageRecord

  if (type !== 'message' && type !== 'label') {
    messageRecord.content[0] = URL.createObjectURL(
      messageRecord.content[0] as Blob
    )
  }

  _messageList.push(messageRecord as message)
  msgStamp.value = ''
  useScrollToBottom(messageListRef)
}

const addMessagesToDB = async (messageRecord: dbMessage) => {
  const hasLabel = await addMessageLabelToDB(messageRecord.timestamp)

  if (hasLabel) {
    // 有标签的情况下，说明存在时间间隔，就算发送消息的是同一人也需要添加分隔器
    messageRecord.separator = true
  } else {
    const _messageList = messageList.value

    // 不是连续的消息，这条消息添加分隔器（添加 margin-top 样式）
    if (messageRecord.sent !== _messageList[_messageList.length - 1]?.sent) {
      messageRecord.separator = true
    }
  }

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
  o.progress = 0
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
    const lastMsg = _messageList[length - 1]
    msgStamp.sent = lastMsg.sent
    msgStamp.value = formatTimeAgo(lastMsg.timestamp)
  }
}

// TODO: 和 file-transfer 合并
const initPC = () => {
  pc = useCreatePeerConnection(
    '/hall/chat',
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
  useScrollToBottom(messageListRef)
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

// 被动离开的一方会显示底部按钮，点击后
const simpleLeave = async () => {
  // 被动离开的一方会显示底部按钮，如果是刚进入房间时发现对方离开了，要清空远程房间信息
  // 和本地聊天记录，如果是双方建立连接后，对方离开后，只需要修改路由即可，
  // 清空远程房间信息和本地聊天记录和本地房间信息的操作在 onBye 中完成了
  if (_remoteRoomInfo.latestId) {
    await leaveAfterConnected()
  } else {
    _remoteRoomInfo.roomId =
      _remoteRoomInfo.path =
      _remoteRoomInfo.latestId =
        ''
    _remoteRoomInfo.inRoom = false
  }

  router.replace('/hall')
}

const closePCAndSocket = () => {
  // 如果访问时发现对方已经离开，不会进行 pc 和 socket 初始化
  useClosePC(pc)
  socket && socket.disconnect()
}

// 双方建立连接后，其中一方离开后，双方都会执行这个函数，主动离开的一方在 onLeave 中
// 执行，被动离开的一方在 onBye 执行
const leaveAfterConnected = async () => {
  closePCAndSocket()
  // 清空房间信息
  await useClearMessages(_remoteRoomInfo.roomId)
  await updateLatestRoom()
  useScrollToBottom(messageListRef)
  leaved.value = true
  online.value = false
  otherInfo.value = null
  _remoteRoomInfo.roomId = _remoteRoomInfo.path = _remoteRoomInfo.latestId = ''
  _remoteRoomInfo.inRoom = false
}

// 主动离开，一定是双方都没有离开时才可能被触发的函数
// TODO: 处理连接建立后，其中一方断网，另一方离开，网络恢复后的逻辑
const onLeave = async () => {
  useLeave(
    _remoteRoomInfo,
    socket,
    online.value,
    leaveAfterConnected,
    simpleLeave
  )
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
    isFull
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
  useMounted(
    initSocket,
    router,
    path,
    _remoteRoomInfo,
    otherLeaved.value,
    roomId as string
  )
})

onBeforeUnmount(() => useBeforeUnmount(socket))
</script>
