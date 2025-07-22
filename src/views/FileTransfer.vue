<template>
  <div
    v-if="!(roomId || remoteRoomInfo.roomId || isMatch)"
    class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-end"
  >
    <UPinInput size="xl" :length="pinLength" v-model="pin" />
    <q-breadcrumbs class="text-primary mt-4 cursor-pointer">
      <q-breadcrumbs-el
        label="去匹配"
        icon="near_me"
        @click="router.push('/match/chat')"
      >
      </q-breadcrumbs-el>
    </q-breadcrumbs>
  </div>

  <div
    v-if="!(roomId || remoteRoomInfo.roomId)"
    class="absolute top-4 left-4 flex flex-col"
  >
    <q-breadcrumbs class="text-primary mt-4 cursor-pointer">
      <q-breadcrumbs-el
        label="返回"
        icon="arrow_back_ios_new"
        @click="useCancelMatch(isMatch, timer, router)"
      >
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

  <div class="flex-center flex">
    <div
      v-if="joined"
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
          :label="
            path.startsWith('/room/file-transfer') ? '重新进入房间' : '重新匹配'
          "
          rounded
          @click="
            path.startsWith('/room/file-transfer')
              ? onBackRoomPIN()
              : onRematch()
          "
        ></q-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  useCancelMatch,
  useClearRoomInfo,
  useClosePC,
  useCreatePeerConnection,
  useDialog,
  useExtendFileStatus,
  useInitDataChannel,
  useInitRtc,
  useInitSocket,
  useNotify,
  useReceiveFile,
  useSaveRoomInfo,
  useSendFile,
  useStartRTC
} from '@/hooks'
import { exportFile } from 'quasar'
import { onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { received, receiving, sending, sent } from '@/const'

import type { Socket } from 'socket.io-client'
import type { receivedFiles } from '@/types'
import { storeToRefs } from 'pinia'
import { useRoomStore } from '@/store'

let timer = null
let makingOffer = false
let polite = true
let pc: RTCPeerConnection | null = null
let socket: Socket | null = null
let dataChannel: RTCDataChannel | null = null
const receiveStartTime = ref(0)
// 对方是否收到了文件元信息的标识
const flag = ref(false)
const inSending = ref(false)
const inReceving = ref(false)
const receivedFiles: receivedFiles = ref([])
const pinLength = 4
const pin = ref([])
const route = useRoute()
const { query } = useRoute()
const { path } = toRefs(route)
const router = useRouter()
const isReconnect = ref(false)
const leaved = ref(false)
const otherLeaved = ref(false)
const { online, remoteRoomInfo } = storeToRefs(useRoomStore())
const _remoteRoomInfo = remoteRoomInfo.value
let roomId = _remoteRoomInfo.roomId || (query.roomId as string)
const isMatch = ref(path.value === '/match/file-transfer' && !roomId)
const joined = ref(false)

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
      roomId,
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
      roomId,
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
  pc = useCreatePeerConnection(socket, roomId, online, () => {})
  pc.ondatachannel = onReceiveFile
  dataChannel = useInitDataChannel(pc)
}

// 当自己加入房间时触发
const onJoined = async (_, __, _polite) => {
  polite = _polite
  joined.value = true

  if (!polite) {
    initPC()
    socket.emit('otherjoin', roomId)
  }
}

// 当其他人加入房间时触发
const onOtherJoin = async (_, __) => {
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
    const _path = path.value
    _remoteRoomInfo.roomId = roomId = message
    _remoteRoomInfo.path = _path
    // 记录房间号
    useSaveRoomInfo(_path, message)
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
    leaved.value = true
    socket.emit('leave', roomId)
  })
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
  useClosePC(pc)
  socket.disconnect()
  useClearRoomInfo()
  _remoteRoomInfo.roomId = _remoteRoomInfo.path = roomId = ''
  leaved.value = joined.value = false
}

const initSocketForRoom = () => {
  initSocket()
  socket.emit('join', roomId)
}

const initSocketForMatch = () => {
  initSocket()
  socket.on('matched', onMatched)
  socket.emit('joinmatch', 'file-transfer')
  socket.emit('match', 'file-transfer')
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
  socket.on('bye', onBye)
  socket.on('file-metadata', onFileMetadata)
  socket.on('receive-file-metadata', onReceiveFileMetadata)
  socket.on('saved-file', onSavedFile)
}

const replaceQuery = (query, pathname?: string) =>
  router.replace({ path: pathname ? pathname : path.value, query })

onMounted(async () => {
  if (roomId) {
    const _path = path.value

    if (!_remoteRoomInfo.roomId) {
      _remoteRoomInfo.roomId = roomId
      _remoteRoomInfo.path = _path
      useSaveRoomInfo(_path, roomId)
    } else {
      if (_remoteRoomInfo.path === _path) {
        await replaceQuery({ roomId })
      } else {
        await replaceQuery({ roomId }, _remoteRoomInfo.path)
        return
      }
    }

    initSocketForRoom()
  } else if (isMatch.value) {
    initSocketForMatch()
  }
})

onBeforeUnmount(() => socket && socket.disconnect())

watch(pin, async v => {
  if (v.length === pinLength) {
    const _path = path.value
    _remoteRoomInfo.roomId = roomId = 'file-transfer' + v.join('')
    _remoteRoomInfo.path = _path
    useSaveRoomInfo(_path, roomId)
    replaceQuery({ roomId })
    initSocketForRoom()
  }
})
</script>
