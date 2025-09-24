<template>
  <DynamicScroller
    :items="filteredItems"
    :min-item-size="44"
    :emit-update="true"
    ref="msgContainerRef"
    class="h-full p-4 sm:p-6"
    :class="chatBg ? 'bg-cover bg-center bg-no-repeat' : ''"
    :style="chatBg ? { 'background-image': `url(${chatBg})` } : {}"
    @update="onUpdate"
    @click="onClick"
    @scroll="onScroll"
  >
    <template #after>
      <div
        v-if="lastMsgMap[targetId]?.timeAgo"
        class="text-xs"
        :class="lastMsgMap[targetId]?.sent ? 'mr-13 flex justify-end' : 'ml-13'"
      >
        {{ lastMsgMap[targetId]?.timeAgo }}
      </div>
    </template>
    <template #default="{ item, active }">
      <DynamicScrollerItem :item="item" :active="active">
        <div v-if="item.type === 'label'" class="pt-3 pb-4 text-center text-sm">
          {{ formatTimestamp(item.timestamp) }}
        </div>
        <template v-else-if="item.type === 'text'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <UButton
              v-if="item.error"
              @click="onResendMsg(item)"
              icon="lucide:circle-alert"
              variant="ghost"
              color="error"
            ></UButton>
            <div
              class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2 break-words whitespace-pre-wrap"
            >
              {{ item.content }}
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              class="max-w-3/4 rounded-xl bg-(--ui-bg-muted) px-4 py-2 break-words whitespace-pre-wrap"
            >
              {{ item.content }}
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'image'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <UButton
              v-if="item.error"
              @click="onResendMsg(item)"
              icon="lucide:circle-alert"
              variant="ghost"
              color="error"
            ></UButton>
            <img
              v-if="item.url"
              class="max-w-3/4"
              :width="item.width"
              :height="item.height"
              :src="item.url"
            />
            <div
              v-else
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:image-off" class="size-5"></UIcon>
              图片已失效
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <img
              v-if="item.url"
              data-type="image"
              class="max-w-3/4"
              :width="item.width"
              :height="item.height"
              :src="item.url"
            />
            <div
              v-else
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:image-off" class="size-5"></UIcon>
              图片已失效
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'audio'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <UButton
              v-if="item.error"
              @click="onResendMsg(item)"
              icon="lucide:circle-alert"
              variant="ghost"
              color="error"
            ></UButton>
            <div
              v-if="item.url"
              @click="onPlayAudio(item.url)"
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              {{ item.duration }}''
              <UIcon
                :name="
                  playingURL === item.url
                    ? 'lucide:volume-2'
                    : 'lucide:audio-lines'
                "
                :class="playingURL === item.url ? 'rotate-180' : ''"
                class="size-5"
              ></UIcon>
            </div>
            <div
              v-else
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:volume-off" class="size-5"></UIcon>
              音频已失效
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              v-if="item.url"
              @click="onPlayAudio(item.url)"
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon
                :name="
                  playingURL === item.url
                    ? 'lucide:volume-2'
                    : 'lucide:audio-lines'
                "
                class="size-5"
              ></UIcon>
              {{ item.duration }}''
            </div>
            <div
              v-else
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:volume-off" class="size-5"></UIcon>
              音频已失效
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatCallTip'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:phone" class="size-5"></UIcon>
              发起了语音通话
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:phone" class="size-5"></UIcon>
              发起了语音通话
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatCallOffTip'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:phone-missed" class="size-5"></UIcon>
              结束了语音通话
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:phone-missed" class="size-5"></UIcon>
              结束了语音通话
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatRefuseTip'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:phone-missed" class="size-5"></UIcon>
              拒绝了语音通话
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:phone-missed" class="size-5"></UIcon>
              拒绝了语音通话
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatAgreeTip'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:phone" class="size-5"></UIcon>
              同意了语音通话
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:phone" class="size-5"></UIcon>
              同意了语音通话
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatAgreeButNoPermissionTip'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:phone-missed" class="size-5"></UIcon>
              权限不足
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:phone-missed" class="size-5"></UIcon>
              权限不足
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'contactAgreeTip'">
          <div
            v-if="item.sent"
            class="flex items-center justify-end gap-3 pb-1"
          >
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:smile" class="size-5"></UIcon>
              同意了你的好友请求
            </div>
            <UAvatar
              v-if="item.separator"
              :alt="userInfo.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-center gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              class="flex items-center gap-2 rounded-xl bg-(--ui-bg-muted) px-4 py-2"
            >
              <UIcon name="lucide:smile" class="size-5"></UIcon>
              同意了你的好友请求
            </div>
          </div>
        </template>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
  <!-- 音频播放器 -->
  <audio @ended="onEnded" ref="audioRef" hidden></audio>
