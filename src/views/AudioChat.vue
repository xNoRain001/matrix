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
      <RoomHeader
        :online="online"
        :leaved="leaved"
        :on-click="onLeave"
      ></RoomHeader>
    </template>
    <template #body>
      <div
        v-if="!leaved"
        ref="bodyRef"
        class="relative flex h-full items-center justify-center"
      >
        <div class="absolute top-0 right-0">
          <UDropdownMenu
            v-if="audioInputLabelsLength"
            :disabled="!micOpen"
            :items="_micOptions"
            :ui="{
              content: 'w-80'
            }"
          >
            <UButton icon="lucide:mic" color="neutral" variant="ghost" />
            <template #item="{ item: { label } }">
              <div
                class="flex w-full justify-between"
                @click="updateMicLabel(label)"
              >
                <div>{{ label }}</div>
                <UIcon
                  v-if="micLabel === label"
                  name="lucide:circle-check-big"
                  class="text-primary size-5"
                />
              </div>
            </template>
          </UDropdownMenu>
          <UDropdownMenu
            v-if="audioOutputLabelsLength"
            :disabled="!speakerOpen"
            :items="_speakerOptions"
            :ui="{
              content: 'w-80'
            }"
          >
            <UButton icon="lucide:volume-2" color="neutral" variant="ghost" />
            <template #item="{ item: { label } }">
              <div
                class="flex w-full justify-between"
                @click="updateSpeakerLabel(label)"
              >
                <div>{{ label }}</div>
                <UIcon
                  v-if="speakerLabel === label"
                  name="lucide:circle-check-big"
                  class="text-primary size-5"
                />
              </div>
            </template>
          </UDropdownMenu>
        </div>
        <div
          class="flex h-full w-full max-w-(--room-width) flex-col justify-center"
        >
          <div class="text-center">
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
            <div
              v-if="!hasMic"
              class="flex flex-col items-center justify-center"
            >
              <UButton
                class="flex flex-col"
                @click="updateMicStatus"
                :icon="micOpen ? 'lucide:mic' : 'lucide:mic-off'"
                variant="ghost"
                :color="micOpen ? 'neutral' : 'info'"
                :ui="{ label: 'mt-4', leadingIcon: 'size-10' }"
              ></UButton>
              <div class="mt-4 flex items-center">
                <div class="text-sm">{{ micOpen ? '开启' : '关闭' }}</div>
              </div>
            </div>
            <div class="flex flex-col items-center justify-center">
              <UButton
                class="flex flex-col"
                icon="lucide:phone-off"
                @click="onCancel"
                variant="ghost"
                color="error"
                :ui="{ label: 'mt-4', leadingIcon: 'size-10' }"
              ></UButton>
              <div class="text-error mt-4 text-sm">取消</div>
            </div>
            <div
              v-if="!hasSpeaker"
              class="flex flex-col items-center justify-center"
            >
              <UButton
                class="flex flex-col"
                :icon="speakerOpen ? 'lucide:volume-2' : 'lucide:volume-off'"
                @click="updateSpeakerStatus"
                variant="ghost"
                :color="speakerOpen ? 'neutral' : 'info'"
                :ui="{ label: 'mt-4', leadingIcon: 'size-10' }"
              ></UButton>
              <div class="mt-4 text-sm">
                {{ speakerOpen ? '开启' : '关闭' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer v-if="leaved">
      <div class="flex w-full justify-center">
        <RoomLeave :is-match="isMatch" :simple-leave="simpleLeave"></RoomLeave>
      </div>
    </template>
  </UModal>

  <audio hidden ref="localAudioRef" muted></audio>
  <audio hidden ref="remoteAudioRef" autoplay></audio>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
  watch
} from 'vue'

import type { Socket } from 'socket.io-client'

import {
  useAddMediaStreamToPC,
  useBindMediaStream,
  useBye,
  useCloseMediaStreamTracks,
  useClosePC,
  useCreatePeerConnection,
  useGetAudioInputs,
  useGetAudioOutputs,
  useGetUserMedia,
  useInitRtc,
  useInitSocket,
  useOtherJoin,
  usePauseMediaStreamTracks,
  useResumeMediaStreamTracks,
  useJoined,
  useBeforeUnmount,
  useMounted,
  useLeave,
  useRefreshRoomInfo,
  useVisibilityChange,
  useNoop
} from '@/hooks'

import { storeToRefs } from 'pinia'
import { useRoomStore, useUserInfoStore } from '@/store'
import { updateLatestRoom } from '@/apis/latest-room'

const oepnModal = ref(true)
const makingOffer = ref(false)
const polite = ref(true)
let cancelVisibilityChangeHandler = useNoop
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
  audioInputLabelsLength ? audioInputLabels[0] : '未发现麦克风设备'
)
const micOptions = [
  ...(audioInputLabelsLength ? audioInputLabels : ['未发现麦克风设备'])
]
const _micOptions = micOptions.map(item => ({ label: item, icon: '' }))
const speakerLabel = ref(
  audioOutputLabelsLength ? audioOutputLabels[0] : '未发现扬声器设备'
)
const speakerOptions = reactive([
  ...(audioOutputLabelsLength ? audioOutputLabels : ['未发现扬声器设备'])
])
const _speakerOptions = speakerOptions.map(item => ({ label: item, icon: '' }))
const volume = ref(1)
const localAudioRef = ref(null)
const remoteAudioRef = ref(null)
const {
  path,
  query: { roomId }
} = useRoute()
const router = useRouter()
const online = ref(false)
const {
  isMatch,
  remoteRoomInfo,
  otherInfo,
  firstRequestRemoteRoomInfo,
  getOnlineWhenReconnection
} = storeToRefs(useRoomStore())
const { userInfo } = storeToRefs(useUserInfoStore())
const _userInfo = userInfo.value
const leaved = ref(false)
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
const isFull = ref(false)
const toast = useToast()
const showOfflineModal = ref(false)
const loading = ref(false)
const bodyRef = useTemplateRef('bodyRef')
const closeBtn = computed(
  // @ts-ignore
  () => bodyRef.value.parentNode.previousSibling.children[0].children[1]
)

