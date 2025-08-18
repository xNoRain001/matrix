<template>
  <RoomFull v-if="isFull"></RoomFull>

  <UModal
    v-else
    v-model:open="oepnModal"
    fullscreen
    title=" "
    description=" "
    :dismissible="false"
    class="overflow-y-auto"
    :ui="{
      // 背景色保持一致，防止修改 top 时看到主页的 header
      overlay: 'bg-default',
      body: 'overflow-y-visible',
      header: 'sticky top-0 w-full z-10 bg-default',
      footer: 'sticky bottom-0 w-full z-10 bg-default'
    }"
  >
    <template #content></template>
    <template #header>
      <RoomHeader
        :online="online"
        :leaved="leaved"
        :on-click="onLeave"
      ></RoomHeader>
    </template>
    <template #body>
      <div class="-mt-4 flex justify-center pb-4">
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
                <div
                  class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2 break-words whitespace-pre-wrap"
                >
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
                <div
                  class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2 break-words whitespace-pre-wrap"
                >
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
                    <!-- 
                      在线传输时，传输完成显示成功按钮，重新加载页面时，
                      由于 showProgress 为 false，会直接显示成功按钮 
                    -->
                    <div v-if="!showProgress" class="p-1.5">
                      <UIcon
                        name="lucide:circle-check-big"
                        class="text-primary size-5"
                      ></UIcon>
                    </div>
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
      <div ref="footerRef" class="flex w-full justify-center">
        <RoomLeave
          v-if="leaved"
          :is-match="isMatch"
          :simple-leave="simpleLeave"
        ></RoomLeave>
        <div v-else class="w-full max-w-(--room-width)">
          <UPageCard
            v-if="isDesktop"
            variant="subtle"
            :ui="{ container: '!p-4' }"
          >
            <UTextarea
              :disabled="!online"
              placeholder="Ctrl + Enter 换行"
              @keydown.enter.prevent="onKeydown"
              enterkeyhint="send"
              class="relative w-full"
              v-model="message"
              :rows="3"
              :maxrows="3"
              autoresize
              variant="none"
              :ui="{ base: 'p-0' }"
            >
            </UTextarea>

            <div class="flex justify-between">
              <div class="space-x-3">
                <UTooltip text="表情">
                  <UButton
                    :disabled="!online"
                    variant="ghost"
                    icon="lucide:smile"
                  ></UButton>
                </UTooltip>
                <UTooltip text="图片">
                  <UButton
                    :disabled="!online"
                    variant="ghost"
                    icon="lucide:file-image"
                    @click="onOpenFileSelector(photoInputRef)"
                  ></UButton>
                </UTooltip>
                <UTooltip text="视频">
                  <UButton
                    :disabled="!online"
                    variant="ghost"
                    icon="lucide:file-video"
                    @click="onOpenFileSelector(videoInputRef)"
                  ></UButton>
                </UTooltip>
                <UTooltip text="文件">
                  <UButton
                    :disabled="!online"
                    variant="ghost"
                    icon="lucide:file"
                    @click="onOpenFileSelector(fileInputRef)"
                  ></UButton>
                </UTooltip>
                <UTooltip text="音乐">
                  <UButton
                    :disabled="!online"
                    variant="ghost"
                    icon="lucide:file-music"
                    @click="onOpenFileSelector(musicInputRef)"
                  ></UButton>
                </UTooltip>
              </div>
              <UButton
                :disabled="!online"
                @click="onSendMsg"
                icon="lucide:send"
                label="发送"
              ></UButton>
            </div>
          </UPageCard>
          <div v-else>
            <div class="flex items-end gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                icon="lucide:mic"
              ></UButton>
              <UTextarea
                :disabled="!online"
                @keydown.enter.prevent="onSendMsg"
                @focus="onFocus"
                enterkeyhint="send"
                class="grow"
                v-model="message"
                :rows="1"
                :maxrows="9"
                autoresize
              />
              <UButton
                variant="ghost"
                color="neutral"
                icon="lucide:smile"
              ></UButton>
              <UButton
                variant="ghost"
                color="neutral"
                :icon="expanded ? 'lucide:circle-x' : 'lucide:circle-plus'"
                @click="onExpand"
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
      </div>
    </template>
  </UModal>

  <UModal
    :dismissible="false"
    v-model:open="showOfflineModal"
    title="网络错误"
    description=" "
    :ui="{ close: 'hidden' }"
  >
    <template #body>
      <UButton
        color="error"
        label="重新连接"
        :loading="loading"
        loading-icon="i-lucide-loader"
        @click="onReconnect"
      ></UButton>
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
  useExportFile,
  useRefreshRoomInfo,
  useVisibilityChange,
  useNoop
} from '@/hooks'
import { onBeforeUnmount, onMounted, ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { received, receiving, sending, sent } from '@/const'

import type { Socket } from 'socket.io-client'
import type { extendedFiles, fileTypes, receivedFiles } from '@/types'
import { useRoomStore, useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'
import { updateLatestRoom } from '@/apis/latest-room'
import { useMediaQuery } from '@vueuse/core'

let lastMsgTimer = null
let cancelVisibilityChangeHandler = useNoop
const isDesktop = useMediaQuery('(min-width: 768px)')
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
const online = ref(false)
const {
  isMatch,
  remoteRoomInfo,
  otherInfo,
  firstRequestRemoteRoomInfo,
  getOnlineWhenReconnection
} = storeToRefs(useRoomStore())
const { userInfo } = storeToRefs(useUserInfoStore())
const _userInfo = userInfo.value
// 双方中任意一方离开时，值会修改为 true
const leaved = ref(false)
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
// 直接往 modal 上添加 ref 属性无效，因此给 footer 加 ref，通过向上查找得到 modal
const footerRef = ref(null)
const modalRef = computed(() => footerRef.value?.parentNode?.parentNode)
const toast = useToast()
const isIOS = /iPhone/i.test(navigator.userAgent)
const showOfflineModal = ref(false)
const loading = ref(false)

const onReconnect = () => {
  loading.value = true
  initSocket()
}

const onExpand = () => {
  expanded.value = !expanded.value
}

const resizeHandler = () => {
  // 安卓：在呼出键盘后，不会将获取焦点的输入框滚动到视图内，直接修改视图高度为原来的
  // 视图高度 - 键盘高度，原先的视图只是高度变小了，头部依然能够显示，如果内容高度
  // 大于视口宽度，出现滚动条
  // iOS: 在呼出键盘后，会将获取焦点的输入框滚动到视图内，视图高度不会改变，而是由
  // 原本的视图和底部键盘组成，原本的视图溢出的高度最大值为键盘的高度（滚动区域的
  // 最大距离为键盘高度），由输入框的位置决定，这就导致头部可能无法显示在当前视图中，
  // 另外，iOS 键盘显示时，页面的头部和底部都会多出一块衬底区域

  // visualViewport.offsetTop 表示视觉视口相对于布局视口的偏移，标签栏在底部时
  // 这个值可能不准
  // TODO: 找到解决办法
  modalRef.value.style.top = `${visualViewport.offsetTop}px`
}

const onFocus = () => {
  expanded.value = false
  // 输入框获取焦点时，聊天列表滚动到底部
  useScrollToBottom(modalRef)
}

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
      content: [type === 'file' ? null : file, name, size, fileType],
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
      remoteRoomInfo.value.roomId,
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
    | [null, string, number, string] // 发送方不保存发送的文件到本地数据库中
}

// 添加聊天记录
const addMessageToDB = async (message: dbMessage) =>
  await db.add('messages', message)

// 获取所有聊天记录
const getMessages = async () => {
  const data = await db.getAllFromIndex(
    'messages',
    'roomId',
    remoteRoomInfo.value.roomId
  )
  data.forEach(({ type, content, sent }) => {
    if (
      type === 'image' ||
      type === 'video' ||
      (type === 'file' && !sent) ||
      type === 'audio'
    ) {
      content[0] = URL.createObjectURL(content[0])
    }
  })

  return data
}

const messageList = ref<message[]>([])
const lastMsgTimeStamp = ref(0)

const overFiveMins = timestamp => timestamp - lastMsgTimeStamp.value > fiveMins

const addMessageLabelToDB = async (timestamp: number) => {
  const hasLabel = overFiveMins(timestamp)

  if (hasLabel) {
    await addMessageToDB({
      roomId: remoteRoomInfo.value.roomId,
      type: 'label',
      timestamp
    })
  }

  return hasLabel

  // 不在这里更新 lastMsgTimeStamp，因为此时视图中还没添加 message label
}

const onKeydown = e => {
  const { ctrlKey, metaKey, target } = e

  // Ctrl + Enter 或 Command + Enter
  if (ctrlKey || metaKey) {
    const index = target.selectionStart // 获取光标位置
    const { value } = target
    // 插入换行符
    message.value = value.slice(0, index) + '\n' + value.slice(index)
    const newIndex = index + 1
    // 更新光标位置
    setTimeout(() => target.setSelectionRange(newIndex, newIndex))
  } else {
    onSendMsg()
  }
}

const onSendMsg = async () => {
  const _message = message.value

  if (!_message) {
    return
  }

  if (_message.length > 2000) {
    toast.add({ title: '支持的最大消息长度为 2000 字符', color: 'error' })
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
  try {
    dataChannel.send(
      JSON.stringify({
        type,
        timestamp,
        message: _message
      })
    )
    // 如果发送失败，后面的代码不会被执行
    await addMessagesToDB(messageRecord)
    addMessagesToView(messageRecord)
    message.value = ''
  } catch (error) {
    toast.add({ title: '发送失败', color: 'error' })
  }
}

const addMessagesToView = (messageRecord: dbMessage) => {
  addMessageLabelToView(messageRecord)
  addMessageToView(messageRecord)
}

const addMessageLabelToView = (messageRecord: dbMessage) => {
  const { timestamp } = messageRecord

  if (overFiveMins(timestamp)) {
    messageList.value.push({
      roomId: remoteRoomInfo.value.roomId,
      type: 'label',
      timestamp
    })
  }

  lastMsgTimeStamp.value = timestamp
}

const addMessageToView = (messageRecord: dbMessage) => {
  const _messageList = messageList.value
  const { content } = messageRecord

  // content.length > 1 说明不是 message 或 label
  // content[0] !== null 说明是接收方
  if (content.length > 1 && content[0] !== null) {
    messageRecord.content[0] = URL.createObjectURL(
      messageRecord.content[0] as Blob
    )
  }

  _messageList.push(messageRecord as message)
  msgStamp.value = ''
  useScrollToBottom(modalRef)
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

  await addMessageToDB({
    roomId: remoteRoomInfo.value.roomId,
    ...messageRecord
  })
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
        remoteRoomInfo.value.roomId,
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
    '/chat',
    socket,
    remoteRoomInfo.value,
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
  useJoined(socket, polite, remoteRoomInfo.value.roomId, initPC, _polite)
  useScrollToBottom(modalRef)
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
    remoteRoomInfo.value.roomId,
    polite,
    makingOffer,
    initPC,
    _userInfo
  )

const onDisconnect = () => useDisconnect(pc)

const onRtc = (roomId: string, data: any) =>
  useInitRtc(pc, socket, roomId, data, makingOffer, polite, _userInfo)

// 被动离开的一方会显示底部按钮，点击后
const simpleLeave = async () => {
  // 被动离开的一方会显示底部按钮，如果是刚进入房间时发现对方离开了，要清空远程房间信息
  // 和本地聊天记录，如果是双方建立连接后，对方离开后，只需要修改路由即可，
  // 清空远程房间信息和本地聊天记录和本地房间信息的操作在 onBye 中完成了
  const _remoteRoomInfo = remoteRoomInfo.value

  if (_remoteRoomInfo.latestId) {
    await leaveAfterConnected()
  } else {
    _remoteRoomInfo.roomId =
      _remoteRoomInfo.path =
      _remoteRoomInfo.latestId =
        ''
    _remoteRoomInfo.showExitRoomTip = _remoteRoomInfo.inRoom = false
  }

  router.replace('/')
}

const closePCAndSocket = () => {
  // 如果访问时发现对方已经离开，不会进行 pc 和 socket 初始化
  useClosePC(pc)
  socket && socket.disconnect()
}

// 双方建立连接后，其中一方离开后，双方都会执行这个函数，主动离开的一方在 onLeave 中
// 执行，被动离开的一方在 onBye 执行
const leaveAfterConnected = async () => {
  const _remoteRoomInfo = remoteRoomInfo.value
  closePCAndSocket()
  // 清空房间信息
  await useClearMessages(_remoteRoomInfo.roomId)
  await updateLatestRoom()
  useScrollToBottom(modalRef)
  leaved.value = true
  online.value = false
  otherInfo.value = null
  _remoteRoomInfo.roomId = _remoteRoomInfo.path = _remoteRoomInfo.latestId = ''
  _remoteRoomInfo.inRoom = false
}

// 主动离开，一定是双方都没有离开时才可能被触发的函数
// TODO: 处理连接建立后，其中一方断网，另一方离开，网络恢复后的逻辑
const onLeave = async () => {
  await useLeave(
    remoteRoomInfo.value,
    socket,
    online.value,
    leaveAfterConnected,
    simpleLeave,
    toast
  )
}

const onBye = async () => {
  remoteRoomInfo.value.showExitRoomTip = true
  useBye(leaveAfterConnected)
}

const onIsOnline = v => {
  online.value = v
}

const initSocket = () => {
  socket = useInitSocket(
    onJoined,
    onOtherJoin,
    onDisconnect,
    onRtc,
    onBye,
    remoteRoomInfo,
    isFull,
    showOfflineModal,
    loading,
    getOnlineWhenReconnection,
    toast
  )
  // 其他人离开房间
  socket.on('bye', onBye)
  socket.on('file-metadata', onFileMetadata)
  socket.on('receive-file-metadata', onReceiveFileMetadata)
  socket.on('saved-file', onSavedFile)
  socket.on('is-online', onIsOnline)

  return socket
}

const onReceiveFileMetadata = () => (flag.value = true)

const onSavedFile = () => (flag.value = true)

// 处理 iOS 软键盘问题
const addVisualViewportListeners = () => {
  if (isIOS) {
    // 软键盘打开和关闭时触发
    visualViewport.addEventListener('resize', resizeHandler)
    visualViewport.addEventListener('scroll', resizeHandler)
  }
}

const removeVisualViewportListeners = () => {
  if (isIOS) {
    visualViewport.removeEventListener('resize', resizeHandler)
    visualViewport.removeEventListener('scroll', resizeHandler)
  }
}

onMounted(async () => {
  // 如果获取接口数据失败，返回大厅
  await useMounted(
    router,
    path,
    remoteRoomInfo,
    roomId as string,
    leaved,
    firstRequestRemoteRoomInfo,
    initSocket,
    toast
  )

  // 如果处理消息失败，给空消息
  try {
    const messages = await getMessages()
    messageList.value = [...messages]
    lastMsgTimeStamp.value = messages[messages.length - 1]?.timestamp || 0
  } catch {
    messageList.value = []
    lastMsgTimeStamp.value = 0
  }

  addVisualViewportListeners()
  cancelVisibilityChangeHandler = useVisibilityChange(
    socket,
    showOfflineModal,
    leaved,
    remoteRoomInfo,
    useRefreshRoomInfo,
    onBye,
    getOnlineWhenReconnection,
    router
  )
})

onBeforeUnmount(() => {
  clearInterval(lastMsgTimer)
  useBeforeUnmount(socket)
  removeVisualViewportListeners()
  cancelVisibilityChangeHandler()
})
</script>
