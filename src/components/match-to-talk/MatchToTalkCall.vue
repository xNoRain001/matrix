<template>
  <div class="relative flex flex-1 items-center justify-center">
    <div class="absolute top-0 right-0">
      <UPopover v-if="!isMobile">
        <UButton icon="lucide:volume-2" variant="ghost" color="neutral" />
        <template #content>
          <USlider
            @update:model-value="onUpdateVolume"
            class="w-48"
            v-model="volume"
            tooltip
          />
        </template>
      </UPopover>

      <UDropdownMenu
        v-if="audioInputLabelsLength > 1"
        class="mr-1.5"
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
        v-if="audioOutputLabelsLength > 1"
        :disabled="!isSpeakerOpen"
        :items="_speakerOptions"
        :ui="{
          content: 'w-80'
        }"
      >
        <UButton icon="lucide:volume" color="neutral" variant="ghost" />
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
    <div class="flex flex-1 flex-col items-center gap-4">
      <UAvatar
        :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
        :alt="targetNickname[0]"
        class="size-24 text-5xl"
      />
      <div class="text-center">{{ targetNickname }}</div>
      <div class="text-sm">
        {{ rtcConnected ? '通话中...' : '等待对方接通...' }}
      </div>
      <div
        :class="isMobile ? '' : 'max-w-1/2'"
        class="mt-4 grid w-full grid-cols-3"
      >
        <div class="flex flex-col items-center justify-center">
          <UButton
            class="flex flex-col"
            @click="updateMicStatus"
            :icon="isMicOpen ? 'lucide:mic' : 'lucide:mic-off'"
            variant="ghost"
            :color="isMicOpen ? 'neutral' : 'info'"
            :ui="{ label: 'mt-4', leadingIcon: 'size-10' }"
          />
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
          />
          <div class="text-error mt-4 text-sm">取消</div>
        </div>
        <div class="flex flex-col items-center justify-center">
          <UButton
            class="flex flex-col"
            :icon="isSpeakerOpen ? 'lucide:volume-2' : 'lucide:volume-off'"
            @click="updateSpeakerStatus"
            variant="ghost"
            :color="isSpeakerOpen ? 'neutral' : 'info'"
            :ui="{ label: 'mt-4', leadingIcon: 'size-10' }"
          />
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
  useMessagesStore,
  useRecentContactsStore,
  useUserStore,
  useWebRTCStore
} from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { useThrottleFn } from '@vueuse/core'
import type { userInfo } from '@/types'

const props = withDefaults(
  defineProps<{
    isMatch?: boolean
    close?: () => void
    targetId: string
    targetNickname: string
  }>(),
  {
    isMatch: false,
    close: () => {}
  }
)
const { VITE_OSS_BASE_URL } = import.meta.env
const {
  roomId,
  rtcConnected,
  leaveRoomTimer,
  isVoiceChatMatch,
  localAudioRef,
  remoteAudioRef,
  localMediaStream,
  isMicOpen,
  isSpeakerOpen
} = storeToRefs(useWebRTCStore())
const { lastMsgList, lastMsgMap, indexMap, unreadMsgCounter, activeTargetIds } =
  storeToRefs(useRecentContactsStore())
const { matchRes } = storeToRefs(useMatchStore())
const { isMobile, globalPC, globalSocket, userInfo } =
  storeToRefs(useUserStore())
const { messageRecordMap } = storeToRefs(useMessagesStore())
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
const micLabel = ref(audioInputLabels[0])
const micOptions = [...(audioInputLabelsLength ? audioInputLabels : [])]
const _micOptions = micOptions.map(item => ({ label: item, icon: '' }))
const speakerLabel = ref(audioOutputLabels[0])
const speakerOptions = reactive([
  ...(audioOutputLabelsLength ? audioOutputLabels : [])
])
const _speakerOptions = speakerOptions.map(item => ({ label: item, icon: '' }))
const route = useRoute()
const router = useRouter()
const toast = useToast()
const isVoiceChat = computed(() => route.path === '/voice-chat')
const volume = ref(
  Math.floor(Number(localStorage.getItem('volume')) * 100) || 100
)
remoteAudioRef.value.volume = Number((volume.value / 100).toFixed(2))

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

  // 由于当前组件是 Modal 的子组件，因此在这里调用 Modal 的 close 是不会关闭 Modal
  // 的，需要将 Modal 的关闭事件传递进来
  props.close()

  // 语音匹配挂断时不进行通知
  // TODO: 处理匹配结果是好友的情况
  if (matchRes.value?.targetId !== _targetId) {
    useSendMsg(
      'voiceChatCallOffTip',
      '[语音通话]',
      null,
      null,
      null,
      null,
      null,
      null,
      _targetId,
      userInfo,
      globalSocket,
      messageRecordMap,
      lastMsgList,
      lastMsgMap,
      matchRes,
      indexMap,
      unreadMsgCounter,
      activeTargetIds.value.has(_targetId)
    )
  }
}

const updateSpeakerLabel = (label: string) => (speakerLabel.value = label)

const updateSpeakerStatus = () => {
  const newValue = !isSpeakerOpen.value
  // 直接设置 volume 值为 1 或 0 会有兼容性问题，因此设置 muted 属性
  remoteAudioRef.value.muted = newValue ? false : true
  isSpeakerOpen.value = newValue
  localStorage.setItem('isSpeakerOpen', String(newValue))
}

const updateMicLabel = label => (micLabel.value = label)

const updateMicStatus = () => {
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

const onUpdateVolume = useThrottleFn(
  v => {
    const volume = Array.isArray(v) ? v[0] : v
    const _volume = (volume / 100).toFixed(2)
    remoteAudioRef.value.volume = Number(_volume)
    localStorage.setItem('volume', _volume)
  },
  200,
  true,
  false
)

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
