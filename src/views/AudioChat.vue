<template>
  <div
    v-if="!(roomId || remoteroomId || isMatch)"
    class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-end"
  >
    <UPinInput size="xl" :length="pinLength" v-model="pin" />
    <q-breadcrumbs class="text-primary mt-4 cursor-pointer">
      <q-breadcrumbs-el
        label="去匹配"
        icon="near_me"
        @click="router.push('/match/audio-chat')"
      >
      </q-breadcrumbs-el>
    </q-breadcrumbs>
  </div>

  <div
    v-if="!(roomId || remoteroomId)"
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
      <div v-if="!leaved" class="flex-center flex h-full flex-col">
        <div class="text-base">
          {{ online ? '通话中...' : '等待对方接通...' }}
        </div>
        <div
          :class="
            hasMic && hasSpeaker
              ? 'grid-cols-1'
              : hasMic || hasSpeaker
                ? 'grid-cols-2'
                : 'grid-cols-3'
          "
          class="mt-16 grid"
        >
          <div v-if="!hasMic" class="flex-center relative flex flex-col">
            <q-btn
              round
              :class="micOpen ? 'bg-white' : '!bg-gray-900'"
              class="text-black"
              size="lg"
              :icon="micOpen ? 'mic' : 'mic_off'"
              @click="updateMicStatus"
            ></q-btn>
            <q-btn-dropdown
              class="!mt-4"
              :label="`麦克风已${micOpen ? '开' : '关'}`"
            >
              <q-list>
                <q-item
                  v-for="(item, index) in micOptions"
                  clickable
                  v-close-popup
                  @click="updateMicLabel(item)"
                  :key="index"
                  :disable="!micOpen"
                >
                  <q-item-section avatar>
                    <q-icon :name="micLabel === item ? 'done' : ''"></q-icon>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ item }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
          <div class="flex-center flex flex-col">
            <q-btn
              size="lg"
              icon="call_end"
              ref="leaveBtnRef"
              @click="onLeave"
              round
              class="!bg-red-400 text-black"
            ></q-btn>
            <q-btn label="取消" class="!mt-4"></q-btn>
          </div>
          <div v-if="!hasSpeaker" class="flex-center relative flex flex-col">
            <q-btn
              round
              :class="speakerOpen ? 'bg-white' : '!bg-gray-900'"
              class="group bg-white text-black"
              size="lg"
              :icon="speakerOpen ? 'volume_up' : 'volume_off'"
              @click="updateSpeakerStatus"
            >
            </q-btn>
            <q-btn-dropdown
              class="!mt-4"
              :label="`扬声器已${speakerOpen ? '开' : '关'}`"
            >
              <q-list>
                <q-item
                  v-for="(item, index) in speakerOptions"
                  clickable
                  v-close-popup
                  @click="updateSpeakerLabel(item)"
                  :key="index"
                  :disable="!speakerOpen"
                >
                  <q-item-section avatar>
                    <q-icon
                      :name="speakerLabel === item ? 'done' : ''"
                    ></q-icon>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ item }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-slider
              :disable="!speakerOpen"
              class="absolute -bottom-6 px-4"
              v-model="volume"
              :min="0"
              :max="1"
              :step="0.1"
              label
            />
          </div>
        </div>
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
            path.startsWith('/room/audio-chat') ? '重新进入房间' : '重新匹配'
          "
          rounded
          @click="
            path.startsWith('/room/audio-chat') ? onBackRoomPIN() : onRematch()
          "
        ></q-btn>
      </div>
    </div>

    <audio hidden ref="localAudioRef" muted></audio>
    <audio hidden ref="remoteAudioRef" autoplay></audio>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { onBeforeUnmount, onMounted, reactive, ref, toRefs, watch } from 'vue'

import type { Socket } from 'socket.io-client'

import {
  useAddMediaStreamToPC,
  useBindMediaStream,
  useCancelMatch,
  useClearRoomId,
  useCloseMediaStreamTracks,
  useClosePC,
  useCreatePeerConnection,
  useDialog,
  useGetAudioInput,
  useGetAudioInputs,
  useGetAudioOutput,
  useGetAudioOutputs,
  useGetUserMedia,
  useInitRtc,
  useInitSocket,
  useNotify,
  usePauseMediaStreamTracks,
  useResumeMediaStreamTracks,
  useSaveRoomId,
  useStartRTC
} from '@/hooks'
import { storeToRefs } from 'pinia'
import { useRoomStore } from '@/store'

