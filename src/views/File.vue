<template>
  <div class="flex-center flex h-[calc(100vh-32px)]">
    <UPinInput
      v-if="!roomId"
      size="xl"
      :length="pinLength"
      v-model="pin"
      type="number"
    />

    <div v-if="connected" class="flex-center flex w-[320px] flex-col">
      <q-uploader @added="onAdded" class="bg-transparent" multiple>
        <template v-slot:header="scope">
          <div
            class="row no-wrap q-pa-sm q-gutter-xs items-center bg-[#0d1117]"
          >
            <q-btn
              v-if="scope.queuedFiles.length > 0"
              icon="clear_all"
              @click="scope.removeQueuedFiles"
              round
              dense
              flat
              :disable="inSending"
            >
              <q-tooltip class="!bg-[#3d444d]">清空所有文件</q-tooltip>
            </q-btn>
            <div class="col">
              <div class="q-uploader__title">选择或拖拽需要上传的文件</div>
            </div>
            <q-btn
              v-if="scope.canAddFiles"
              icon="add_box"
              @click="scope.pickFiles"
              round
              dense
              flat
              :disable="inSending"
            >
              <q-uploader-add-trigger v-if="!inSending" />
              <q-tooltip class="!bg-[#3d444d]">添加文件</q-tooltip>
            </q-btn>
            <q-btn
              v-if="scope.canUpload"
              icon="play_arrow"
              @click="onSendFiles(scope.queuedFiles)"
              round
              dense
              flat
              :disable="!otherConnected"
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
                      (file.fileStatus as fileStatus).status === sent
                        ? 'green'
                        : 'blue'
                    "
                    >{{ (file.fileStatus as fileStatus).status }}</q-badge
                  >
                </q-item-label>
                <q-item-label
                  v-if="(file.fileStatus as fileStatus).status === sending"
                  caption
                >
                  进度: {{ (file.fileStatus as fileStatus).progress }}
                </q-item-label>
                <!-- <q-item-label
                  v-if="(file.fileStatus as fileStatus).status === receiving"
                  caption
                >
                  速度: {{ (file.fileStatus as fileStatus).speed }}
                </q-item-label> -->
                <q-item-label caption>
                  用时: {{ (file.fileStatus as fileStatus).time }}
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <q-btn
                  flat
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

      <q-list
        :bordered="Boolean(receivedFiles.length)"
        class="mt-4 w-full"
        separator
      >
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
              flat
              dense
              round
              icon="cloud_download"
              @click="onDownload(name, blob)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  useAddRoomID,
  useBack,
  useClosePC,
  useCreatePeerConnection,
  useInitDataChannel,
  useInitRtc,
  useInitSocket,
  useNotify,
  useStartRTC
} from '@/hooks'
import { exportFile } from 'quasar'
import { onMounted, reactive, ref, watch, type Reactive } from 'vue'
import { useRoute } from 'vue-router'

import type { Socket } from 'socket.io-client'

let makingOffer = false
let polite = true
let receivedSize = 0
let pc: RTCPeerConnection | null = null
let socket: Socket | null = null
let dataChannel: RTCDataChannel | null = null
// 发送时分割文件时的偏移
let offset = 0
// let lastSendTime = Number.MAX_SAFE_INTEGER
// let lastReceiveTime = Number.MAX_SAFE_INTEGER
// 对方是否收到了文件元信息的标识
let flag = false
let sendStartTime = 0
let receiveStartTime = 0
const inSending = ref(false)
const pending = '等待中...'
const sending = '传送中...'
const sent = '传送完成...'
const receiving = '接收中...'
const received = '接收完成...'
const receivedFiles = reactive<
  {
    name: string
    size: number
    type: string
    formatSize: string
    // speed: string
    progress: string
    status: '接收中...' | '接收完成...'
    blob: Blob
    time: string
  }[]
>([
  // {
  //   name: '1',
  //   size: 123,
  //   formatSize: '1 MB',
  //   speed: '1 MB/s',
  //   progress: '10 %',
  //   status: receiving
  // },
  // {
  //   name: '2',
  //   size: 123,
  //   formatSize: '1 MB',
  //   speed: '1 MB/s',
  //   progress: '10 %',
  //   status: receiving
  // }
])
const receivedBuffer: ArrayBuffer[] = []
const roomId = useRoute().query.roomId as string
const pinLength = 4
const pin = ref([])
const connected = ref(false)
const otherConnected = ref(false)

const onDownload = (name: string, blob: Blob) => exportFile(name, blob)

type fileStatus = Reactive<{
  // speed:string,
  status: '等待中...' | '传送中...' | '传送完成...'
  progress: string
  time: string
}>

const onAdded = files => {
  for (let i = 0, l = files.length; i < l; i++) {
    files[i].fileStatus = reactive({
      // speed: '0 Mb/s',
      status: pending,
      progress: '0 %',
      time: '0 s'
    })
  }
}