</template>

<script lang="ts" setup>
import { useGetMessages } from '@/hooks'
import { sendMsg } from '@/hooks/use-send-msg'
import { useMatchStore, useRecentContactsStore, useUserStore } from '@/store'
import { useThrottleFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import OverlayViewer from '@/components/overlay/OverlayViewer.vue'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'

const playingURL = ref('')
const props = defineProps<{
  isMatch: boolean
}>()
const { config, isMobile, userInfo } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const {
  targetId,
  lastMsgMap,
  contactProfileMap,
  hashToBlobURLMap,
  msgContainerRef,
  messageList,
  lastFetchedId,
  skipUnshiftMessageRecord
} = storeToRefs(useRecentContactsStore())
const route = useRoute()
const items = ref([])
const search = ref('')
const updateParts = ref({
  viewStartIdx: 0,
  viewEndIdx: 0,
  visibleStartIdx: 0,
  visibleEndIdx: 0
})
const isMessage = computed(() => route.path === '/message')
const targetNickname = computed(() =>
  props.isMatch
    ? matchRes.value.nickname[0]
    : isMessage.value
      ? lastMsgMap.value[targetId.value].profile.nickname[0]
      : contactProfileMap.value[targetId.value].profile.nickname[0]
)
const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  // year: 'numeric',
  // month: 'long',
  // day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'long'
}
const filteredItems = computed(() => {
  if (!search.value) {
    return messageList.value
  }

  const lowerCaseSearch = search.value.toLowerCase()
  return items.value.filter(i =>
    i.message.toLowerCase().includes(lowerCaseSearch)
  )
})
const audioRef = ref(null)
const toast = useToast()
const overlay = useOverlay()
const viewerOverlay = overlay.create(OverlayViewer)
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)
const chatBg = computed(() => {
  const { isChatBgOpen, chatBg } = config.value.theme
  return isChatBgOpen && chatBg
})

const onResendMsg = messageRecord => {
  if (!messageRecord.resendArgs) {
    toast.add({
      title: '发送失败，数据已过期',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  } else {
    // @ts-ignore
    sendMsg(...messageRecord.resendArgs, true)
  }
}

const onEnded = () => (playingURL.value = '')

const onPlayAudio = url => {
  const audio = audioRef.value

  if (playingURL.value === url) {
    // 未播放完成时点击相同的音频，停止播放
    playingURL.value = ''
    audio.pause()
    audio.currentTime = 0
  } else {
    playingURL.value = url
    audio.src = url
    audio.play()
  }
}

const onScroll = useThrottleFn(
  async e => {
    if (
      !skipUnshiftMessageRecord.value &&
      e.target.scrollTop === 0 &&
      lastFetchedId.value
    ) {
      const unshiftCounter = await useGetMessages(
        userInfo.value.id,
        hashToBlobURLMap,
        messageList,
        lastFetchedId,
        targetId.value,
        true
      )

      if (unshiftCounter) {
        ;(msgContainerRef.value as any).scrollToItem(unshiftCounter)
      }
    }
  },
  200,
  true
)

const onUpdate = (
  viewStartIndex,
  viewEndIndex,
  visibleStartIndex,
  visibleEndIndex
) => {
  updateParts.value.viewStartIdx = viewStartIndex
  updateParts.value.viewEndIdx = viewEndIndex
  updateParts.value.visibleStartIdx = visibleStartIndex
  updateParts.value.visibleEndIdx = visibleEndIndex
}

const formatTimestamp = (timestamp: number) => {
  // TODO: 更久远的记录显示日期甚至年份
  return new Date(timestamp).toLocaleString('zh-CN', dateTimeFormatOptions)
}

const onClick = e => {
  const { target } = e
  const type =
    target.getAttribute('data-type') ||
    target.children[0]?.getAttribute('data-type')

  if (type === 'image') {
    viewerOverlay.open({ url: target.src })
  } else if (
    type &&
    // 如果 contacts 中点击用户打开的空间中打开了聊天界面，聊天界面中点击
    // 对方头像不显示对方空间
    route.path !== '/contacts' &&
    // PC 端的匹配聊天界面中点击对方头像不显示对方空间
    !(props.isMatch && !isMobile.value)
  ) {
    profileSpaceOverlay.open()
  }
}

onBeforeUnmount(() => {
  ;(msgContainerRef.value as any).$el.removeEventListener('scroll', onScroll)
  msgContainerRef.value = null
})
</script>