let timer = null
let makingOffer = false
let polite = true
let localMediaStream: MediaStream | null = null
let pc: RTCPeerConnection | null = null
let socket: Socket | null = null
const audioInputs = await useGetAudioInputs()
const audioInputLabels = audioInputs.map(
  (item, index) => item.label || `麦克风设备 ${index}`
)
const audioOutputs = await useGetAudioOutputs()
const audioOutputLabels = audioOutputs.map(
  (item, index) => item.label || `扬声器设备 ${index}`
)
const audioInputLabelsLength = audioInputLabels.length
const audioOutputLabelsLength = audioOutputLabels.length
const pinLength = 4
const pin = ref([])
const micLabel = ref(
  audioInputLabelsLength ? (await useGetAudioInput()).label : '未发现麦克风设备'
)
const micOptions = reactive([
  ...(audioInputLabelsLength ? audioInputLabels : ['未发现麦克风设备'])
])
const speakerLabel = ref(
  audioOutputLabelsLength
    ? (await useGetAudioOutput()).label
    : '未发现扬声器设备'
)
const speakerOptions = reactive([
  ...(audioOutputLabelsLength ? audioOutputLabels : ['未发现扬声器设备'])
])
const volume = ref(1)
const localAudioRef = ref(null)
const remoteAudioRef = ref(null)
const leaveBtnRef = ref(null)
const route = useRoute()
const { query } = useRoute()
const { path } = toRefs(route)
const router = useRouter()
const isReconnect = ref(false)
const leaved = ref(false)
const { online, remoteroomId } = storeToRefs(useRoomStore())
let roomId = remoteroomId.value || (query.roomId as string)
const isMatch = ref(path.value === '/match/audio-chat' && !roomId)
const joined = ref(false)
const otherLeaved = ref(false)
const micOpen = ref(Boolean(audioInputLabelsLength))
const speakerOpen = ref(Boolean(audioOutputLabelsLength))
const hasMic = ref(!audioInputLabelsLength)
const hasSpeaker = ref(!audioOutputLabelsLength)
const constraints = {
  video: false,
  audio: {
    echoCancellation: true, // 回声消除
    noiseSuppression: true, // 降噪
    autoGainControl: true // 自动增益
  }
}

// 当自己加入房间时触发
const onJoined = async (_, __, _polite) => {
  polite = _polite
  joined.value = true

  // 如果你是后面加入的，在这里初始化 pc
  if (!polite) {
    await initPC()
    // 初始化完成后通知对方发起连接
    socket.emit('otherjoin', roomId)
  }
}

// 当其他人加入房间时触发
const onOtherJoin = async roomId => {
  // 可能你是第一个进入的，所以会收到别人进入房间的通知，此时你是有礼貌方
  // 也可能你本身是没礼貌方，但是对面后来退出了，又新进来一个，你此时需要变成礼貌方
  polite = true
  // pc 存在，说明对面退出后又新进来一个，此时需要重新创建 pc
  useClosePC(pc)
  await initPC()

  try {
    makingOffer = true
    await useStartRTC(pc, socket, roomId)
  } catch (err) {
    console.error(err)
  }

  makingOffer = false
}

const onDisconnect = () => {
  // 满员的情况下，不会触发 joined，此时 pc 为 null
  useClosePC(pc)

  // 关闭本地媒体
  if (localMediaStream) {
    useCloseMediaStreamTracks(localMediaStream)
  }

  if (!leaved.value) {
    isReconnect.value = true
  }
}

const onRtc = (roomId: string, data: any) =>
  useInitRtc(pc, socket, roomId, data, makingOffer, polite)

const onTrack = ({ track, streams }) => {
  const remoteAudio = remoteAudioRef.value

  // 轨道一旦开始接收数据包，就会取消静音
  track.onunmute = () => {
    const remoteMediaStream = remoteAudio.srcObject

    // 清空以前绑定的远程媒体流
    if (remoteMediaStream) {
      useCloseMediaStreamTracks(remoteMediaStream)
    }

    useBindMediaStream(remoteAudio, streams[0])
  }
}