const onCancel = () => closeBtn.value.click()

const initPC = async () => {
  pc = useCreatePeerConnection(
    '/audio-chat',
    socket,
    remoteRoomInfo.value,
    online,
    onTrack
  )
  await initLocalMediaStream()
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

// const onDisconnect = () => useDisconnect(pc)

const onDisconnect = () => {
  // 满员的情况下，不会触发 joined，此时 pc 为 null
  useClosePC(pc)

  // 关闭本地媒体
  if (localMediaStream) {
    useCloseMediaStreamTracks(localMediaStream)
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
  useClosePC(pc)
  socket && socket.disconnect()
}

const leaveAfterConnected = async () => {
  closePCAndSocket()
  await updateLatestRoom()
  leaved.value = true
  online.value = false
  otherInfo.value = null
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
    // TODO: 麦克风和扬声器状态保存到本地，刷新页面后能够恢复到之前的状态
    keepMirStatus()
    keepSpeakerStatus()
    // 绑定本地流
    useBindMediaStream(localAudioRef.value, localMediaStream)
    useAddMediaStreamToPC(pc, localMediaStream)
  } catch (err) {
    console.error(err)
    console.log('未获取到用户设备')
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
    onBye,
    remoteRoomInfo,
    isFull,
    showOfflineModal,
    loading,
    getOnlineWhenReconnection,
    toast
  )
  socket.on('bye', onBye)

  return socket
}

onMounted(async () => {
  await useMounted(
    router,
    path,
    remoteRoomInfo,
    roomId as string,
    leaved,
    firstRequestRemoteRoomInfo,
    initSocket,
    toast
  )
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
  useBeforeUnmount(socket)
  cancelVisibilityChangeHandler()
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
