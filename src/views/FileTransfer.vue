<template>
  <Full v-if="isFull"></Full>

  <UModal
    v-else
    v-model:open="oepnModal"
    :overlay="false"
    fullscreen
    title=" "
    description=" "
  >
    <template #content></template>
    <template #header>
      <Header :online="online" :leaved="leaved" :on-click="onLeave"></Header>
    </template>
    <template #body>
      <div
        v-if="!leaved"
        class="relative flex h-full flex-col items-center justify-center"
      >
        <UButton
          class="absolute top-0 right-0"
          label="接收"
          color="neutral"
          variant="subtle"
          trailing-icon="lucide:file-archive"
          @click="isOpenReceivedFilesDrawer = true"
        />
        <UFileUpload
          :disabled="inSending"
          highlight
          layout="list"
          v-model="files"
          dropzone
          multiple
          label="选择需要上传的文件（支持拖拽）"
          description="快速、安全"
          class="h-48 w-full max-w-96"
          @update:model-value="useExtendFileStatus"
          :ui="{ fileWrapper: 'w-full' }"
        >
          <template #file-size="{ file }">
            <!-- <div>用时: {{ (file as extendedFile).fileStatus.time }}</div> -->
            <UProgress
              v-if="(file as extendedFile).fileStatus.status !== pending"
              :ui="{ status: 'justify-start' }"
              status
              v-model="(file as extendedFile).fileStatus.progress"
              :max="100"
            />
          </template>
          <template #file-trailing="{ index }">
            <UButton
              :disabled="inSending"
              icon="lucide:x"
              variant="ghost"
              color="neutral"
              @click="onRemoveFile(index)"
            ></UButton>
          </template>
          <template #files-bottom="{ removeFile, files }">
            <div v-if="files.length">
              <UButton
                :disabled="inSending || !online"
                @click="onSendFiles(files)"
                label="开始传输"
              />
              <UButton
                :disabled="inSending"
                class="ml-2"
                label="移除所有文件"
                color="neutral"
                @click="removeFile()"
              />
            </div>
          </template>
        </UFileUpload>
      </div>
    </template>
    <template #footer v-if="leaved">
      <div class="flex w-full justify-center">
        <Leave :is-match="isMatch" :simple-leave="simpleLeave"></Leave>
      </div>
    </template>
  </UModal>

  <UDrawer
    :handle="false"
    v-model:open="isOpenReceivedFilesDrawer"
    title=" "
    description=" "
    direction="right"
    :class="isDesktop ? 'w-[30vw]' : 'w-[80vw]'"
  >
    <template #header>
      <div class="flex items-center">
        <UButton
          variant="ghost"
          color="neutral"
          icon="lucide:chevron-left"
          class="cursor-pointer"
          @click="isOpenReceivedFilesDrawer = false"
        />
        <div class="absolute left-1/2 -translate-x-1/2">接收文件</div>
        <UButton
          variant="ghost"
          color="neutral"
          icon="lucide:trash"
          class="absolute right-4 cursor-pointer"
          @click="onClearReceivedFiles"
        />
      </div>
    </template>
    <template #content></template>
    <template #body>
      <div class="flex flex-col gap-2">
        <div
          class="flex items-center justify-between gap-1.5 rounded-xl border border-(--ui-border) px-2.5 py-1.5"
          v-for="({ name, formatSize, status, blob }, index) in receivedFiles"
          :key="index"
        >
          <div class="grow">
            <div class="text-xs">
              {{ name }}
            </div>
            <div class="text-muted text-xs">{{ formatSize }}</div>
            <UProgress
              :ui="{ status: 'justify-start' }"
              status
              v-model="receivedFiles[index].progress"
              :max="100"
            />
          </div>
          <!-- <div>用时: {{ time }}</div> -->
          <UButton
            v-if="status === received"
            icon="lucide:cloud-download"
            variant="ghost"
            color="neutral"
            @click="useExportFile(name, blob)"
          />
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import {
  useBye,
  useClosePC,
  useCreatePeerConnection,
  useDisconnect,
  useExtendFileStatus,
  useInitDataChannel,
  useInitRtc,
  useInitSocket,
  useOtherJoin,
  useReceiveFile,
  useSendFile,
  useJoined,
  useBeforeUnmount,
  useMounted,
  useLeave,
  useExportFile
} from '@/hooks'
// import { exportFile } from 'quasar'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { pending, received, receiving, sending, sent } from '@/const'