// 服务端中会关闭连接，从而触发 disconnect
const onLeave = () => {
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
    // 服务器 leave 回调中发送 bye，然后触发本地 leaved
    leaved.value = true
    // 这里不直接返回主页，因为最终会断开 socket 连接，那里会返回主页
    // 发送通知能够第一时间通知到对方我离开了，否则会有几秒钟延迟
    socket.emit('leave', roomId)
  })
}

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
    remoteroomId.value = roomId = message
    // 记录房间号
    useSaveRoomId(message)
    replaceQuery({ roomId })
    isMatch.value = false
    socket.emit('join', roomId)
    useNotify('匹配成功')
  }
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

  if (localMediaStream) {
    useCloseMediaStreamTracks(localMediaStream)
  }

  socket.disconnect()
  useClearRoomId()
  remoteroomId.value = roomId = ''
  leaved.value = joined.value = false
}

const initSocketForRoom = () => {
  initSocket()
  socket.emit('join', roomId)
}

const initSocketForMatch = () => {
  initSocket()
  socket.on('matched', onMatched)
  socket.emit('joinmatch')
  socket.emit('match')
}

const initPC = async () => {
  pc = useCreatePeerConnection(socket, roomId, online, onTrack)
  await initLocalMediaStream()
}

const updateSpeakerLabel = (label: string) => (speakerLabel.value = label)

const keepSpeakerStatus = () => {
  if (hasSpeaker.value) {
    return
  }

  remoteAudioRef.value.volume = speakerOpen.value ? volume.value : 0
}

const updateSpeakerStatus = async () => {
  const newValue = !speakerOpen.value
  remoteAudioRef.value.volume = newValue ? volume.value : 0
  speakerOpen.value = newValue
}

const updateMicLabel = label => (micLabel.value = label)

const keepMirStatus = () => {
  if (hasMic.value) {
    return
  }

  micOpen.value
    ? useResumeMediaStreamTracks(localMediaStream)
    : usePauseMediaStreamTracks(localMediaStream)
}

const updateMicStatus = async () => {
  const newValue = !micOpen.value

  // 最先加入房间的人会比后加入的更晚完成 pc 初始化
  // 在没初始化之前用户可能点击关闭麦克风，此时是没有媒体流的
  if (localMediaStream) {
    newValue
      ? useResumeMediaStreamTracks(localMediaStream)
      : usePauseMediaStreamTracks(localMediaStream)
  }

  micOpen.value = newValue
}

const initLocalMediaStream = async () => {
  try {
    localMediaStream = await useGetUserMedia(constraints)
    // 最先加入房间的人会比后加入的更晚完成 pc 初始化
    // 在没初始化之前用户可能点击关闭麦克风，初始化完成时需要更新媒体流状态
    // 也可能是第二次创建 pc，需要重新绑定媒体流到 pc，此时的新本地流中
    // 的麦克风和扬声器的状态需要和旧的本地流状态统一
    keepMirStatus()
    keepSpeakerStatus()
    // 绑定本地流
    useBindMediaStream(localAudioRef.value, localMediaStream)
    useAddMediaStreamToPC(pc, localMediaStream)
  } catch (err) {
    console.error(err)
    useNotify('未获取到用户设备', 'negative')
    micOpen.value = false
    hasMic.value = true
  }
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
}

const replaceQuery = query => router.replace({ path: path.value, query })

onMounted(async () => {
  if (roomId) {
    replaceQuery({ roomId })
    initSocketForRoom()

    if (!remoteroomId.value) {
      remoteroomId.value = roomId
      useSaveRoomId(roomId)
    }
  } else if (isMatch.value) {
    initSocketForMatch()
  }
})

onBeforeUnmount(() => socket && socket.disconnect())

watch(pin, v => {
  if (v.length === pinLength) {
    remoteroomId.value = roomId = 'audio-chat-' + v.join('')
    useSaveRoomId(roomId)
    replaceQuery({ roomId })
    initSocketForRoom()
  }
})

watch(volume, v => (remoteAudioRef.value.volume = v))

watch(speakerLabel, v => {
  const { deviceId } = audioOutputs.find(item => item.label === v)
  remoteAudioRef.value.setSinkId(deviceId)
})

watch(micLabel, async v => {
  const { deviceId } = audioInputs.find(item => item.label === v)

  if (localMediaStream) {
    useCloseMediaStreamTracks(localMediaStream)
  }

  localMediaStream = await useGetUserMedia({
    audio: { deviceId: { exact: deviceId } }
  })
  localAudioRef.value.srcObject = localMediaStream
})
</script>
