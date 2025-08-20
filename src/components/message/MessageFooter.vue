<template>
  <UPageCard v-if="isDesktop" variant="subtle" :ui="{ container: '!p-4' }">
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
      <UButton variant="ghost" color="neutral" icon="lucide:mic"></UButton>
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
      <UButton variant="ghost" color="neutral" icon="lucide:smile"></UButton>
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

  <ModalOffline
    :loading="loading"
    v-model="showOfflineModal"
    @click="onReconnect"
  ></ModalOffline>
</template>

<script lang="ts" setup>
import {
  useClearMessages,
  useClosePC,
  useScrollToBottom,
  useBeforeUnmount,
  useRefreshRoomInfo,
  useVisibilityChange,
  useNoop,
  useFixRoomInfo,
  useExtendRoom,
  useExtendFile,
  useReceiveFile,
  useExtendFileStatus,
  useSendFile
} from '@/hooks'
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type {
  fileTypes,
  receivedFiles,
  extendedFiles,
  message,
  dbMessage
} from '@/types'
import { useRoomStore } from '@/store'
import { storeToRefs } from 'pinia'
import { updateLatestRoom } from '@/apis/latest-room'
import { useGetMessages } from '@/hooks'
import useInitPC, { sharedVars } from '@/hooks/use-init-pc'
import { received, sending, sent } from '@/const'
import useAddMessageRecord from '@/hooks/use-add-message-record'
import { useMediaQuery } from '@vueuse/core'

const messageList = defineModel('message-list') as Ref<message[]>
const leaved = defineModel('leaved') as Ref<boolean>
const msgStamp = defineModel('msg-stamp') as any
const { modalRef } = defineProps<{ modalRef: HTMLElement }>()

let db = null
let lastMsgTimer = null
let cancelVisibilityChangeHandler = useNoop
const isDesktop = useMediaQuery('(min-width: 768px)')
// 对方是否收到了文件元信息的标识
const message = ref('')
const {
  path,
  query: { roomId }
} = useRoute()
const router = useRouter()
const {
  remoteRoomInfo,
  otherInfo,
  firstRequestRemoteRoomInfo,
  getOnlineWhenReconnection
} = storeToRefs(useRoomStore())
const { online, pc, socket, dataChannel, showOfflineModal, loading } =
  sharedVars()
const isFull = ref(false)
const flag = ref(false) // 是否完成保存文件的标识
const minute = 60 * 1000
const hour = 60 * minute
const day = 24 * hour
const receivedFiles: receivedFiles = ref([])
const toast = useToast()
const isIOS = /iPhone/i.test(navigator.userAgent)
const inSending = ref(false)
const inReceving = ref(false)
const receiveStartTime = ref(0)
const lastMsgTimeStamp = ref(0)
const photoInputRef = ref<HTMLInputElement | null>(null)
const videoInputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const musicInputRef = ref<HTMLInputElement | null>(null)
const expanded = ref(false)
const sendFiles = ref<extendedFiles>([])

const onReconnect = () => {
  loading.value = true
  initPC()
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
  modalRef.style.top = `${visualViewport.offsetTop}px`
}

const onFocus = () => {
  expanded.value = false
  // 输入框获取焦点时，聊天列表滚动到底部
  useScrollToBottom(modalRef)
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
    useAddMessageRecord(
      db,
      modalRef,
      messageRecord,
      messageList,
      msgStamp,
      lastMsgTimeStamp,
      remoteRoomInfo
    )
    const t = messageList.value
    const msg = t[t.length - 1]
    msg.showProgress = true
    sendFiles.value.push(file)
    await useSendFile(
      pc.value,
      socket.value,
      dataChannel.value,
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
    dataChannel.value.send(
      JSON.stringify({
        type,
        timestamp,
        message: _message
      })
    )
    // 如果发送失败，下面的代码不会被执行

    useAddMessageRecord(
      db,
      modalRef,
      messageRecord,
      messageList,
      msgStamp,
      lastMsgTimeStamp,
      remoteRoomInfo
    )
    message.value = ''
  } catch (error) {
    toast.add({ title: '发送失败', color: 'error' })
  }
}

const closePCAndSocket = () => {
  // 如果访问时发现对方已经离开，不会进行 pc 和 socket 初始化
  useClosePC(pc.value)
  const _socket = socket.value
  _socket && _socket.disconnect()
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

const onBye = async () => {
  remoteRoomInfo.value.showExitRoomTip = true
  leaveAfterConnected()
}

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

const onReceiveMsg = ({ channel }: { channel: RTCDataChannel }) => {
  channel.onmessage = async ({ data }: { data: string | ArrayBuffer }) => {
    let messageRecord = null

    if (Object.prototype.toString.call(data) === '[object ArrayBuffer]') {
      const res = useReceiveFile(
        socket.value,
        data as ArrayBuffer,
        inReceving,
        receivedFiles,
        received,
        remoteRoomInfo.value.roomId,
        receiveStartTime
      )

      // 还没有全部接收完成
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

    useAddMessageRecord(
      db,
      modalRef,
      messageRecord,
      messageList,
      msgStamp,
      lastMsgTimeStamp,
      remoteRoomInfo
    )
  }
}

const initPC = () => {
  useInitPC({
    path: '/chat',
    onDataChannel: onReceiveMsg,
    onBye
  })
  useExtendRoom(socket, online, isFull)
  useExtendFile(socket, remoteRoomInfo, flag, receiveStartTime, receivedFiles)
}

const updateLastMsgStamp = () => {
  const _messageList = messageList.value
  const { length } = _messageList

  if (length) {
    const lastMsg = _messageList[length - 1]
    msgStamp.value.sent = lastMsg.sent
    msgStamp.value.value = formatTimeAgo(lastMsg.timestamp)
  }
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

onMounted(async () => {
  // 如果获取接口数据失败，返回大厅
  await useFixRoomInfo(
    router,
    path,
    remoteRoomInfo,
    roomId as string,
    leaved,
    firstRequestRemoteRoomInfo,
    toast
  )

  // 如果 socket 初始化连接失败（能获取到接口数据，却无法连接 socket，
  // 这是很小概率的事），由重试机制处理
  initPC()
  db = await useGetMessages(messageList, lastMsgTimeStamp, remoteRoomInfo)
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
  updateLastMsgStamp()
  lastMsgTimer = setInterval(() => {
    updateLastMsgStamp()
  }, 2 * minute)
})

onBeforeUnmount(() => {
  clearInterval(lastMsgTimer)
  useBeforeUnmount(socket.value)
  removeVisualViewportListeners()
  cancelVisibilityChangeHandler()
})

defineExpose({
  leaveAfterConnected
})
</script>
