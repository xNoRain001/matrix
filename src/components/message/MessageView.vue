<template>
  <UDashboardPanel id="message-2">
    <MessageHeader @close="emits('close')" :is-match="isMatch"></MessageHeader>
    <!-- 聊天内容 -->
    <MessageDynamicScroller :is-match="isMatch"></MessageDynamicScroller>
    <!-- 移动端输入框 -->
    <div class="relative p-4" v-if="isMobile">
      <div class="flex items-end gap-2">
        <UButton
          v-if="!recording && !isRecord"
          @click="isRecord = !isRecord"
          variant="ghost"
          color="neutral"
          icon="lucide:mic"
        ></UButton>
        <UButton
          v-if="!recording && isRecord"
          @click="isRecord = !isRecord"
          variant="ghost"
          color="neutral"
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
          variant="ghost"
          color="neutral"
          icon="lucide:smile"
        ></UButton>
        <UButton
          v-if="!recording"
          variant="ghost"
          color="neutral"
          :icon="expanded ? 'lucide:circle-x' : 'lucide:circle-plus'"
          @click="onExpand"
        ></UButton>
      </div>
      <UCollapsible v-model:open="expanded">
        <template #content>
          <div class="mt-4 grid grid-cols-4 gap-y-4 p-4">
            <div class="flex flex-col items-center">
              <UButton
                color="neutral"
                icon="lucide:file-image"
                @click="onOpenFileSelector(inputRef)"
              ></UButton>
              <div class="mt-2 text-xs">图片</div>
            </div>
            <div class="flex flex-col items-center">
              <UButton
                color="neutral"
                icon="lucide:phone"
                @click="onCall"
              ></UButton>
              <div class="mt-2 text-xs">语音</div>
            </div>
          </div>
        </template>
      </UCollapsible>
    </div>
    <!-- PC 端输入框 -->
    <UPageCard v-else variant="subtle" :ui="{ container: '!p-4' }">
      <UTextarea
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
        <div class="space-x-3">
          <UTooltip text="表情">
            <UButton variant="ghost" icon="lucide:smile"></UButton>
          </UTooltip>
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
    accept="image/*"
  />
</template>

<script lang="ts" setup>
import {
  useGetMessages,
  useGenRoomId,
  useFormatTimeAgo,
  useGetDB,
  useGenHash,
  useSendMsg
} from '@/hooks'
import {
  useMatchStore,
  useRecentContactsStore,
  useUserStore,
  useWebRTCStore
} from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import type { message } from '@/types'
import { voiceChatInviteToastPendingTime } from '@/const'
import { useRoute } from 'vue-router'

let receivingOfflineMsgsTimer = null
let startTime = 0
let startY = 0
let recorderTimer = null
let first = true
let timer = null
let chunks = []
let mediaRecorder = null
const constraints = { audio: true }
const props = withDefaults(defineProps<{ isMatch?: boolean }>(), {
  isMatch: false
})
const emits = defineEmits(['close'])
// 对方是否收到了文件元信息的标识
const message = ref('')
const {
  targetId,
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
const { isVoiceChatModalOpen, roomId, leaveRoomTimer, isVoiceChatMatch } =
  storeToRefs(useWebRTCStore())
const { isMobile, globalSocket, userInfo } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const toast = useToast()
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
const inputRef = ref<HTMLInputElement | null>(null)
const expanded = ref(false)
const dashboardPanelRef = computed(
  () => (msgContainerRef.value as any)?.$el?.parentNode as HTMLElement
)
const route = useRoute()
const isRecord = ref(false)
const recording = ref(false)
const isCancelRecordTipShow = ref(false)
const isContacts = computed(() => route.path === '/contacts')

// const onDownload = (url, filename) => {
//   fetch(url)
//     .then(res => res.blob())
//     .then(blob => useExportFile(filename, blob))
// }

const onSuccess = stream => {
  mediaRecorder = new MediaRecorder(stream)
  mediaRecorder.start()
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
          targetId.value,
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
        toast.add({ title: '发送失败', color: 'error', icon: 'lucide:annoyed' })
      }
    }

    chunks = []
    // 关闭麦克风
    stream.getTracks().forEach(track => track.stop())
  }
  mediaRecorder.ondataavailable = ({ data }) => chunks.push(data)
}

const onError = () => {
  toast.add({
    title: '请开启麦克风权限',
    color: 'error',
    icon: 'lucide:annoyed'
  })
}

const onTouchstart = e => {
  startY = e.touches[0].clientY

  recorderTimer = setTimeout(() => {
    recording.value = true
    startTime = Date.now()
    navigator.vibrate && navigator.vibrate(200)
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)
  }, 200)
}

const onTouchmove = e => {
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
}

const onTouchend = () => {
  clearTimeout(recorderTimer)

  if (recording.value) {
    recording.value = false
    mediaRecorder.stop()
  }
}

const onCall = () => {
  if (roomId.value) {
    toast.add({
      title: '当前正在语音中',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  isVoiceChatMatch.value = false
  const _targetId = targetId.value

  // 不在这里更新 roomId.value，因为要先确保对方能通话时才会显示语音浮动按钮，
  // 因此在 onJoin 中更新 roomId.value
  const _roomId = useGenRoomId(userInfo.value.id, _targetId)
  globalSocket.value.emit(
    'unidirectional-web-rtc',
    _roomId,
    userInfo.value.nickname,
    _targetId
  )
  leaveRoomTimer.value = setTimeout(() => {
    globalSocket.value.emit('leave', roomId.value)
    isVoiceChatModalOpen.value = false
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
    'text',
    '发起了语音通话',
    null,
    null,
    null,
    null,
    null,
    null,
    targetId.value,
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

const onExpand = () => {
  expanded.value = !expanded.value
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
  dashboardPanelRef.value.style.paddingTop = `${visualViewport.offsetTop}px`
  ;(msgContainerRef.value as any).scrollToBottom()
}

const onFocus = () => (expanded.value = false)

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
        targetId.value,
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
      targetId.value,
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
  const item = lastMsgMap.value[targetId.value]

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
  const _targetId = targetId.value
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
      targetId,
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

onBeforeUnmount(() => {
  removeVisualViewportListeners()

  if (props.isMatch) {
    clearInterval(timer)
  }

  // 组件销毁时重置相关值，这样其它地方就不用处理了，处于 contacts 下的聊天界面关闭
  // 时不重置 targetId，否则会造成空间也被关闭，在空间关闭时重置 targetId，由于组件
  // 上有基于 props.targetId 的 v-if，因此重置逻辑不能写在 watch 里，targetId
  // 值被重置为 '' 时不会执行回调
  if (!isContacts.value) {
    targetId.value = ''
  }

  messageList.value = []
  lastFetchedId.value = Infinity
})
</script>
