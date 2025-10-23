<template>
  <UDashboardPanel id="message-2">
    <MessageHeader
      @close="emits('close')"
      :is-match="isMatch"
      :target-id="targetId"
      :target-profile="targetProfile"
    ></MessageHeader>
    <!-- 聊天内容 -->
    <MessageDynamicScroller
      :is-match="isMatch"
      :target-id="targetId"
      :target-profile="targetProfile"
    ></MessageDynamicScroller>
    <!-- 移动端输入框 -->
    <div class="border-default relative border-t p-4" v-if="isMobile">
      <div class="flex items-end gap-2">
        <UButton
          v-if="!recording && !isRecord"
          @click="onSpeak"
          variant="ghost"
          icon="lucide:mic"
        ></UButton>
        <UButton
          v-if="!recording && isRecord"
          @click="isRecord = !isRecord"
          variant="ghost"
          icon="lucide:keyboard"
        ></UButton>
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
          :icon="recording ? 'lucide:audio-lines' : ''"
          :label="recording ? '' : '按住说话'"
        >
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
        ></UButton>
      </div>
      <Emoji
        v-model="message"
        v-model:is-emoji-open="isEmojiOpen"
        :elm="mobileTextareaRef"
        :input-ref="inputRef"
        @send="onSendMsg"
      ></Emoji>
      <UCollapsible v-model:open="expanded">
        <template #content>
          <div class="grid grid-cols-4 gap-4 pt-4">
            <div class="flex flex-col items-center">
              <UButton
                icon="lucide:file-image"
                size="xl"
                @click="onOpenFileSelector(inputRef)"
              ></UButton>
              <div class="mt-2 text-xs">图片</div>
            </div>
            <div class="flex flex-col items-center">
              <UButton icon="lucide:phone" size="xl" @click="onCall"></UButton>
              <div class="mt-2 text-xs">语音</div>
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
        enterkeyhint="send"
        class="relative w-full"
        v-model="message"
        :rows="3"
        :maxrows="3"
        autoresize
        variant="none"
        :ui="{ base: 'p-0' }"
      >
      </UTextarea>

      <div class="flex justify-between">
        <div class="space-x-2">
          <Emoji
            v-model="message"
            :elm="textareaRef"
            :input-ref="inputRef"
          ></Emoji>
          <UTooltip text="图片">
            <UButton
              variant="ghost"
              icon="lucide:file-image"
              @click="onOpenFileSelector(inputRef)"
            ></UButton>
          </UTooltip>
          <UTooltip text="语音">
            <UButton
              variant="ghost"
              icon="lucide:phone"
              @click="onCall"
            ></UButton>
          </UTooltip>
        </div>
        <UButton @click="onSendMsg" icon="lucide:send" label="发送"></UButton>
      </div>
    </UPageCard>
  </UDashboardPanel>
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
  useGetMessages,
  useGenRoomId,
  useFormatTimeAgo,
  useGetDB,
  useGenHash,
  useSendMsg,
  useIsDeviceOpen
} from '@/hooks'
import {
  useMatchStore,
  usePostStore,
  useRecentContactsStore,
  useUserStore,
  useWebRTCStore
} from '@/store'
import { storeToRefs } from 'pinia'
import {
  onBeforeUnmount,
  onMounted,
  ref,
  computed,
  watch,
  onBeforeMount,
  useTemplateRef
} from 'vue'
import type { message, userInfo } from '@/types'
import { voiceChatInviteToastPendingTime } from '@/const'
import { useRoute } from 'vue-router'
import { useThrottleFn } from '@vueuse/core'
import OverlayVoiceChat from '@/components/overlay/OverlayVoiceChat.vue'

