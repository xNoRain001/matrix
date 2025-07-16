<template>
  <div class="flex-center flex h-screen">
    <UPinInput
      v-if="!roomId"
      size="xl"
      :length="pinLength"
      v-model="pin"
      type="number"
    />

    <div v-show="connected" class="flex-center flex flex-col">
      <div class="text-xl">
        {{ otherConnected ? '通话中...' : '等待对方接受邀请...' }}
      </div>
      <div class="flex-center mt-16 flex">
        <div v-if="!disableMic" class="flex-center relative flex flex-col">
          <q-btn
            round
            :class="micOpen ? 'bg-white' : '!bg-gray-900'"
            class="text-black"
            size="xl"
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
        <div class="flex-center ml-8 flex flex-col">
          <q-btn
            size="xl"
            icon="call_end"
            ref="leaveBtnRef"
            @click="onLeave"
            round
            class="!bg-red-400 text-black"
          ></q-btn>
          <q-btn label="取消" class="!mt-4"></q-btn>
        </div>
        <div
          v-if="!disableSpeaker"
          class="flex-center relative ml-8 flex flex-col"
        >
          <q-btn
            round
            :class="speakerOpen ? 'bg-white' : '!bg-gray-900'"
            class="group bg-white text-black"
            size="xl"
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
                  <q-icon :name="speakerLabel === item ? 'done' : ''"></q-icon>
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

    <audio hidden ref="localAudioRef" muted></audio>
    <audio hidden ref="remoteAudioRef" autoplay></audio>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { onMounted, reactive, ref, watch } from 'vue'

import type { Socket } from 'socket.io-client'

import {
  useAddMediaStreamToPC,
  useAddRoomID,
  useBack,
  useBindMediaStream,
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
  useNotify,
  usePauseMediaStreamTracks,
  useResumeMediaStreamTracks,
  useStartRTC
} from '@/hooks'

let makingOffer = false
let polite = true
let localMediaStream: MediaStream | null = null
let pc: RTCPeerConnection | null = null
let socket: Socket | null = null
const roomId = useRoute().query.roomId as string
const pinLength = 4
const pin = ref([])
const micLabel = ref('')
const micOptions = reactive([])
const speakerLabel = ref('')
const speakerOptions = reactive([])
const volume = ref(1)
const otherConnected = ref(false)
const localAudioRef = ref(null)
const remoteAudioRef = ref(null)
const leaveBtnRef = ref(null)
const connected = ref(false)
const micOpen = ref(true)
const speakerOpen = ref(true)
const disableMic = ref(false)
const disableSpeaker = ref(false)
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
  connected.value = true

  // 如果你是后面加入的，在这里初始化 pc
  if (!polite) {
    await initPC()
  }

  // 初始化完成后通知对方发起连接
  socket.emit('otherjoin', roomId)
}

// 当其他人加入房间时触发
const onOtherJoin = async roomId => {
  useNotify('对方加入了房间')
  // 可能你是第一个进入的，所以会收到别人进入房间的通知，此时你是有礼貌方
  // 也可能你本身是没礼貌方，但是对面后来退出了，又新进来一个，你此时需要变成礼貌方
  polite = true
  // pc 存在，说明对面退出后又新进来一个，此时需要重新创建 pc
  useClosePC(pc)
  await initPC()
  // useAddMediaStreamToPC(pc, localMediaStream)
  // 需要保持状态，因为可能是第二次创建 pc，需要重新绑定媒体流到 pc，此时的新本地流中
  // 的麦克风和扬声器的状态需要和旧的本地流状态统一
  updateMicStatus()
  updateSpeakerStatus()

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
  useCloseMediaStreamTracks(localMediaStream)
  useBack('/')
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
  // 这里不直接返回主页，因为最终会断开 socket 连接，那里会返回主页
  // 发送通知能够第一时间通知到对方我离开了，否则会有几秒钟延迟
  socket.emit('leave', roomId)
}

const initPC = async () => {
  pc = useCreatePeerConnection(socket, roomId, otherConnected, onTrack)
  await initLocalMediaStream()
}

const updateSpeakerLabel = (label: string) => (speakerLabel.value = label)

const updateSpeakerStatus = async (v?: undefined) => {
  if (v === undefined) {
    remoteAudioRef.value.volume = speakerOpen.value ? volume.value : 0
    return
  }

  const newValue = !speakerOpen.value
  remoteAudioRef.value.volume = newValue ? volume.value : 0
  speakerOpen.value = newValue
}

const updateMicLabel = label => (micLabel.value = label)

const updateMicStatus = async (v?: undefined) => {
  if (v === undefined) {
    micOpen.value
      ? useResumeMediaStreamTracks(localMediaStream)
      : usePauseMediaStreamTracks(localMediaStream)
    return
  }

  const newValue = !micOpen.value
  newValue
    ? useResumeMediaStreamTracks(localMediaStream)
    : usePauseMediaStreamTracks(localMediaStream)
  micOpen.value = newValue
}

const initLocalMediaStream = async () => {
  try {
    localMediaStream = await useGetUserMedia(constraints)
    // 绑定本地流
    useBindMediaStream(localAudioRef.value, localMediaStream)
    useAddMediaStreamToPC(pc, localMediaStream)
  } catch (err) {
    console.error(err)
    useNotify('未获取到用户设备', 'negative')
    micOpen.value = false
    disableMic.value = true
  }
}

const initSocket = () => {
  socket = useInitSocket(onJoined, onOtherJoin, onDisconnect, onRtc)
  socket.emit('join', roomId)
}

watch(pin, v => {
  if (v.length === pinLength) {
    useAddRoomID('audio-chat-', pin)
  }
})

watch(volume, v => (remoteAudioRef.value.volume = v))

onMounted(async () => {
  if (!roomId) {
    return
  }

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

  micLabel.value = audioInputLabelsLength
    ? (await useGetAudioInput()).label
    : '未发现麦克风设备'
  speakerLabel.value = audioOutputLabelsLength
    ? (await useGetAudioOutput()).label
    : '未发现扬声器设备'
  micOptions.push(
    ...(audioInputLabelsLength ? audioInputLabels : ['未发现麦克风设备'])
  )
  speakerOptions.push(
    ...(audioOutputLabelsLength ? audioOutputLabels : ['未发现扬声器设备'])
  )
  // micOpen.value = Boolean(audioInputLabelsLength)
  speakerOpen.value = Boolean(audioOutputLabelsLength)
  // disableMic.value = !audioInputLabelsLength
  disableSpeaker.value = !audioOutputLabelsLength

  watch(speakerLabel, v => {
    const { deviceId } = audioOutputs.find(item => item.label === v)
    remoteAudioRef.value.setSinkId(deviceId)
  })

  watch(micLabel, async v => {
    const { deviceId } = audioInputs.find(item => item.label === v)
    useCloseMediaStreamTracks(localMediaStream)
    localMediaStream = await useGetUserMedia({
      audio: { deviceId: { exact: deviceId } }
    })
    localAudioRef.value.srcObject = localMediaStream
  })

  initSocket()
})
</script>
