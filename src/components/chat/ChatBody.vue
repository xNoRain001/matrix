<template>
  <DynamicScroller
    :items="filteredItems"
    :min-item-size="44"
    :emit-update="true"
    ref="msgContainerRef"
    class="relative h-full p-4 sm:p-6"
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
          <div v-if="item.sent" class="flex items-start justify-end gap-3 pb-1">
            <UButton
              v-if="item.error"
              @click="onResendMsg(item)"
              icon="lucide:circle-alert"
              variant="ghost"
              color="error"
            />
            <div
              class="bg-muted max-w-3/4 rounded-xl px-4 py-2 break-all whitespace-pre-wrap"
            >
              {{ item.content }}
            </div>
            <UAvatar
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetProfile.nickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              class="bg-muted max-w-3/4 rounded-xl px-4 py-2 break-all whitespace-pre-wrap"
            >
              {{ item.content }}
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'image'">
          <div v-if="item.sent" class="flex items-start justify-end gap-3 pb-1">
            <UButton
              v-if="item.error"
              @click="onResendMsg(item)"
              icon="lucide:circle-alert"
              variant="ghost"
              color="error"
            />
            <img
              v-if="item.url"
              data-type="image"
              class="max-w-3/4 rounded-lg"
              :width="item.width"
              :height="item.height"
              :src="item.url"
            />
            <div
              v-else
              class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2"
            >
              <UIcon name="lucide:image-off" class="size-5" />
              图片已失效
            </div>
            <UAvatar
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetProfile.nickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <img
              v-if="item.url"
              data-type="image"
              class="max-w-3/4 rounded-lg"
              :width="item.width"
              :height="item.height"
              :src="item.url"
            />
            <div
              v-else
              class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2"
            >
              <UIcon name="lucide:image-off" class="size-5" />
              图片已失效
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'audio'">
          <div v-if="item.sent" class="flex items-start justify-end gap-3 pb-1">
            <UButton
              v-if="item.error"
              @click="onResendMsg(item)"
              icon="lucide:circle-alert"
              variant="ghost"
              color="error"
            />
            <div
              v-if="item.url"
              @click="onPlayAudio(item.url)"
              class="bg-muted flex flex-col gap-2 rounded-xl px-4 py-2"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="
                    playingURL === item.url
                      ? 'lucide:circle-pause'
                      : 'lucide:circle-play'
                  "
                  class="size-5"
                />
                <svg
                  v-if="playingURL === item.url"
                  class="size-5"
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
                <svg
                  v-else
                  class="size-5"
                  fill="currentColor"
                  viewBox="0 0 135 140"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="0" y="45" width="15" height="50" rx="6"></rect>
                  <rect x="30" y="30" width="15" height="90" rx="6"></rect>
                  <rect x="60" y="10" width="15" height="140" rx="6"></rect>
                  <rect x="90" y="30" width="15" height="90" rx="6"></rect>
                  <rect x="120" y="45" width="15" height="50" rx="6"></rect>
                </svg>
                <!-- <UIcon v-else name="lucide:audio-lines" class="size-5"></UIcon> -->
                <span>{{ item.duration }}''</span>
              </div>
              <!-- <USeparator label="识别结果" color="primary" />
              <div>Lorem ipsum dolor sit amet.</div> -->
            </div>
            <div
              v-else
              class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2"
            >
              <UIcon name="lucide:volume-off" class="size-5" />
              音频已失效
            </div>

            <UAvatar
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetProfile.nickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div
              v-if="item.url"
              @click="onPlayAudio(item.url)"
              class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2"
            >
              <UIcon
                :name="
                  playingURL === item.url
                    ? 'lucide:circle-pause'
                    : 'lucide:circle-play'
                "
                class="size-5"
              />
              <UIcon name="lucide:audio-lines" class="size-5" />
              <span>{{ item.duration }}''</span>
            </div>
            <div
              v-else
              class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2"
            >
              <UIcon name="lucide:volume-off" class="size-5" />
              音频已失效
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatCallTip'">
          <div v-if="item.sent" class="flex items-start justify-end gap-3 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone" class="size-5" />
              发起了语音通话
            </div>
            <UAvatar
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetProfile.nickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone" class="size-5" />
              发起了语音通话
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatCallOffTip'">
          <div v-if="item.sent" class="flex items-start justify-end gap-3 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-missed" class="size-5" />
              结束了语音通话
            </div>
            <UAvatar
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetProfile.nickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-missed" class="size-5" />
              结束了语音通话
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatRefuseTip'">
          <div v-if="item.sent" class="flex items-start justify-end gap-3 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-missed" class="size-5" />
              拒绝了语音通话
            </div>
            <UAvatar
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetProfile.nickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-missed" class="size-5" />
              拒绝了语音通话
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatAgreeTip'">
          <div v-if="item.sent" class="flex items-start justify-end gap-3 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone" class="size-5" />
              同意了语音通话
            </div>
            <UAvatar
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetProfile.nickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone" class="size-5" />
              同意了语音通话
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatAgreeButNoPermissionTip'">
          <div v-if="item.sent" class="flex items-start justify-end gap-3 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-missed" class="size-5" />
              权限不足
            </div>
            <UAvatar
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetProfile.nickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-missed" class="size-5" />
              权限不足
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'contactAgreeTip'">
          <div v-if="item.sent" class="flex items-start justify-end gap-3 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:smile" class="size-5" />
              {{ item.content }}
            </div>
            <UAvatar
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetProfile.nickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:smile" class="size-5" />
              同意了你的好友请求
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'random'">
          <!-- 打包时扫描所有可能 -->
          <UIcon name="lucide:dice-1" hidden />
          <UIcon name="lucide:dice-2" hidden />
          <UIcon name="lucide:dice-3" hidden />
          <UIcon name="lucide:dice-4" hidden />
          <UIcon name="lucide:dice-5" hidden />
          <UIcon name="lucide:dice-6" hidden />

          <div v-if="item.sent" class="flex items-start justify-end gap-3 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon :name="`lucide:dice-${item.content}`" class="size-16" />
            </div>
            <UAvatar
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-3 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetProfile.nickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon :name="`lucide:dice-${item.content}`" class="size-16" />
            </div>
          </div>
        </template>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
  <Transition
    enter-active-class="animate-[fade-in_200ms_ease-out]"
    leave-active-class="animate-[fade-out_200ms_ease-in]"
  >
    <div
      v-if="isAutoScrollBtnShow"
      class="fixed right-0 bottom-30 left-0 sm:bottom-50"
    >
      <UButton
        class="absolute left-1/2 -translate-x-1/2 rounded-full"
        variant="outline"
        color="neutral"
        icon="lucide:arrow-down"
        @click="(msgContainerRef as any).scrollToBottom()"
      />
    </div>
  </Transition>

  <!-- 音频播放器 -->
  <audio @ended="onEnded" ref="audioRef" hidden></audio>
