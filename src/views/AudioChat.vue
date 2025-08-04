<template>
  <PIN
    v-if="!(remoteRoomInfo.roomId || isMatch)"
    type="audio-chat"
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
          :label="isRoomMode ? '重新进入房间' : '重新匹配'"
          rounded
          @click="isRoomMode ? onBackPIN() : onRematch()"
        ></q-btn>
      </div>
    </div>

    <audio hidden ref="localAudioRef" muted></audio>
    <audio hidden ref="remoteAudioRef" autoplay></audio>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import type { Socket } from 'socket.io-client'

import {
  useAddMediaStreamToPC,
  useBindMediaStream,
  useBye,
  useCancelMatch,
  useCloseMediaStreamTracks,
  useClosePC,
  useCreatePeerConnection,
  useGetAudioInput,
  useGetAudioInputs,
  useGetAudioOutput,
  useGetAudioOutputs,
  useGetUserMedia,
  useInitRtc,
  useInitSocket,
  useLeaveFullRoom,
  useNotify,
  useOtherJoin,
  usePauseMediaStreamTracks,
  useResumeMediaStreamTracks,
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
import { storeToRefs } from 'pinia'
import { useRoomStore, useUserInfoStore } from '@/store'
import { updateLatestRoom, getLatestRoom, isExitRoom } from '@/apis/latest-room'

let timer = null
const makingOffer = ref(false)
const polite = ref(true)
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
const { path, query } = useRoute()
const isRoomMode = path === '/room/audio-chat'
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
const isMatch = ref(path === '/match/audio-chat' && !_remoteRoomInfo.roomId)
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
const offline = ref(false)
const isFull = ref(false)
const pause = ref(false)

const onLeaveFullRoom = () => useLeaveFullRoom(leaved, isFull)

const onRematchWithOffline = () =>
  useRematchWithOffline(initSocket, onMatched, offline, 'audio-chat')

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

// const onDisconnect = () => useDisconnect(pc, isMatch, offline, leaved, isReconnect)

const onDisconnect = () => {
  // 满员的情况下，不会触发 joined，此时 pc 为 null
  useClosePC(pc)

  if (isMatch.value) {
    offline.value = true
    return
  }

  // 关闭本地媒体
  if (localMediaStream) {
    useCloseMediaStreamTracks(localMediaStream)
  }

  if (!leaved.value) {
    isReconnect.value = true
  }
}

const onRtc = (roomId: string, data: any) =>
  useInitRtc(pc, socket, roomId, data, makingOffer, polite, _userInfo)

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
const onLeave = async () => useLeaveRoom(socket, _remoteRoomInfo.roomId)

const onMatched = data =>
  useMatched(
    data,
    socket,
    path,
    _remoteRoomInfo,
    isMatch,
    router,
    pause,
    'audio-chat'
  )

const onBackPIN = async () => useBackPIN(_exitRoom, router)

const onBye = () => useBye(exitRoom, otherLeaved)

const onRematch = () =>
  useRematch(_exitRoom, initSocket, onMatched, router, isMatch, 'audio-chat')

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

  if (localMediaStream) {
    useCloseMediaStreamTracks(localMediaStream)
  }

  socket.disconnect()
  await updateLatestRoom()
  leaved.value = true
  online.value = false
  otherInfo.value = null
}

const initPC = async () => {
  pc = useCreatePeerConnection(
    isRoomMode ? '/room/audio-chat' : '/match/audio-chat',
    socket,
    _remoteRoomInfo,
    online,
    onTrack
  )
  await initLocalMediaStream()
  return pc
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
    _remoteRoomInfo.roomId,
    isFull,
    exitRoom
  )
  socket.on('bye', onBye)
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
    'audio-chat'
  )
})

onBeforeUnmount(() => {
  useBeforeUnmount(socket)
})

const watchPinCb = (pin: string) => {
  useWatchPinCb('audio-chat', _remoteRoomInfo, pin, path, router)
  useInitSocketForRoom(initSocket, _remoteRoomInfo.roomId)
}

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

const onBack = () => useCancelMatch(isMatch.value, timer, router)
</script>