let receivingOfflineMsgsTimer = null
let startTime = 0
let startY = 0
let recorderTimer = null
let first = true
let timer = null
let chunks = []
let mediaRecorder = null
const textareaRef = useTemplateRef('textareaRef')
const mobileTextareaRef = useTemplateRef('mobileTextareaRef')
const constraints = { audio: true }
const props = withDefaults(
  defineProps<{
    isMatch?: boolean
    targetId: string
    targetProfile: userInfo['profile']
  }>(),
  {
    isMatch: false
  }
)
const emits = defineEmits(['close'])
const message = ref('')
const {
  activeTargetId,
  activeTargetProfile,
  activeTargetIds,
  msgContainerRef,
  unreadMsgCounter,
  messageList,
  lastMsgMap,
  lastMsgList,
  hashToBlobURLMap,
  lastFetchedId,
  skipUnshiftMessageRecord,
  indexMap,
  isReceivingOfflineMsgs
} = storeToRefs(useRecentContactsStore())
const {
  roomId,
  leaveRoomTimer,
  isVoiceChatMatch,
  webRTCTargetId,
  webRTCTargetProfile
} = storeToRefs(useWebRTCStore())
const { isMobile, globalSocket, userInfo } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const { postMap } = storeToRefs(usePostStore())
const toast = useToast()
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
const inputRef = ref<HTMLInputElement | null>(null)
const expanded = ref(false)
const isEmojiOpen = ref(false)
const dashboardPanelRef = computed(
  () => (msgContainerRef.value as any)?.$el?.parentNode as HTMLElement
)
const route = useRoute()
const isRecord = ref(false)
const recording = ref(false)
const isCancelRecordTipShow = ref(false)
const isContacts = computed(() => route.path === '/contacts')
const overlay = useOverlay()
const voiceChatOverlay = overlay.create(OverlayVoiceChat)
const prevRoute = route.path

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
        const blob = new Blob(chunks, { type: 'audio/mp3' })
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
            messageList,
            lastMsgList,
            lastMsgMap,
            matchRes,
            indexMap,
            unreadMsgCounter,
            msgContainerRef,
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
  webRTCTargetProfile.value = props.targetProfile

  // 不在这里更新 roomId.value，因为要先确保对方能通话时才会显示语音浮动按钮，
  // 因此在 onJoin 中更新 roomId.value
  const _roomId = useGenRoomId(userInfo.value.id, _targetId)
  globalSocket.value.emit(
    'unidirectional-web-rtc',
    _roomId,
    userInfo.value.profile,
    _targetId
  )
  leaveRoomTimer.value = setTimeout(() => {
    globalSocket.value.emit('leave', roomId.value)
    voiceChatOverlay.close()
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
    messageList,
    lastMsgList,
    lastMsgMap,
    matchRes,
    indexMap,
    unreadMsgCounter,
    msgContainerRef,
    true
  )
}

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

const resizeHandler = () => {
  // 安卓：在呼出键盘后，不会将获取焦点的输入框滚动到视图内，直接修改视图高度为原来的
  // 视图高度 - 键盘高度，原先的视图只是高度变小了，头部依然能够显示，如果内容高度
  // 大于视口宽度，出现滚动条
  // iOS: 在呼出键盘后，会将获取焦点的输入框滚动到视图内，视图高度不会改变，而是由
  // 原本的视图和底部键盘组成，原本的视图溢出的高度最大值为键盘的高度（滚动区域的
  // 最大距离为键盘高度），由输入框的位置决定，这就导致头部可能无法显示在当前视图中，
  // 另外，iOS 键盘显示时，页面的头部和底部都会多出一块衬底区域

  // visualViewport.offsetTop 表示视觉视口相对于布局视口的偏移，标签栏在底部时
  // 这个值可能不准
  // TODO: 找到解决办法
  const { offsetTop, height } = visualViewport
  dashboardPanelRef.value.style.paddingTop = `${offsetTop}px`
  const html = document.documentElement
  const { scrollHeight } = html

  // 不相等，说明输入框被软键盘挡住了，需要修正位置，在底部输入框出现了高度较大的折叠
  // 项时，会出现这种情况
  if (scrollHeight !== offsetTop + height) {
    html.scrollTop = scrollHeight - height
  }

  ;(msgContainerRef.value as any).scrollToBottom()
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

const onOpenFileSelector = target => target.click()

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
        messageList,
        lastMsgList,
        lastMsgMap,
        matchRes,
        indexMap,
        unreadMsgCounter,
        msgContainerRef,
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
      messageList,
      lastMsgList,
      lastMsgMap,
      matchRes,
      indexMap,
      unreadMsgCounter,
      msgContainerRef,
      true
    )
  } catch {
    toast.add({ title: '发送失败', color: 'error', icon: 'lucide:annoyed' })
  } finally {
    message.value = ''
  }
}

