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
      <div
        v-if="!leaved"
        class="relative flex h-full flex-col items-center justify-center"
      >
        <UButton
          class="absolute top-0 right-0"
          label="查看接收的文件"
          color="neutral"
          variant="subtle"
          trailing-icon="i-lucide-chevron-right"
          @click="isOpenReceivedFilesDrawer = true"
        />
        <UDrawer
          v-model:open="isOpenReceivedFilesDrawer"
          :handle="false"
          title=" "
          description=" "
          direction="right"
          class="w-[30vw]"
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
                v-for="(
                  { name, formatSize, status, blob }, index
                ) in receivedFiles"
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
      <div class="flex w-full flex-col items-center justify-center">
        <div>{{ otherLeaved ? '对方' : '你' }}已离开房间...</div>
        <UButton
          class="mt-4"
          @click="simpleLeave"
          :label="isRoomMode ? '重新进入房间' : '重新匹配'"
        ></UButton>
      </div>
    </template>
  </UModal>
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
import { updateLatestRoom, getLatestRoom, isExitRoom } from '@/apis/latest-room'

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
const leaved = ref(isExit)
const otherLeaved = ref(isExit)
const isFull = ref(false)

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
      _remoteRoomInfo.roomId,
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
      _remoteRoomInfo.roomId,
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
    isRoomMode ? '/room/file-transfer' : '/match/file-transfer',
    socket,
    _remoteRoomInfo,
    online,
    () => {}
  )
  pc.ondatachannel = onReceiveFile
  dataChannel = useInitDataChannel(pc)
  return pc
}

const onJoined = async (_, __, _polite) =>
  useJoined(socket, polite, _remoteRoomInfo.roomId, initPC, _polite)

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

const leaveAfterConnected = async () => {
  useClosePC(pc)
  socket.disconnect()
  await updateLatestRoom()
  leaved.value = true
  otherInfo.value = null
  online.value = false
}

const onLeave = async close =>
  useLeave(close, _remoteRoomInfo, socket, simpleLeave)

const onBye = () => useBye(leaveAfterConnected, otherLeaved)

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
  socket.on('bye', onBye)
  socket.on('file-metadata', onFileMetadata)
  socket.on('receive-file-metadata', onReceiveFileMetadata)
  socket.on('saved-file', onSavedFile)
  socket.emit('join', _remoteRoomInfo.roomId)

  return socket
}

onMounted(async () => {
  useMounted(initSocket, router, hasRemoteRoomId, path, _remoteRoomInfo)
})

onBeforeUnmount(() => useBeforeUnmount(socket))
</script>
