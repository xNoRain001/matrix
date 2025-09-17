<template>
  <div class="relative flex h-full items-center justify-center">
    <div class="absolute top-0 right-0">
      <UDropdownMenu
        v-if="audioInputLabelsLength"
        :disabled="!isMicOpen"
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
        :disabled="!isSpeakerOpen"
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
    <div class="flex w-full flex-col justify-center">
      <div class="text-center">
        {{ rtcConnected ? '通话中...' : '等待对方接通...' }}
      </div>
      <div
        :class="
          noMic && noSpeaker
            ? 'grid-cols-1'
            : noMic || noSpeaker
              ? 'grid-cols-2'
              : 'grid-cols-3'
        "
        class="mt-16 grid"
      >
        <div v-if="!noMic" class="flex flex-col items-center justify-center">
          <UButton
            class="flex flex-col"
            @click="updateMicStatus"
            :icon="isMicOpen ? 'lucide:mic' : 'lucide:mic-off'"
            variant="ghost"
            :color="isMicOpen ? 'neutral' : 'info'"
            :ui="{ label: 'mt-4', leadingIcon: 'size-10' }"
          ></UButton>
          <div class="mt-4 flex items-center">
            <div class="text-sm">{{ isMicOpen ? '开启' : '关闭' }}</div>
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
          v-if="!noSpeaker"
          class="flex flex-col items-center justify-center"
        >
          <UButton
            class="flex flex-col"
            :icon="isSpeakerOpen ? 'lucide:volume-2' : 'lucide:volume-off'"
            @click="updateSpeakerStatus"
            variant="ghost"
            :color="isSpeakerOpen ? 'neutral' : 'info'"
            :ui="{ label: 'mt-4', leadingIcon: 'size-10' }"
          ></UButton>
          <div class="mt-4 text-sm">
            {{ isSpeakerOpen ? '开启' : '关闭' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  useCloseMediaStreamTracks,
  useGetAudioInputs,
  useGetAudioOutputs,
  useGetTargetIdByRoomId,
  useGetUserMedia,
  usePauseMediaStreamTracks,
  useResumeMediaStreamTracks,
  useSendMsg
} from '@/hooks'
import { storeToRefs } from 'pinia'
import {
  useMatchStore,
  useRecentContactsStore,
  useUserStore,
  useWebRTCStore
} from '@/store'
import { useRoute, useRouter } from 'vue-router'

const {
  roomId,
  isVoiceChatModalOpen,
  rtcConnected,
  leaveRoomTimer,
  isVoiceChatMatch,
  localAudioRef,
  remoteAudioRef,
  localMediaStream,
  isMicOpen,
  isSpeakerOpen
} = storeToRefs(useWebRTCStore())
const {
  targetId,
  messageList,
  lastMsgList,
  lastMsgMap,
  indexMap,
  unreadMsgCounter,
  msgContainerRef
} = storeToRefs(useRecentContactsStore())
const { matchRes } = storeToRefs(useMatchStore())
const { globalPC, globalSocket, userInfo } = storeToRefs(useUserStore())
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
const noMic = ref(!audioInputLabelsLength)
const noSpeaker = ref(!audioOutputLabelsLength)
const route = useRoute()
const router = useRouter()
const toast = useToast()
const isVoiceChat = computed(() => route.path === '/voice-chat')

// TODO: 里面的逻辑和 onBye 很相似，可以考虑合并
const onCancel = () => {
  const socket = globalSocket.value
  const _roomId = roomId.value
  const _targetId = useGetTargetIdByRoomId(_roomId, userInfo)

  if (!isVoiceChatMatch.value) {
    clearTimeout(leaveRoomTimer.value)

    // 非匹配模式下，在对方接通前挂掉，对方需要移除语音通知
    if (!rtcConnected.value) {
      socket.emit('cancel-web-rtc', _targetId)
    }
  }

  rtcConnected.value = false
  const pc = globalPC.value

  if (pc) {
    pc.close()
    globalPC.value = null
  }

  // 关闭本地媒体
  if (localMediaStream.value) {
    useCloseMediaStreamTracks(localMediaStream.value)
  }

  socket.emit('leave', _roomId, true)
  roomId.value = ''
  toast.add({ title: '已结束通话', icon: 'lucide:smile' })

  // isVoiceChatMatch 值为 true 表示双方接通成功，接通成功时点击挂断，只有在没有离开
  // 语音匹配界面的情况下，才需要跳转到主页
  if (isVoiceChatMatch.value && isVoiceChat.value) {
    router.replace('/')
  }

  isVoiceChatModalOpen.value = false

  // 语音匹配挂断时不进行通知
  // TODO: 处理匹配结果是好友的情况
  if (matchRes.value.id !== _targetId) {
    useSendMsg(
      'text',
      '结束了语音通话',
      null,
      null,
      null,
      null,
      null,
      null,
      _targetId,
      userInfo,
      globalSocket,
      messageList,
      lastMsgList,
      lastMsgMap,
      matchRes,
      indexMap,
      unreadMsgCounter,
      msgContainerRef,
      _targetId === targetId.value && msgContainerRef.value
    )
  }
}

const updateSpeakerLabel = (label: string) => (speakerLabel.value = label)

const updateSpeakerStatus = async () => {
  const newValue = !isSpeakerOpen.value
  remoteAudioRef.value.volume = newValue ? volume.value : 0
  isSpeakerOpen.value = newValue
  localStorage.setItem('isSpeakerOpen', String(newValue))
}

const updateMicLabel = label => (micLabel.value = label)

const updateMicStatus = async () => {
  const newValue = !isMicOpen.value

  // 最先加入房间的人会比后加入的更晚完成 pc 初始化
  // 在没初始化之前用户可能点击关闭麦克风，此时是没有媒体流的
  if (localMediaStream.value) {
    newValue
      ? useResumeMediaStreamTracks(localMediaStream.value)
      : usePauseMediaStreamTracks(localMediaStream.value)
  }

  isMicOpen.value = newValue
  localStorage.setItem('isMicOpen', String(newValue))
}

watch(volume, v => (remoteAudioRef.value.volume = v))

watch(speakerLabel, v => {
  const { deviceId } = audioOutputs.find(item => item.label === v)
  remoteAudioRef.value.setSinkId(deviceId)
})

watch(micLabel, async v => {
  const { deviceId } = audioInputs.find(item => item.label === v)

  if (localMediaStream.value) {
    useCloseMediaStreamTracks(localMediaStream.value)
  }

  localMediaStream.value = await useGetUserMedia({
    audio: { deviceId: { exact: deviceId } }
  })
  localAudioRef.value.srcObject = localMediaStream.value
})
</script>
