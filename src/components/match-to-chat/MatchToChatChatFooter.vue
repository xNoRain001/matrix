<template>
  <div class="border-default relative border-t p-4" v-if="isMobile">
    <div class="flex items-end gap-2">
      <UButton
        v-if="!recording && !isRecord"
        @click="onSpeak"
        variant="ghost"
        icon="lucide:mic"
      />
      <UButton
        v-if="!recording && isRecord"
        @click="isRecord = !isRecord"
        variant="ghost"
        icon="lucide:keyboard"
      />
      <div
        v-if="recording"
        :class="isCancelRecordTipShow ? 'text-error' : ''"
        class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-sm"
      >
        {{ isCancelRecordTipShow ? '松手取消' : '松手发送 上移取消' }}
      </div>
      <UBadge
        @touchstart="onTouchstart"
        @touchend="onTouchend"
        @touchmove="onTouchmove"
        v-if="isRecord"
        class="grow justify-center select-none"
        size="xl"
        :label="recording ? '' : '按住说话'"
      >
        <svg
          v-if="recording"
          class="size-6"
          fill="currentColor"
          viewBox="0 0 135 140"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect y="10" width="15" height="120" rx="6">
            <animate
              attributeName="height"
              begin="0.5s"
              dur="1s"
              values="120;110;100;90;80;70;60;50;40;140;120"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="y"
              begin="0.5s"
              dur="1s"
              values="10;15;20;25;30;35;40;45;50;0;10"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </rect>
          <rect x="30" y="10" width="15" height="120" rx="6">
            <animate
              attributeName="height"
              begin="0.25s"
              dur="1s"
              values="120;110;100;90;80;70;60;50;40;140;120"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="y"
              begin="0.25s"
              dur="1s"
              values="10;15;20;25;30;35;40;45;50;0;10"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </rect>
          <rect x="60" width="15" height="140" rx="6">
            <animate
              attributeName="height"
              begin="0s"
              dur="1s"
              values="120;110;100;90;80;70;60;50;40;140;120"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="y"
              begin="0s"
              dur="1s"
              values="10;15;20;25;30;35;40;45;50;0;10"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </rect>
          <rect x="90" y="10" width="15" height="120" rx="6">
            <animate
              attributeName="height"
              begin="0.25s"
              dur="1s"
              values="120;110;100;90;80;70;60;50;40;140;120"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="y"
              begin="0.25s"
              dur="1s"
              values="10;15;20;25;30;35;40;45;50;0;10"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </rect>
          <rect x="120" y="10" width="15" height="120" rx="6">
            <animate
              attributeName="height"
              begin="0.5s"
              dur="1s"
              values="120;110;100;90;80;70;60;50;40;140;120"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="y"
              begin="0.5s"
              dur="1s"
              values="10;15;20;25;30;35;40;45;50;0;10"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </rect>
        </svg>
      </UBadge>
      <UTextarea
        v-if="!recording && !isRecord"
        ref="mobileTextareaRef"
        @keydown.enter.prevent="onSendMsg"
        @focus="onFocus"
        enterkeyhint="send"
        class="grow"
        v-model="message"
        :rows="1"
        :maxrows="9"
        autoresize
      />
      <UButton
        v-if="!recording"
        :icon="isEmojiOpen ? 'lucide:keyboard' : 'lucide:smile'"
        variant="ghost"
        @click="onOpenEmoji"
      />
      <UButton
        v-if="!recording"
        variant="ghost"
        :icon="expanded ? 'lucide:circle-x' : 'lucide:circle-plus'"
        @click="onExpand"
      />
    </div>
    <Emoji
      v-model="message"
      v-model:is-emoji-open="isEmojiOpen"
      :elm="mobileTextareaRef"
      :input-ref="inputRef"
      @send="onSendMsg"
    />
    <UCollapsible v-model:open="expanded">
      <template #content>
        <div class="grid grid-cols-4 gap-4 py-4">
          <div
            class="flex flex-col items-center"
            v-for="({ icon, label, onSelect }, index) in collapsibleItems"
            :key="index"
          >
            <UButton :icon="icon" size="xl" @click="onSelect" />
            <div class="mt-2 text-xs">{{ label }}</div>
          </div>
        </div>
      </template>
    </UCollapsible>
  </div>
  <!-- PC 端输入框 -->
  <UPageCard v-else variant="soft">
    <UTextarea
      ref="textareaRef"
      placeholder="Ctrl + Enter 换行"
      @keydown.enter.prevent="onKeydown"
      class="w-full"
      v-model="message"
      :rows="3"
      :maxrows="3"
      autoresize
      variant="none"
      :ui="{ base: 'p-0' }"
    />

    <div class="flex justify-between">
      <div class="space-x-2">
        <Emoji v-model="message" :elm="textareaRef" :input-ref="inputRef" />
        <UTooltip
          :text="label"
          v-for="({ icon, label, onSelect }, index) in collapsibleItems"
          :key="index"
        >
          <UButton variant="ghost" :icon="icon" @click="onSelect" />
        </UTooltip>
      </div>
      <UButton @click="onSendMsg" class="rounded-full" icon="lucide:arrow-up" />
    </div>
  </UPageCard>
  <!-- 图片选择器 -->
  <input
    ref="inputRef"
    @change="onInputChange"
    type="file"
    hidden
    accept="image/png, image/jpeg, image/gif"
  />
