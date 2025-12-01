<template>
  <DynamicScroller
    :items="filteredMessageRecords"
    :min-item-size="44"
    :emit-update="true"
    ref="scrollerRef"
    class="h-full p-4 sm:p-6"
    :class="chatBg ? 'bg-cover bg-center bg-no-repeat' : ''"
    :style="chatBg ? { 'background-image': `url(${chatBg})` } : {}"
    @update="onUpdate"
    @click="onClick"
    @scroll="onScroll"
  >
    <template #before>
      <div
        v-if="targetProfile"
        class="ring-default bg-no-repeatr bg-elevated/50 relative mb-1 flex flex-col gap-2 rounded-lg bg-cover bg-center p-4 ring sm:p-6"
        :style="{
          backgroundImage: 'url(https://picsum.photos/640/640)'
          // backgroundImage: `url(${VITE_OSS_BASE_URL}spaceBg/${targetId})`
        }"
        @click="
          !activeSpaceTargetIds.has(targetId) &&
          profileSpaceOverlay.open({
            targetId
          })
        "
      >
        <UAvatar
          class="ring-accented ring-2"
          size="xl"
          :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
          :alt="targetNickname[0]"
        />
        <div v-if="targetProfile.bio" class="break-all">
          {{ targetProfile.bio }}
        </div>
        <div v-if="targetProfile.ocTags.length" class="flex flex-wrap gap-2">
          <ProfileSpaceTags :target-profile="targetProfile" />
        </div>
      </div>
    </template>
    <template #after>
      <div
        v-if="lastMsgMap[targetId]?.timeAgo"
        class="text-xs"
        :class="lastMsgMap[targetId]?.sent ? 'mr-12 flex justify-end' : 'ml-12'"
      >
        {{ lastMsgMap[targetId]?.timeAgo }}
      </div>
    </template>
    <template #default="{ item, active }">
      <DynamicScrollerItem :item="item" :active="active">
        <div
          v-if="item.type === 'label'"
          class="text-toned pt-3 pb-4 text-center text-sm"
        >
          {{ useFormatTimestamp(item.timestamp) }}
        </div>
        <template v-else-if="item.type === 'text'">
          <div v-if="item.sent" class="flex items-start justify-end gap-2 pb-1">
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
              data-type="avatar-self"
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-2 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetNickname"
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
          <div v-if="item.sent" class="flex items-start justify-end gap-2 pb-1">
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
              class="max-w-1/2 rounded-lg"
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
              data-type="avatar-self"
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-2 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <img
              v-if="item.url"
              data-type="image"
              class="max-w-1/2 rounded-lg"
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
          <div v-if="item.sent" class="flex items-start justify-end gap-2 pb-1">
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
              data-type="avatar-self"
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-2 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetNickname"
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
          <div v-if="item.sent" class="flex items-start justify-end gap-2 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-outgoing" class="size-5" />
              发起了语音通话
            </div>
            <UAvatar
              data-type="avatar-self"
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-2 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-outgoing" class="size-5" />
              发起了语音通话
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatCallOffTip'">
          <div v-if="item.sent" class="flex items-start justify-end gap-2 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-missed" class="size-5" />
              结束了语音通话
            </div>
            <UAvatar
              data-type="avatar-self"
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-2 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetNickname"
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
          <div v-if="item.sent" class="flex items-start justify-end gap-2 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-missed" class="size-5" />
              拒绝了语音通话
            </div>
            <UAvatar
              data-type="avatar-self"
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-2 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetNickname"
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
          <div v-if="item.sent" class="flex items-start justify-end gap-2 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-incoming" class="size-5" />
              同意了语音通话
            </div>
            <UAvatar
              data-type="avatar-self"
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-2 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetNickname"
              size="xl"
            />
            <div v-else class="w-10"></div>
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-incoming" class="size-5" />
              同意了语音通话
            </div>
          </div>
        </template>
        <template v-else-if="item.type === 'voiceChatAgreeButNoPermissionTip'">
          <div v-if="item.sent" class="flex items-start justify-end gap-2 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:phone-missed" class="size-5" />
              权限不足
            </div>
            <UAvatar
              data-type="avatar-self"
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-2 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetNickname"
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
          <div v-if="item.sent" class="flex items-start justify-end gap-2 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon name="lucide:smile" class="size-5" />
              {{ item.content }}
            </div>
            <UAvatar
              data-type="avatar-self"
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-2 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetNickname"
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

          <div v-if="item.sent" class="flex items-start justify-end gap-2 pb-1">
            <div class="bg-muted flex items-center gap-2 rounded-xl px-4 py-2">
              <UIcon :name="`lucide:dice-${item.content}`" class="size-16" />
            </div>
            <UAvatar
              data-type="avatar-self"
              v-if="item.separator"
              :src="avatarURL"
              :alt="userInfo.profile.nickname[0] || ''"
              size="xl"
            />
            <div v-else class="w-10"></div>
          </div>
          <div v-else class="flex items-start gap-2 pb-1">
            <UAvatar
              data-type="avatar"
              v-if="item.separator"
              :src="`${VITE_OSS_BASE_URL}avatar/${targetId}`"
              :alt="targetNickname"
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
  <!-- 滚动到底部 -->
  <Transition
    enter-active-class="animate-[fade-in_200ms_ease-out]"
    leave-active-class="animate-[fade-out_200ms_ease-in]"
  >
    <div v-if="isAutoScrollBtnShow" class="fixed top-16 right-0 left-0">
      <UButton
        class="absolute top-4 right-4 rounded-full sm:top-6 sm:right-6"
        variant="outline"
        color="neutral"
        icon="lucide:arrow-down"
        @click="scrollerRef.scrollToBottom()"
      />
    </div>
  </Transition>
  <!-- 收到新消息 -->
  <Transition
    enter-active-class="animate-[fade-in_200ms_ease-out]"
    leave-active-class="animate-[fade-out_200ms_ease-in]"
  >
    <div
      v-if="messageRecordMap[targetId]?.newMessageCount"
      class="fixed top-16 right-0 left-0"
    >
      <UButton
        class="absolute top-4 right-4 rounded-full sm:top-6 sm:right-6"
        variant="outline"
        color="neutral"
        icon="lucide:arrow-down"
        :label="`收到 ${messageRecordMap[targetId].newMessageCount} 条新消息`"
        @click="onScrollToBottom"
      />
    </div>
  </Transition>
  <!-- 音频播放器 -->
  <audio @ended="onEnded" ref="audioRef" hidden></audio>
