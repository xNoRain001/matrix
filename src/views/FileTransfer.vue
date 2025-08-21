<template>
  <RoomFull v-if="isFull"></RoomFull>

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
      <RoomHeader :leaved="leaved" :on-click="onLeave"></RoomHeader>
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
        <RoomLeave :is-match="isMatch" :simple-leave="simpleLeave"></RoomLeave>
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

  <ModalOffline
    :loading="loading"
    v-model="showOfflineModal"
    @click="onReconnect"
  ></ModalOffline>

  <ModalCandidate
    v-model="isContactModalOpen"
    :socket="socket"
  ></ModalCandidate>
</template>

<script lang="ts" setup>
import {
  useClosePC,
  useExtendFileStatus,
  useReceiveFile,
  useSendFile,
  useBeforeUnmount,
  useLeave,
  useExportFile,
  useNoop,
  useRefreshRoomInfo,
  useVisibilityChange,
  useExtendRoom,
  useExtendFile,
  useFixRoomInfo
} from '@/hooks'
// import { exportFile } from 'quasar'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { pending, received, sending, sent } from '@/const'
import type { extendedFile, extendedFiles, receivedFiles } from '@/types'
import { storeToRefs } from 'pinia'
import { useRoomStore } from '@/store'
import { updateLatestRoom } from '@/apis/latest-room'
import { useMediaQuery } from '@vueuse/core'
import useInitPC, { sharedVars } from '@/hooks/use-init-pc'

const isContactModalOpen = ref(false)
const isDesktop = useMediaQuery('(min-width: 768px)')
const isOpenReceivedFilesDrawer = ref(false)
const files = ref<extendedFiles>([])
const oepnModal = ref(true)
let cancelVisibilityChangeHandler = useNoop
const receiveStartTime = ref(0)
// 对方是否收到了文件元信息的标识
const { online, pc, socket, dataChannel, showOfflineModal, loading } =
  sharedVars()
const isFull = ref(false)
const leaved = ref(false)
const flag = ref(false) // 是否完成保存文件的标识
const inSending = ref(false)
const inReceving = ref(false)
const receivedFiles: receivedFiles = ref([])
const {
  path,
  query: { roomId }
} = useRoute()
const router = useRouter()
const {
  isMatch,
  remoteRoomInfo,
  otherInfo,
  firstRequestRemoteRoomInfo,
  getOnlineWhenReconnection
} = storeToRefs(useRoomStore())
const toast = useToast()

const onReconnect = () => {
  loading.value = true
  initPC()
}

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
      pc.value,
      socket.value,
      dataChannel.value,
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
      socket.value,
      data,
      inReceving,
      receivedFiles,
      received,
      remoteRoomInfo.value.roomId,
      receiveStartTime
    )
  }
}

const initPC = () => {
  useInitPC({
    path: '/file-transfer',
    onDataChannel: onReceiveFile,
    onBye
  })
  useExtendRoom(socket, online, isFull, isContactModalOpen, toast)
  useExtendFile(socket, remoteRoomInfo, flag, receiveStartTime, receivedFiles)
}

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

  router.replace('/')
}

const closePCAndSocket = () => {
  useClosePC(pc.value)
  const _socket = socket.value
  _socket && _socket.disconnect()
}

const leaveAfterConnected = async () => {
  const _remoteRoomInfo = remoteRoomInfo.value
  closePCAndSocket()
  await updateLatestRoom()
  leaved.value = true
  online.value = false
  otherInfo.value = null
  _remoteRoomInfo.roomId = _remoteRoomInfo.path = _remoteRoomInfo.latestId = ''
  _remoteRoomInfo.inRoom = false
}

const onLeave = async () =>
  await useLeave(
    remoteRoomInfo.value,
    socket.value,
    online.value,
    leaveAfterConnected,
    simpleLeave,
    toast
  )

const onBye = () => {
  remoteRoomInfo.value.showExitRoomTip = true
  leaveAfterConnected()
}

onMounted(async () => {
  await useFixRoomInfo(
    router,
    path,
    remoteRoomInfo,
    roomId as string,
    leaved,
    firstRequestRemoteRoomInfo,
    toast
  )
  initPC()
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
  useBeforeUnmount(socket.value)
  cancelVisibilityChangeHandler()
})
</script>