</template>

<script lang="ts" setup>
import { useGetMessages } from '@/hooks'
import { sendMsg } from '@/hooks/use-send-msg'
import { useRecentContactsStore, useUserStore } from '@/store'
import { useThrottleFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import OverlayViewer from '@/components/overlay/OverlayViewer.vue'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'
import type { userInfo } from '@/types'

const { VITE_OSS_BASE_URL } = import.meta.env
const playingURL = ref('')
const props = defineProps<{
  isMatch: boolean
  targetId: string
  targetProfile: userInfo['profile']
}>()
const { config, isMobile, userInfo, avatarURL } = storeToRefs(useUserStore())
const {
  lastMsgMap,
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
const isAutoScrollBtnShow = ref(false)

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
  async ({ target: { scrollHeight, clientHeight, scrollTop } }) => {
    isAutoScrollBtnShow.value = scrollHeight - clientHeight - scrollTop > 400

    if (
      !skipUnshiftMessageRecord.value &&
      scrollTop === 0 &&
      lastFetchedId.value
    ) {
      const unshiftCount = await useGetMessages(
        userInfo.value.id,
        hashToBlobURLMap,
        messageList,
        lastFetchedId,
        props.targetId,
        true
      )

      if (unshiftCount) {
        ;(msgContainerRef.value as any).scrollToItem(unshiftCount)
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
    const { src, width, height } = target
    viewerOverlay.open({ urls: [{ url: src, width, height }] })
  } else if (
    type &&
    // 如果 contacts 中点击用户打开的空间中打开了聊天界面，聊天界面中点击
    // 对方头像不显示对方空间
    route.path !== '/contacts' &&
    // PC 端的匹配聊天界面中点击对方头像不显示对方空间
    !(props.isMatch && !isMobile.value)
  ) {
    profileSpaceOverlay.open({
      targetId: props.targetId,
      targetProfile: props.targetProfile
    })
  }
}

onBeforeUnmount(() => {
  ;(msgContainerRef.value as any).$el.removeEventListener('scroll', onScroll)
  msgContainerRef.value = null
})
</script>