</template>

<script lang="ts" setup>
import { useFormatTimeAgo, useFormatTimestamp, useGetDB } from '@/hooks'
import { sendMsg } from '@/hooks/use-send-msg'
import { useMessagesStore, useRecentContactsStore, useUserStore } from '@/store'
import { useThrottleFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import OverlayViewer from '@/components/overlay/OverlayViewer.vue'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'
import type { userInfo } from '@/types'
import { getProfile } from '@/apis/profile'

let timer = null
let lastFetchedMsgId = Number.MAX_SAFE_INTEGER
let skipUnshiftMessageRecord = false
const { VITE_OSS_BASE_URL } = import.meta.env
const playingURL = ref('')
const props = defineProps<{
  isMatch: boolean
  targetId: string
  targetNickname: string
}>()
const { config, userInfo, avatarURL } = storeToRefs(useUserStore())
const { lastMsgMap, hashToBlobURLMap, unreadMsgCounter, activeSpaceTargetIds } =
  storeToRefs(useRecentContactsStore())
const { messageRecordMap } = storeToRefs(useMessagesStore())
const keyword = ref('')
const updateParts = ref({
  viewStartIdx: 0,
  viewEndIdx: 0,
  visibleStartIdx: 0,
  visibleEndIdx: 0
})
const filteredMessageRecords = computed(() => {
  if (!keyword.value) {
    return messageRecordMap.value[props.targetId]?.messages || []
  }

  // const lowerCaseKeyword = keyword.value.toLowerCase()
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
const scrollerRef = useTemplateRef<any>('scrollerRef')
const targetProfile = ref(null)

const onScrollToBottom = () => {
  messageRecordMap.value[props.targetId].newMessageCount = 0
  scrollerRef.value.scrollToBottom()
}

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
    const t = messageRecordMap.value[props.targetId]
    isAutoScrollBtnShow.value = scrollHeight - clientHeight - scrollTop > 400

    if (scrollHeight - clientHeight - scrollTop < 10 && t.newMessageCount) {
      t.newMessageCount = 0
    }

    if (!skipUnshiftMessageRecord && scrollTop === 0 && lastFetchedMsgId) {
      const messages = await getMessages(true)
      const { length } = messages
      t.messages.unshift(...messages)

      if (length) {
        scrollerRef.value.scrollToItem(length)
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

const onClick = e => {
  const { target } = e
  const type = target.getAttribute('data-type')

  if (type === 'image') {
    const { src, width, height } = target
    viewerOverlay.open({ urls: [{ url: src, width, height }] })
  } else if (type === 'avatar') {
    const { targetId } = props
    !activeSpaceTargetIds.value.has(targetId) &&
      profileSpaceOverlay.open({
        targetId
      })
  } else if (type === 'avatar-self') {
    const { id } = userInfo.value
    !activeSpaceTargetIds.value.has(id) &&
      profileSpaceOverlay.open({
        targetId: id
      })
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

const resetUnreadMsgs = async () => {
  const item = lastMsgMap.value[props.targetId]
  // 如果当前打开的是非消息列表中对象的聊天界面，item 值为 undefined
  const unreadMsgs = item?.unreadMsgs

  if (item && unreadMsgs) {
    unreadMsgCounter.value -= unreadMsgs
    item.unreadMsgs = 0
    const db = await useGetDB(userInfo.value.id)
    await db.put('lastMessages', JSON.parse(JSON.stringify(item)))
  }
}

const formatMessages = async (id, data, hashToBlobURLMap) => {
  const db = await useGetDB(id)
  const tx = db.transaction('files', 'readonly')
  const _hashToBlobURLMap = hashToBlobURLMap.value

  for (let i = 0, l = data.length; i < l; i++) {
    const item = data[i]
    const { type, hash } = item

    if (type === 'image') {
      if (_hashToBlobURLMap.has(hash)) {
        item.url = _hashToBlobURLMap.get(hash)
        continue
      }

      try {
        const record = await tx.objectStore('files').get(hash)
        const url = URL.createObjectURL(record.blob)
        item.url = url
        if (_hashToBlobURLMap.size < 100) {
          _hashToBlobURLMap.set(hash, url)
        }
      } catch {}
    } else if (type === 'audio') {
      try {
        const record = await tx.objectStore('files').get(hash)
        const url = URL.createObjectURL(record.blob)
        item.url = url
      } catch {}
    }
  }

  await tx.done

  return data
}

const getMessages = async (unshift = false) => {
  const { targetId } = props
  const { id } = userInfo.value
  const messages = []
  const db = await useGetDB(id)
  const transaction = db.transaction('messages', 'readonly')
  const store = transaction.objectStore('messages')
  const index = store.index('contact_id')
  let cursor = await index.openCursor(
    IDBKeyRange.bound([targetId, 0], [targetId, lastFetchedMsgId], false, true),
    'prev'
  )

  // 第一次获取时没有数据或者倒数第二次正好获取了全部，最后一次获取时就没有数据了
  if (!cursor) {
    lastFetchedMsgId = 0
    return messages
  }

  let counter = 0
  while (cursor && counter < 30) {
    messages.unshift(cursor.value)
    counter++
    cursor = await cursor.continue()
  }

  lastFetchedMsgId = messages[0].id
  await formatMessages(id, messages, hashToBlobURLMap)

  if (unshift) {
    // 如果正好获取了 30 条，即使已经全部获取完了，还有机会额外触发一次
    if (messages.length < 30) {
      lastFetchedMsgId = 0
    }
  }

  return messages
}

const initMessages = async () => {
  messageRecordMap.value[props.targetId].messages = await getMessages()
  scrollerRef.value.scrollToBottom()
  await resetUnreadMsgs()
}

const initScroller = id => {
  messageRecordMap.value[id] = {}
  messageRecordMap.value[id].scroller = scrollerRef.value as HTMLElement
}

// PC 端可能无缝切换聊天对象
watch(
  () => props.targetId,
  async (v, oldValue) => {
    if (v) {
      // 切换为其他用户时，由于清空了消息，scrollTop 会先重置为 0 ，从而触发拉取消息
      // 的行为，需要跳过
      skipUnshiftMessageRecord = true
      delete messageRecordMap.value[oldValue]
      // 无缝切换到其他用户时，记录中不存在该用户，需要初始化
      initScroller(v)
      lastFetchedMsgId = Number.MAX_SAFE_INTEGER
      await initMessages()
      // 恢复拉取消息行为
      skipUnshiftMessageRecord = false
    }
  }
)

onMounted(async () => {
  initScroller(props.targetId)
  await initMessages()
  updateTimeAgo()
  timer = setInterval(updateTimeAgo, 1000 * 60)

  if (props.isMatch) {
    targetProfile.value = (await getProfile(props.targetId)).data
  }
})

onBeforeUnmount(() => {
  clearInterval(timer)
  delete messageRecordMap.value[props.targetId]
})
</script>
