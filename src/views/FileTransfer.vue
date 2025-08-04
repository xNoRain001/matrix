<template>
  <PIN
    v-if="!(remoteRoomInfo.roomId || isMatch)"
    type="file-transfer"
    :watch-pin-cb="watchPinCb"
  ></PIN>
  <Back v-if="!remoteRoomInfo.roomId" :back="onBack"></Back>
  <Matching
    v-if="isMatch"
    :offline="offline"
    :pause="pause"
    :rematch="onRematchWithOffline"
  ></Matching>
  <Full v-if="isFull" :leave="onLeaveFullRoom"></Full>

  <div class="flex-center flex">
    <div
      v-if="remoteRoomInfo.roomId"
      class="relative h-[var(--content-height)] w-full max-w-[var(--room-width)]"
    >
      <div v-if="!leaved" class="flex h-full flex-col justify-center">
        <q-uploader
          @added="onAdded"
          class="mt-4 !w-full bg-transparent"
          multiple
        >
          <template v-slot:header="scope">
            <div
              class="row no-wrap q-pa-sm q-gutter-xs items-center bg-[#0d1117]"
            >
              <q-btn
                icon="clear_all"
                @click="scope.removeQueuedFiles"
                round
                dense
                :disable="inSending || !scope.queuedFiles.length"
              >
                <q-tooltip class="!bg-[#3d444d]">清空所有文件</q-tooltip>
              </q-btn>
              <div class="col">
                <div class="q-uploader__title">
                  选择需要上传的文件（支持拖拽）
                </div>
              </div>
              <q-btn
                @click="onLeave"
                icon="logout"
                round
                dense
                :disable="inSending"
                ><q-tooltip class="!bg-[#3d444d]">退出</q-tooltip></q-btn
              >
              <q-btn
                icon="add_box"
                @click="scope.pickFiles"
                round
                dense
                :disable="inSending"
              >
                <q-uploader-add-trigger v-if="!inSending" />
                <q-tooltip class="!bg-[#3d444d]">添加文件</q-tooltip>
              </q-btn>
              <q-btn
                icon="play_arrow"
                @click="onSendFiles(scope.queuedFiles)"
                round
                dense
                :disable="inSending || !scope.queuedFiles.length || !online"
              >
                <q-tooltip class="!bg-[#3d444d]">开始传送</q-tooltip>
              </q-btn>
            </div>
          </template>

          <template v-slot:list="scope">
            <q-list separator>
              <q-item v-for="file in scope.files" :key="file.__key">
                <q-item-section>
                  <q-item-label class="ellipsis">
                    {{ file.name }}
                  </q-item-label>
                  <q-item-label caption
                    >大小：{{ file.__sizeLabel }}</q-item-label
                  >
                  <q-item-label caption>
                    状态:
                    <q-badge
                      :color="
                        file.fileStatus.status === sent ? 'green' : 'blue'
                      "
                      >{{ file.fileStatus.status }}</q-badge
                    >
                  </q-item-label>
                  <q-item-label
                    v-if="file.fileStatus.status === sending"
                    caption
                  >
                    进度:
                    {{ file.fileStatus.formatedProgress }}
                  </q-item-label>
                  <!-- <q-item-label
                  v-if="(file.fileStatus).status === receiving"
                  caption
                >
                  速度: {{ (file.fileStatus).speed }}
                </q-item-label> -->
                  <q-item-label caption>
                    用时: {{ file.fileStatus.time }}
                  </q-item-label>
                </q-item-section>

                <q-item-section top side>
                  <q-btn
                    dense
                    round
                    icon="close"
                    :disable="inSending"
                    @click="scope.removeFile(file)"
                  >
                    <q-tooltip>移除文件</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-uploader>

        <q-uploader draggable="false" class="mt-4 !w-full bg-transparent">
          <template v-slot:header>
            <div
              class="row no-wrap q-pa-sm q-gutter-xs items-center bg-[#0d1117]"
            >
              <q-btn
                icon="clear_all"
                @click="onClearReceivedFiles"
                round
                dense
                :disable="inReceving || !receivedFiles.length"
              >
                <q-tooltip class="!bg-[#3d444d]">清空所有文件</q-tooltip>
              </q-btn>
              <div class="col">
                <div class="q-uploader__title">接收到的文件</div>
              </div>
              <q-btn
                icon="cloud_download"
                @click="onDownloadAll"
                round
                dense
                :disable="inReceving || !receivedFiles.length"
              >
                <q-tooltip class="!bg-[#3d444d]">下载所有文件</q-tooltip>
              </q-btn>
            </div>
          </template>

          <template v-slot:list>
            <q-list separator>
              <q-item
                v-for="(
                  { name, formatSize, status, progress, blob, time }, index
                ) in receivedFiles"
                :key="index"
              >
                <q-item-section>
                  <q-item-label class="full-width ellipsis">
                    {{ name }}
                  </q-item-label>
                  <q-item-label caption>大小：{{ formatSize }}</q-item-label>
                  <q-item-label caption>
                    状态:
                    <q-badge :color="status === received ? 'green' : 'blue'">{{
                      status
                    }}</q-badge>
                  </q-item-label>
                  <q-item-label v-if="status === receiving" caption>
                    进度: {{ progress }}
                  </q-item-label>
                  <!-- <q-item-label v-if="file.status === receiving" caption>
                    速度: {{ file.speed }}
                  </q-item-label> -->
                  <q-item-label caption> 用时: {{ time }} </q-item-label>
                </q-item-section>

                <q-item-section top side>
                  <q-btn
                    v-if="status === received"
                    dense
                    round
                    icon="cloud_download"
                    @click="exportFile(name, blob)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-uploader>
      </div>

      <div v-else class="flex-center absolute bottom-0 flex w-full flex-col">
        <div class="flex items-center">
          <q-badge class="mr-2" rounded color="red" />{{
            otherLeaved ? '对方' : '你'
          }}已离开房间...
        </div>
        <q-btn
          class="full-width !mt-4"
          color="primary"
          :label="isRoomMode ? '重新进入房间' : '重新匹配'"
          rounded
          @click="isRoomMode ? onBackPIN() : onRematch()"
        ></q-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  useBye,
  useCancelMatch,
  useClosePC,
  useCreatePeerConnection,
  useDisconnect,
  useExtendFileStatus,
  useInitDataChannel,
  useInitRtc,
  useInitSocket,
  useLeaveFullRoom,
  useOtherJoin,
  useReceiveFile,
  useSendFile,
  useWatchPinCb,
  useLeaveRoom,
  useJoined,
  useBackPIN,
  useInitSocketForRoom,
  useRematchWithOffline,
  useBeforeUnmount,
  useMatched,
  useRematch,
  useMounted
} from '@/hooks'
import { exportFile } from 'quasar'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { received, receiving, sending, sent } from '@/const'