import type { Socket } from 'socket.io-client'
import type { extendedFile, extendedFiles, receivedFiles } from '@/types'
import { storeToRefs } from 'pinia'
import { useRoomStore, useUserInfoStore } from '@/store'
import { updateLatestRoom } from '@/apis/latest-room'
import { useMediaQuery } from '@vueuse/core'

const isDesktop = useMediaQuery('(min-width: 768px)')
const isOpenReceivedFilesDrawer = ref(false)
const files = ref<extendedFiles>([])
const oepnModal = ref(true)
const makingOffer = ref(false)
const polite = ref(true)
let pc: RTCPeerConnection | null = null
let socket: Socket | null = null
let dataChannel: RTCDataChannel | null = null
const receiveStartTime = ref(0)
// 对方是否收到了文件元信息的标识
const flag = ref(false)
const inSending = ref(false)
const inReceving = ref(false)
const receivedFiles: receivedFiles = ref([])
const {
  path,
  query: { roomId }
} = useRoute()
const router = useRouter()
const online = ref(false)
const { isMatch, remoteRoomInfo, otherInfo } = storeToRefs(useRoomStore())
const { userInfo } = storeToRefs(useUserInfoStore())
const _userInfo = userInfo.value
const leaved = ref(false)
const isFull = ref(false)
const toast = useToast()
const showOfflineModal = ref(false)
const loading = ref(false)

const onRemoveFile = index => {
  files.value.splice(index, 1)
}

const onClearReceivedFiles = () => {
  receivedFiles.value = []
}

// TODO: 一键下载所有文件
// const onDownloadAll = () => {}

const onSendFiles = async files => {
  inSending.value = true

  for (let i = 0, l = files.length; i < l; i++) {
    await useSendFile(
      pc,
      socket,
      dataChannel,
      remoteRoomInfo.value.roomId,
      files[i],
      flag,
      sending,
      sent
    )
  }

  inSending.value = false
}

const onReceiveFile = ({ channel }: { channel: RTCDataChannel }) => {
  channel.onmessage = ({ data }: { data: ArrayBuffer }) => {
    useReceiveFile(
      socket,
      data,
      inReceving,
      receivedFiles,
      received,
      remoteRoomInfo.value.roomId,
      receiveStartTime
    )
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

const onReceiveFileMetadata = () => (flag.value = true)

const onSavedFile = () => (flag.value = true)

const initPC = () => {
  pc = useCreatePeerConnection(
    '/hall/file-transfer',
    socket,
    remoteRoomInfo.value,
    online,
    () => {}
  )
  pc.ondatachannel = onReceiveFile
  dataChannel = useInitDataChannel(pc)
  return pc
}

const onJoined = async (_, __, _polite) =>
  useJoined(socket, polite, remoteRoomInfo.value.roomId, initPC, _polite)

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

const simpleLeave = async () => {
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

  router.replace('/hall')
}

const closePCAndSocket = () => {
  useClosePC(pc)
  socket && socket.disconnect()
}

const leaveAfterConnected = async () => {
  closePCAndSocket()
  socket.disconnect()
  await updateLatestRoom()
  leaved.value = true
  otherInfo.value = null
  online.value = false
  const _remoteRoomInfo = remoteRoomInfo.value
  _remoteRoomInfo.roomId = _remoteRoomInfo.path = _remoteRoomInfo.latestId = ''
  _remoteRoomInfo.inRoom = false
}

const onLeave = async () =>
  await useLeave(
    remoteRoomInfo.value,
    socket,
    online.value,
    leaveAfterConnected,
    simpleLeave,
    toast
  )

const onBye = () => {
  remoteRoomInfo.value.showExitRoomTip = true
  useBye(leaveAfterConnected)
}

const initSocket = () => {
  const { roomId } = remoteRoomInfo.value
  socket = useInitSocket(
    onJoined,
    onOtherJoin,
    onDisconnect,
    onRtc,
    roomId,
    isFull,
    showOfflineModal,
    loading,
    toast
  )
  socket.on('bye', onBye)
  socket.on('file-metadata', onFileMetadata)
  socket.on('receive-file-metadata', onReceiveFileMetadata)
  socket.on('saved-file', onSavedFile)

  return socket
}

onMounted(async () => {
  try {
    await useMounted(router, path, remoteRoomInfo, roomId as string, leaved)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return router.replace('/hall')
  }

  initSocket()
})

onBeforeUnmount(() => useBeforeUnmount(socket))
</script>