const onSendFiles = async files => {
  inSending.value = true

  for (let i = 0, l = files.length; i < l; i++) {
    sendStartTime = Date.now()
    const file = files[i]
    const { fileStatus }: { fileStatus: fileStatus } = files[i]
    fileStatus.status = sending
    const { name, size, type } = file

    // 向对方发送文件的信息
    // dataChannel.send(JSON.stringify({ name, size, type }))
    socket.emit('file-metadata', roomId, {
      name,
      size,
      type
    })

    await new Promise(resolve => {
      const timer = setInterval(() => {
        if (flag) {
          flag = false
          clearInterval(timer)
          resolve(null)
        }
      }, 1000)
    })

    // send() 方法发送数据时有大小限制，其上限是 maxMessageSize (256KB)
    const chunkSize = pc.sctp.maxMessageSize

    while (offset < size) {
      const buffer = await file.slice(offset, offset + chunkSize).arrayBuffer()

      // 默认最大缓冲区为 256KB，如果通过数据通道发送大于 256KB 的数据块，
      // 通常会引发 EMSGSIZE 错误，导致浏览器通道关闭。考虑到浏览器的兼容性，
      // 我们将缓存队列的水位线 bufferedAmount-LowThreshold 设置为 64KB
      if (dataChannel.bufferedAmount > 65535) {
        // 等待缓存队列降到阈值之下
        await new Promise(resolve => {
          dataChannel.onbufferedamountlow = () => {
            resolve(null)
          }
        })
      }

      // 继续发送
      dataChannel.send(buffer)
      offset += buffer.byteLength
      // const time = Date.now() - lastSendTime
      // lastSendTime = Date.now()
      // fileStatus.speed = `${(chunkSize / 1024 / (time / 1000)).toFixed(2)} MB/s`
      fileStatus.progress = `${((offset / size) * 100).toFixed(2)} %`
    }

    fileStatus.status = sent
    // fileStatus.speed = ''
    fileStatus.progress = ''
    offset = 0
    fileStatus.time = ((Date.now() - sendStartTime) / 1000).toFixed(2) + ' s'
    await new Promise(resolve => {
      const timer = setInterval(() => {
        if (flag) {
          flag = false
          clearInterval(timer)
          resolve(null)
        }
      }, 1000)
    })
  }
  inSending.value = false
}

const onReceiveData = ({ channel }: { channel: RTCDataChannel }) => {
  channel.onmessage = ({ data }: { data: ArrayBuffer }) => {
    const { byteLength } = data
    // 当前接收的文件
    const receivedFile = receivedFiles[receivedFiles.length - 1]
    const { size, type } = receivedFile
    receivedBuffer.push(data)
    receivedSize += byteLength
    // const time = Date.now() - lastReceiveTime
    // lastReceiveTime = Date.now()
    receivedFile.progress = ((receivedSize / size) * 100).toFixed(2) + ' %'
    // receivedFile.speed = `${(byteLength / 1024 / 1024 / (time / 1000)).toFixed(2)} MB/s`

    // 所有数据传输完成
    if (receivedSize === size) {
      receivedFile.time =
        ((Date.now() - receiveStartTime) / 1000).toFixed(2) + ' s'
      // 深拷贝，否则下载时会被回收
      const blob = new Blob([...receivedBuffer], { type })
      receivedFile.blob = blob
      receivedFile.status = received
      receivedBuffer.length = 0
      receivedSize = 0
      socket.emit('saved-file', roomId, null)
    }
  }
}

const onFileMetadata = async (roomId: string, data: any) => {
  receiveStartTime = Date.now()
  const o = { ...data }
  o.status = receiving
  o.formatSize = (data.size / 1024 / 1024).toFixed(2) + 'MB'
  o.progress = '0 %'
  o.time = '0 s'
  // o.speed = '0 MB/s'
  receivedFiles.push(o)
  socket.emit('receive-file-metadata', roomId, null)
}

const onReceiveFileMetadata = () => (flag = true)

const onSavedFile = () => (flag = true)

const initPC = () => {
  pc = useCreatePeerConnection(socket, roomId, otherConnected, () => {})
  pc.ondatachannel = onReceiveData
  dataChannel = useInitDataChannel(pc)
}

// 当自己加入房间时触发
const onJoined = async (_, __, _polite) => {
  polite = _polite
  connected.value = true

  if (!polite) {
    initPC()
  }

  socket.emit('otherjoin', roomId)
}

// 当其他人加入房间时触发
const onOtherJoin = async (_, __) => {
  useNotify('对方加入了房间')
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
  useBack('/file')
}

const onRtc = (roomId: string, data: any) =>
  useInitRtc(pc, socket, roomId, data, makingOffer, polite)

const initSocket = () => {
  socket = useInitSocket(onJoined, onOtherJoin, onDisconnect, onRtc)
  socket.on('file-metadata', onFileMetadata)
  socket.on('receive-file-metadata', onReceiveFileMetadata)
  socket.on('saved-file', onSavedFile)
  socket.emit('join', roomId)
}

onMounted(() => {
  if (!roomId) {
    return
  }

  initSocket()
})

watch(pin, v => {
  if (v.length === pinLength) {
    useAddRoomID('file-', pin)
  }
})
</script>