import type { Socket } from 'socket.io-client'
import type { receivedFiles } from '@/types'
import { storeToRefs } from 'pinia'
import { useRoomStore, useUserInfoStore } from '@/store'
import { updateLatestRoom, getLatestRoom, isExitRoom } from '@/apis/latest-room'

let timer = null
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
const { path, query } = useRoute()
const isRoomMode = path === '/room/file-transfer'
const router = useRouter()
const isReconnect = ref(false)
const { online, remoteRoomInfo, otherInfo } = storeToRefs(useRoomStore())
const { userInfo } = storeToRefs(useUserInfoStore())
const _userInfo = userInfo.value
const latestRoomInfo = (await getLatestRoom()).data
const latestId = latestRoomInfo?.latestId
latestId ? (remoteRoomInfo.value = latestRoomInfo) : null
const hasRemoteRoomId = Boolean(latestId)
const isExit = hasRemoteRoomId ? (await isExitRoom(latestId)).data : false
let _remoteRoomInfo = remoteRoomInfo.value
_remoteRoomInfo.inRoom = latestId && !isExit
_remoteRoomInfo.roomId = _remoteRoomInfo.roomId || (query.roomId as string)
const leaved = ref(isExit)
const otherLeaved = ref(isExit)
const isMatch = ref(path === '/match/file-transfer' && !_remoteRoomInfo.roomId)
const offline = ref(false)
const isFull = ref(false)
const pause = ref(false)

const onLeaveFullRoom = () => useLeaveFullRoom(leaved, isFull)

const onRematchWithOffline = () =>
  useRematchWithOffline(initSocket, onMatched, offline, 'file-transfer')

const onClearReceivedFiles = () => {
  receivedFiles.value = []
}

const onDownloadAll = () => {}

const onAdded = files => useExtendFileStatus(files)

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
  o.progress = '0 %'
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

// 当自己加入房间时触发
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

const onDisconnect = () =>
  useDisconnect(pc, isMatch, offline, leaved, isReconnect)

const onRtc = (roomId: string, data: any) =>
  useInitRtc(pc, socket, roomId, data, makingOffer, polite, _userInfo)

const onMatched = data =>
  useMatched(
    data,
    socket,
    path,
    _remoteRoomInfo,
    isMatch,
    router,
    pause,
    'file-transfer'
  )

const onLeave = async () => useLeaveRoom(socket, _remoteRoomInfo.roomId)

const onBackPIN = async () => useBackPIN(_exitRoom, router)

const onBye = () => useBye(exitRoom, otherLeaved)

const onRematch = () =>
  useRematch(_exitRoom, initSocket, onMatched, router, isMatch, 'file-transfer')

const _exitRoom = async () => {
  if (!_remoteRoomInfo.inRoom) {
    await exitRoom()
  }

  _remoteRoomInfo.roomId = _remoteRoomInfo.path = _remoteRoomInfo.latestId = ''
  _remoteRoomInfo.inRoom = false
  leaved.value = otherLeaved.value = false
}

const exitRoom = async () => {
  useClosePC(pc)
  socket.disconnect()
  await updateLatestRoom()
  leaved.value = true
  online.value = false
  otherInfo.value = null
}

const initSocket = () => {
  socket = useInitSocket(
    onJoined,
    onOtherJoin,
    onDisconnect,
    onRtc,
    isReconnect,
    _remoteRoomInfo.roomId,
    isFull,
    exitRoom
  )
  socket.on('bye', onBye)
  socket.on('file-metadata', onFileMetadata)
  socket.on('receive-file-metadata', onReceiveFileMetadata)
  socket.on('saved-file', onSavedFile)
  return socket
}

onMounted(async () => {
  useMounted(
    initSocket,
    onMatched,
    router,
    hasRemoteRoomId,
    path,
    _remoteRoomInfo,
    isMatch,
    'file-transfer'
  )
})

onBeforeUnmount(() => {
  useBeforeUnmount(socket)
})

const watchPinCb = (pin: string) => {
  useWatchPinCb('file-transfer', _remoteRoomInfo, pin, path, router)
  useInitSocketForRoom(initSocket, _remoteRoomInfo.roomId)
}

const onBack = () => useCancelMatch(isMatch.value, timer, router)
</script>
