<template>
  <UDashboardPanel id="message-2">
    <MessageHeader
      @close="emits('close')"
      :target-id="targetId"
      :is-match="isMatch"
    ></MessageHeader>
    <!-- 聊天内容 -->
    <MessageDynamicScroller
      :target-id="targetId"
      :is-match="isMatch"
    ></MessageDynamicScroller>
    <!-- 移动端输入框 -->
    <div class="p-4" v-if="isMobile">
      <div class="flex items-end gap-2">
        <UButton variant="ghost" color="neutral" icon="lucide:mic"></UButton>
        <UTextarea
          @keydown.enter.prevent="onSendMsg"
          @focus="onFocus"
          enterkeyhint="send"
          class="grow"
          v-model="message"
          :rows="1"
          :maxrows="9"
          autoresize
        />
        <UButton variant="ghost" color="neutral" icon="lucide:smile"></UButton>
        <UButton
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
  useAddLastMsg,
  useGenRoomId,
  useFormatTimeAgo,
  useIsOverFiveMins,
  useAddMessageRecordToView,
  useAddMessageRecordToDB,
  useUpdateLastMsg,
  useGetDB,
  useGenHash
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
import { uploadImage } from '@/apis/oss'

let timer = null
const props = withDefaults(
  defineProps<{ targetId: string; isMatch?: boolean }>(),
  {
    isMatch: false
  }
)
const emits = defineEmits(['close'])
// 对方是否收到了文件元信息的标识
const message = ref('')
const {
  targetId: _targetId,
  msgContainerRef,
  unreadMsgCounter,
  messageList,
  lastMsgMap,
  lastMsgList,
  hashToBlobURLMap,
  lastFetchedId
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

// const onDownload = (url, filename) => {
//   fetch(url)
//     .then(res => res.blob())
//     .then(blob => useExportFile(filename, blob))
// }

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

  const { targetId } = props
  // 不在这里更新 roomId.value，因为要先确保对方能通话时才会显示语音浮动按钮，
  // 因此在 onJoin 中更新 roomId.value
  const _roomId = useGenRoomId(userInfo.value.id, targetId)
  globalSocket.value.emit(
    'unidirectional-web-rtc',
    _roomId,
    userInfo.value.nickname,
    targetId
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
  console.log(dashboardPanelRef.value)
  console.log(visualViewport.offsetTop)
  dashboardPanelRef.value.style.paddingTop = `${visualViewport.offsetTop}px`
  ;(msgContainerRef.value as any).scrollToBottom()
}

const onFocus = () => (expanded.value = false)

const onOpenFileSelector = target => target.click()

const onInputChange = async () => {
  const input = inputRef.value
  const { files } = input
  const file = files[0]
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = async () => {
    const { width, height } = img
    const timestamp = Date.now()
    const { targetId } = props
    try {
      const hash = await useGenHash(file)
      const { data } = await uploadImage(file, hash)
      const messageRecord: message = {
        type: 'image',
        hash,
        contact: userInfo.value.id,
        sender: userInfo.value.id,
        receiver: targetId,
        timestamp,
        width,
        height
      }
      globalSocket.value.emit(
        'send-msg',
        JSON.stringify({
          ...messageRecord,
          ossURL: `${import.meta.env.VITE_OSS_BASE_URL}${data}`
        })
      )
      messageRecord.sent = true
      messageRecord.contact = targetId

      const _lastMsgMap = lastMsgMap.value
      const isOverFiveMins = useIsOverFiveMins(
        messageRecord,
        _lastMsgMap,
        targetId
      )

      if (!_lastMsgMap[targetId]) {
        await useAddLastMsg(_lastMsgMap, lastMsgList, matchRes, targetId)
      }

      // 本地数据库中不需要保存临时的 url
      const [labelId, msgId] = await useAddMessageRecordToDB(
        isOverFiveMins,
        messageRecord,
        _lastMsgMap
      )
      messageRecord.url = url
      useAddMessageRecordToView(
        isOverFiveMins,
        messageRecord,
        messageList,
        labelId,
        msgId
      )
      useUpdateLastMsg(
        _lastMsgMap,
        { ...messageRecord, content: '[图片]' },
        false,
        true,
        unreadMsgCounter
      )
      ;(msgContainerRef.value as any).scrollToBottom()

      // 如果存在，说明本地中一定有，不用进行处理，不存在，不能说明本地中一定没有，
      // 可能是没有读取或者存储数量达到上限
      const _hashToBlobURLMap = hashToBlobURLMap.value
      if (!_hashToBlobURLMap.has(hash)) {
        const db = await useGetDB()
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
    } catch (error) {
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

  const timestamp = Date.now()
  const { targetId } = props
  const messageRecord: message = {
    type: 'text',
    content: _message,
    contact: userInfo.value.id,
    sender: userInfo.value.id,
    receiver: targetId,
    timestamp
  }
  try {
    globalSocket.value.emit('send-msg', JSON.stringify(messageRecord))
    messageRecord.sent = true
    messageRecord.contact = targetId

    const _lastMsgMap = lastMsgMap.value
    const isOverFiveMins = useIsOverFiveMins(
      messageRecord,
      _lastMsgMap,
      targetId
    )

    if (!_lastMsgMap[targetId]) {
      await useAddLastMsg(_lastMsgMap, lastMsgList, matchRes, targetId)
    }

    const [labelId, msgId] = await useAddMessageRecordToDB(
      isOverFiveMins,
      messageRecord,
      _lastMsgMap
    )
    useAddMessageRecordToView(
      isOverFiveMins,
      messageRecord,
      messageList,
      labelId,
      msgId
    )
    useUpdateLastMsg(_lastMsgMap, messageRecord, false, true, unreadMsgCounter)
    message.value = ''
    ;(msgContainerRef.value as any).scrollToBottom()
  } catch (error) {
    console.log(error)
    toast.add({ title: '发送失败', color: 'error', icon: 'lucide:annoyed' })
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
    item.timeAgo = useFormatTimeAgo(item.timestamp)
  }
}

watch(
  () => props.targetId,
  async v => {
    if (v) {
      lastFetchedId.value = Infinity
      await useGetMessages(hashToBlobURLMap, messageList, lastFetchedId, v)
      ;(msgContainerRef.value as any).scrollToBottom()
      const item = lastMsgMap.value[v]
      const unreadMsgs = item?.unreadMsgs

      if (item && unreadMsgs) {
        unreadMsgCounter.value -= unreadMsgs
        item.unreadMsgs = 0
        const db = await useGetDB()
        await db.put('lastMessages', JSON.parse(JSON.stringify(item)))
      }
    } else {
      messageList.value = []
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.isMatch) {
    updateTimeAgo()
    timer = setInterval(updateTimeAgo, 1000 * 60)
  }

  addVisualViewportListeners()
})

onBeforeUnmount(() => {
  clearInterval(timer)
  removeVisualViewportListeners()
  // 组件销毁时重置 targetId，这样其它地方就不用处理了
  _targetId.value = ''
})
</script>