</template>

<script lang="ts" setup>
import {
  useGenRoomId,
  useGetDB,
  useGenHash,
  useSendMsg,
  useIsDeviceOpen,
  useFixSoftKeyboardInIOS
} from '@/hooks'
import {
  useMatchStore,
  useMessagesStore,
  useRecentContactsStore,
  useUserStore,
  useWebRTCStore
} from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import type { message, userInfo } from '@/types'
import { voiceChatInviteToastPendingTime } from '@/const'
import { useThrottleFn } from '@vueuse/core'
import OverlayTalk from '@/components/overlay/OverlayTalk.vue'
// import OverlayObfuscateImage from '@/components/overlay/OverlayObfuscateImage.vue'
// import OverlayImageToASCII from '@/components/overlay/OverlayImageToASCII.vue'

let startTime = 0
let startY = 0
let recorderTimer = null
let chunks = []
let mediaRecorder = null
let cb = null
const textareaRef = useTemplateRef('textareaRef')
const mobileTextareaRef = useTemplateRef('mobileTextareaRef')
const constraints = { audio: true }
const props = withDefaults(
  defineProps<{
    isMatch?: boolean
    targetId: string
    targetNickname: string
  }>(),
  {
    isMatch: false
  }
)
const message = ref('')
const {
  unreadMsgCounter,
  lastMsgMap,
  lastMsgList,
  hashToBlobURLMap,
  indexMap
} = storeToRefs(useRecentContactsStore())
const {
  roomId,
  leaveRoomTimer,
  isVoiceChatMatch,
  webRTCTargetId,
  webRTCTargetNickname
} = storeToRefs(useWebRTCStore())
const { isMobile, globalSocket, userInfo } = storeToRefs(useUserStore())
const { messageRecordMap } = storeToRefs(useMessagesStore())
const { matchRes } = storeToRefs(useMatchStore())
const toast = useToast()
const inputRef = ref<HTMLInputElement | null>(null)
const expanded = ref(false)
const isEmojiOpen = ref(false)
const isRecord = ref(false)
const recording = ref(false)
const isCancelRecordTipShow = ref(false)
const overlay = useOverlay()
const talkOverlay = overlay.create(OverlayTalk)
// const imageToASCIIOverlay = overlay.create(OverlayImageToASCII)
// const obfuscateImageOverlay = overlay.create(OverlayObfuscateImage)

const onSpeak = async () => {
  if (await useIsDeviceOpen(toast, 'microphone', '麦克风')) {
    const v = !isRecord.value
    isRecord.value = v

    if (v) {
      isEmojiOpen.value = false
      expanded.value = false
    }
  }
}