// 处理 iOS 软键盘问题
const addVisualViewportListeners = () => {
  if (isIOS) {
    // 软键盘打开和关闭时触发
    visualViewport.addEventListener('resize', resizeHandler)
    visualViewport.addEventListener('scroll', resizeHandler)
  }
}

const removeVisualViewportListeners = () => {
  if (isIOS) {
    visualViewport.removeEventListener('resize', resizeHandler)
    visualViewport.removeEventListener('scroll', resizeHandler)
  }
}

const updateTimeAgo = () => {
  const item = lastMsgMap.value[props.targetId]

  if (item) {
    if (item.timestamp) {
      item.timeAgo = useFormatTimeAgo(item.timestamp)
    }
  }
}

const resetUnreadMsgs = async targetId => {
  const item = lastMsgMap.value[targetId]
  // 如果当前打开的是非消息列表中对象的聊天界面，item 值为 undefined
  const unreadMsgs = item?.unreadMsgs

  if (item && unreadMsgs) {
    unreadMsgCounter.value -= unreadMsgs
    item.unreadMsgs = 0
    const db = await useGetDB(userInfo.value.id)
    await db.put('lastMessages', JSON.parse(JSON.stringify(item)))
  }
}

const initMessages = async () => {
  const _targetId = props.targetId
  await useGetMessages(
    userInfo.value.id,
    hashToBlobURLMap,
    messageList,
    lastFetchedId,
    _targetId
  )
  ;(msgContainerRef.value as any).scrollToBottom()
  resetUnreadMsgs(_targetId)
}

const initMessagesInMatch = async () => {
  if (!isReceivingOfflineMsgs.value) {
    initMessages()
  } else {
    receivingOfflineMsgsTimer = setInterval(async () => {
      if (!isReceivingOfflineMsgs.value) {
        clearInterval(receivingOfflineMsgsTimer)
        initMessages()
      }
    }, 1000)
  }
}

props.isMatch
  ? initMessagesInMatch()
  : watch(
      activeTargetId,
      async v => {
        if (v) {
          // PC 端可能不关闭聊天界面点击其他用户列表的情况，如果不先重置 messageList 会
          // 造成切换后滚动条不一定在底部的问题，通过清空聊天记录，将 scrollTop 恢复
          // 为 0
          messageList.value = []

          // scrollTop 为 0 时，会触发拉取消息的行为，需要跳过，当组件未销毁时切换
          // targetId 会执行里面的逻辑
          if (!first) {
            skipUnshiftMessageRecord.value = true
          }

          if (first) {
            first = false
          }

          // PC 端可能存在不关闭聊天界面点击其他用户列表的情况，组件不会销毁，此时需要重置
          // lastFetchedId，这里就不加 isMobile 判断了
          lastFetchedId.value = Infinity
          initMessages()
          // 需要重置为 false，恢复拉取消息
          skipUnshiftMessageRecord.value = false
        }
      },
      { immediate: true }
    )

onMounted(() => {
  // message list 组件会更新 time ago，不需要处理该页面的聊天界面的 time ago
  if (props.isMatch || isContacts.value) {
    updateTimeAgo()
    timer = setInterval(updateTimeAgo, 1000 * 60)
  }

  addVisualViewportListeners()
})

onBeforeMount(() => {
  // 先显示聊天界面时
  if (!activeTargetIds.value.size) {
    activeTargetIds.value.add(props.targetId)
  }
})

onBeforeUnmount(() => {
  removeVisualViewportListeners()

  if (props.isMatch) {
    clearInterval(timer)
  }

  messageList.value = []
  lastFetchedId.value = Infinity

  // 处理 message 页面未关闭聊天界面切换到其他页面和通过空间打开聊天界面后，关闭聊天
  // 界面时不关闭空间
  if (activeTargetIds.value.size === 1 && prevRoute === '/message') {
    activeTargetIds.value.delete(props.targetId)
    delete postMap.value[props.targetId]
    activeTargetId.value = ''
    activeTargetProfile.value = null
  }
})
</script>
