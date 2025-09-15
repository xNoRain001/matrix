<template>
  <UDashboardPanel id="message-2">
    <MessageHeader @close="emits('close')" :is-match="isMatch"></MessageHeader>
    <!-- 聊天内容 -->
    <MessageDynamicScroller :is-match="isMatch"></MessageDynamicScroller>
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
  useAddMessageRecordToView,
  useAddMessageRecordToDB,
  useUpdateLastMsg,
  useGetDB,
  useGenHash,
  useInitLabelAndSeparator,
  useUUID
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
import { useRoute } from 'vue-router'

let first = true
let timer = null
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
  indexMap
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
    const timestamp = Date.now()
    const _targetId = targetId.value
    try {
      const hash = await useGenHash(file)
      const payload: message = {
        type: 'image',
        hash,
        contact: userInfo.value.id,
        sender: userInfo.value.id,
        receiver: _targetId,
        timestamp,
        width,
        height
      }
      const _lastMsgMap = lastMsgMap.value
      const messageRecord = {
        ...payload,
        url,
        sent: true,
        contact: _targetId
      }
      const label = useInitLabelAndSeparator(
        messageRecord,
        _lastMsgMap,
        _targetId
      )
      const indexdbLabel = label ? { ...label } : null
      // 本地数据库中不需要保存临时的 url
      const indexdbMessageRecord = { ...messageRecord, url: '' }

      if (label) {
        label.id = useUUID()
      }

      messageRecord.id = useUUID()
      // 为了用户体验，图片优先显示在本地
      useAddMessageRecordToView(label, messageRecord, messageList)
      ;(msgContainerRef.value as any).scrollToBottom()
      const { data } = await uploadImage(file, hash)
      payload.ossURL = `${import.meta.env.VITE_OSS_BASE_URL}${data}`
      globalSocket.value.emit('send-msg', JSON.stringify(payload))
      await useAddLastMsg(_lastMsgMap, lastMsgList, matchRes, _targetId)
      await useAddMessageRecordToDB(
        userInfo.value.id,
        indexdbLabel,
        indexdbMessageRecord
      )
      useUpdateLastMsg(
        userInfo.value.id,
        indexMap,
        lastMsgList,
        _lastMsgMap,
        // messageRecord 被保存到了内存中，因此不能修改它
        { ...messageRecord, content: '[图片]' },
        false,
        true,
        unreadMsgCounter
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
  const _targetId = targetId.value
  const payload: message = {
    type: 'text',
    content: _message,
    contact: userInfo.value.id,
    sender: userInfo.value.id,
    receiver: _targetId,
    timestamp
  }
  const _lastMsgMap = lastMsgMap.value
  const messageRecord = {
    ...payload,
    sent: true,
    contact: _targetId
  }
  const label = useInitLabelAndSeparator(messageRecord, _lastMsgMap, _targetId)
  const indexdbLabel = label ? { ...label } : null
  const indexdbMessageRecord = { ...messageRecord }

  if (label) {
    label.id = useUUID()
  }

  messageRecord.id = useUUID()

  useAddMessageRecordToView(label, messageRecord, messageList)
  globalSocket.value.emit('send-msg', JSON.stringify(payload))

  try {
    await useAddLastMsg(_lastMsgMap, lastMsgList, matchRes, _targetId)
    await useAddMessageRecordToDB(
      userInfo.value.id,
      indexdbLabel,
      indexdbMessageRecord
    )
    useUpdateLastMsg(
      userInfo.value.id,
      indexMap,
      lastMsgList,
      _lastMsgMap,
      messageRecord,
      false,
      true,
      unreadMsgCounter
    )
    ;(msgContainerRef.value as any).scrollToBottom()
  } catch (error) {
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
    item.timeAgo = useFormatTimeAgo(item.timestamp)
  }
}

// 由于组件上有基于 props.targetId 的 v-if，因此重置逻辑不能写在 watch 里，targetId
// 值被重置为 '' 时不会执行回调
watch(
  targetId,
  async v => {
    if (v) {
      // PC 端可能不关闭聊天界面点击其他用户列表的情况，如果不先重置 messageList 会
      // 造成切换后滚动条不一定在底部的问题，通过清空聊天记录，将设置 scrollTop 恢复
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
      await useGetMessages(
        userInfo.value.id,
        hashToBlobURLMap,
        messageList,
        lastFetchedId,
        v
      )
      ;(msgContainerRef.value as any).scrollToBottom()
      // 需要重置为 false，恢复拉取消息
      skipUnshiftMessageRecord.value = false

      const item = lastMsgMap.value[v]
      const unreadMsgs = item?.unreadMsgs

      if (item && unreadMsgs) {
        unreadMsgCounter.value -= unreadMsgs
        item.unreadMsgs = 0
        const db = await useGetDB(userInfo.value.id)
        await db.put('lastMessages', JSON.parse(JSON.stringify(item)))
      }
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
  // 组件销毁时重置相关值，这样其它地方就不用处理了，处于 contacts 下的聊天界面关闭
  // 时不重置 targetId，否则会造成空间也被关闭，在空间关闭时重置 targetId
  if (route.path !== '/contacts') {
    targetId.value = ''
  }

  messageList.value = []
  lastFetchedId.value = Infinity
})
</script>