const initMediaRecorder = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaRecorder = new MediaRecorder(stream)
    mediaRecorder.start()
    mediaRecorder.ondataavailable = ({ data }) => chunks.push(data)
    mediaRecorder.onstop = async () => {
      if (isCancelRecordTipShow.value) {
        isCancelRecordTipShow.value = false
      } else {
        const duration = Math.round((Date.now() - startTime) / 1000)
        const blob = new Blob(chunks, { type: 'audio/mpeg' })
        const url = URL.createObjectURL(blob)
        try {
          const hash = await useGenHash(blob, 'mp3')
          await useSendMsg(
            'audio',
            null,
            hash,
            blob,
            null,
            null,
            url,
            duration,
            props.targetId,
            userInfo,
            globalSocket,
            messageRecordMap,
            lastMsgList,
            lastMsgMap,
            matchRes,
            indexMap,
            unreadMsgCounter,
            true
          )
          const db = await useGetDB(userInfo.value.id)
          const tx = db.transaction('files', 'readwrite')
          // 音频肯定不会重复，因此不需要判断本地数据库中是否存在该 hash
          await tx.objectStore('files').put({ hash, blob })
          await tx.done
        } catch {
          toast.add({
            title: '发送失败',
            color: 'error',
            icon: 'lucide:annoyed'
          })
        }
      }

      chunks = []
      // 关闭麦克风
      stream.getTracks().forEach(track => track.stop())
    }
  } catch {
    toast.add({
      title: '请开启麦克风权限',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onTouchstart = e => {
  startY = e.touches[0].clientY

  recorderTimer = setTimeout(async () => {
    recording.value = true
    startTime = Date.now()
    navigator.vibrate && navigator.vibrate(200)
    initMediaRecorder()
  }, 50)
}

const onTouchmove = useThrottleFn(
  e => {
    if (!recording.value) {
      return
    }

    if (startY - e.touches[0].clientY > 100) {
      if (!isCancelRecordTipShow.value) {
        navigator.vibrate && navigator.vibrate(200)
      }

      isCancelRecordTipShow.value = true
    } else {
      if (isCancelRecordTipShow.value) {
        navigator.vibrate && navigator.vibrate(200)
      }

      isCancelRecordTipShow.value = false
    }
  },
  200,
  true,
  false
)

const onTouchend = () => {
  clearTimeout(recorderTimer)

  if (recording.value) {
    recording.value = false
    mediaRecorder.stop()
  }
}

const onCall = async () => {
  if (roomId.value) {
    toast.add({
      title: '当前正在语音中',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  if (!(await useIsDeviceOpen(toast, 'microphone', '麦克风'))) {
    return
  }

  isVoiceChatMatch.value = false
  const _targetId = props.targetId
  webRTCTargetId.value = _targetId
  webRTCTargetNickname.value = props.targetNickname

  // 不在这里更新 roomId.value，因为要先确保对方能通话时才会显示语音浮动按钮，
  // 因此在 onJoin 中更新 roomId.value
  const _roomId = useGenRoomId(userInfo.value.id, _targetId)
  globalSocket.value.emit('unidirectional-web-rtc', _roomId, _targetId)
  leaveRoomTimer.value = setTimeout(() => {
    globalSocket.value.emit('leave', roomId.value)
    talkOverlay.close()
    roomId.value = ''
    clearTimeout(leaveRoomTimer.value)
    toast.add({
      title: '对方未应答',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }, voiceChatInviteToastPendingTime)
  // 发起语音、对方同意、对方拒绝、对方未接通前发起方挂断、接通后任意一方挂断，只有
  // 这些情况下会在聊天记录中出现
  useSendMsg(
    'voiceChatCallTip',
    '[语音通话]',
    null,
    null,
    null,
    null,
    null,
    null,
    props.targetId,
    userInfo,
    globalSocket,
    messageRecordMap,
    lastMsgList,
    lastMsgMap,
    matchRes,
    indexMap,
    unreadMsgCounter,
    true
  )
}

const onRandom = async () => {
  try {
    await useSendMsg(
      'random',
      String(Math.floor(Math.random() * 6) + 1),
      null,
      null,
      null,
      null,
      null,
      null,
      props.targetId,
      userInfo,
      globalSocket,
      messageRecordMap,
      lastMsgList,
      lastMsgMap,
      matchRes,
      indexMap,
      unreadMsgCounter,
      true
    )
  } catch {
    toast.add({ title: '发送失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const collapsibleItems = [
  {
    icon: 'lucide:image',
    label: '图片',
    onSelect: () => inputRef.value.click()
  },
  {
    icon: 'lucide:phone-call',
    label: '语音',
    onSelect: onCall
  },
  {
    icon: 'lucide:dices',
    label: '骰子',
    onSelect: onRandom
  }
  // {
  //   icon: 'lucide:scan-text',
  //   label: '艺术字',
  //   onSelect: () => imageToASCIIOverlay.open()
  // },
  // {
  //   icon: 'lucide:binary',
  //   label: '混淆',
  //   onSelect: () => obfuscateImageOverlay.open()
  // }
]

const onOpenEmoji = () => {
  const v = !isEmojiOpen.value
  isEmojiOpen.value = v

  if (v) {
    expanded.value = false
    isRecord.value = false
  }
}

const onExpand = () => {
  const v = !expanded.value
  expanded.value = v

  if (v) {
    isEmojiOpen.value = false
    isRecord.value = false
  }
}

const onFocus = ({ target }) => {
  if (target.getAttribute('skipFocus') === 'true') {
    target.setAttribute('skipFocus', 'false')
    // 失焦，实现点击输入框时关闭 emoji
    target.blur()
    return
  }

  expanded.value = false
  isEmojiOpen.value = false
  // 不需要修改 isRecord，因为能聚焦时一定没有进行发送语音行为
}

const onInputChange = async () => {
  const input = inputRef.value
  const { files } = input
  const file = files[0]

  if (file.size > 10 * 1024 * 1024) {
    toast.add({
      title: '发送失败，图片大小不能超过 10MB',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    input.value = ''
    return
  }

  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = async () => {
    const { width, height } = img
    try {
      const hash = await useGenHash(file)
      await useSendMsg(
        'image',
        null,
        hash,
        file,
        width,
        height,
        url,
        null,
        props.targetId,
        userInfo,
        globalSocket,
        messageRecordMap,
        lastMsgList,
        lastMsgMap,
        matchRes,
        indexMap,
        unreadMsgCounter,
        true
      )

      // 如果存在，说明本地中一定有，不用进行处理，不存在，不能说明本地中一定没有，
      // 可能是没有读取或者存储数量达到上限
      const _hashToBlobURLMap = hashToBlobURLMap.value
      if (!_hashToBlobURLMap.has(hash)) {
        const db = await useGetDB(userInfo.value.id)
        const tx = db.transaction('files', 'readwrite')
        const record = await tx.objectStore('files').get(hash)
        if (!record) {
          await tx.objectStore('files').put({ hash, blob: file })
        }
        await tx.done

        if (_hashToBlobURLMap.size < 100) {
          _hashToBlobURLMap.set(hash, url)
        }
      }
    } catch {
      toast.add({ title: '发送失败', color: 'error', icon: 'lucide:annoyed' })
    } finally {
      input.value = ''
    }
  }
  img.src = url
}

const onKeydown = e => {
  const { ctrlKey, metaKey, target } = e

  // Ctrl + Enter 或 Command + Enter
  if (ctrlKey || metaKey) {
    const index = target.selectionStart // 获取光标位置
    const { value } = target
    // 插入换行符
    message.value = value.slice(0, index) + '\n' + value.slice(index)
    const newIndex = index + 1
    // 更新光标位置
    setTimeout(() => target.setSelectionRange(newIndex, newIndex))
  } else {
    onSendMsg()
  }
}

const onSendMsg = async () => {
  const _message = message.value

  if (!_message) {
    return
  }

  if (_message.length > 2000) {
    toast.add({
      title: '支持的最大消息长度为 2000 字符',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  try {
    await useSendMsg(
      'text',
      _message,
      null,
      null,
      null,
      null,
      null,
      null,
      props.targetId,
      userInfo,
      globalSocket,
      messageRecordMap,
      lastMsgList,
      lastMsgMap,
      matchRes,
      indexMap,
      unreadMsgCounter,
      true
    )
  } catch {
    toast.add({ title: '发送失败', color: 'error', icon: 'lucide:annoyed' })
  } finally {
    message.value = ''
  }
}

onMounted(() => {
  cb = useFixSoftKeyboardInIOS(
    document.querySelector('#dashboard-panel-match-to-chat'),
    messageRecordMap.value[props.targetId].scroller
  )
})

onBeforeUnmount(() => {
  cb()
})
</script>
