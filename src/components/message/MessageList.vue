<template>
  <UContextMenu
    :items="contextMenuItems"
    :ui="{
      content: 'w-48'
    }"
  >
    <div class="divide-default divide-y overflow-y-auto">
      <Skeleton v-if="isFirstGetChatsOnlineStatus" :count="5" />
      <div
        v-else
        v-for="id in lastMsgList"
        :key="id"
        @contextmenu="contextmenuId = id"
      >
        <SlideItem>
          <template #right>
            <div class="flex flex-1 text-sm font-semibold">
              <!-- <div class="bg-secondary flex flex-1 items-center justify-center">
                批量
              </div> -->
              <div
                v-if="contactProfileMap[id]"
                class="bg-primary flex flex-1 items-center justify-center"
                @click="onHideMessageList(id)"
              >
                隐藏
              </div>
              <div
                class="bg-error flex flex-1 items-center justify-center"
                @click="onDeleteMessageList(id)"
              >
                删除
              </div>
            </div>
          </template>
          <div
            class="w-full cursor-pointer p-4 transition-colors sm:px-6"
            :class="
              isMobile
                ? []
                : [
                    'border-l-2',
                    activeTargetId === id
                      ? 'border-primary bg-primary/10'
                      : 'hover:border-primary hover:bg-primary/5 border-bg'
                  ]
            "
            @click="onClick(id)"
          >
            <UUser
              :avatar="{
                src: `${VITE_OSS_BASE_URL}avatar/${id}`,
                alt: lastMsgMap[id].profile.nickname[0]
              }"
              size="xl"
              :chip="{
                color: lastMsgMap[id].profile.onlineStatus?.isOnline
                  ? 'primary'
                  : 'error'
              }"
              :ui="{
                wrapper: 'flex-1 min-w-0',
                name: 'flex justify-between items-center gap-2',
                description: 'flex justify-between gap-2'
              }"
            >
              <template #name>
                <span class="truncate">
                  {{ lastMsgMap[id].profile.nickname }}
                </span>
                <UBadge
                  v-if="lastMsgMap[id].unreadMsgs"
                  inset
                  color="primary"
                  :show="Boolean(lastMsgMap[id].unreadMsgs)"
                  :label="lastMsgMap[id].unreadMsgs"
                  size="sm"
                />
              </template>
              <template #description>
                <span class="flex-1 truncate">
                  {{ lastMsgMap[id].content }}
                </span>
                <time>{{ useFormatTimestamp(lastMsgMap[id].timestamp) }}</time>
              </template>
            </UUser>
          </div>
        </SlideItem>
      </div>
    </div>
  </UContextMenu>
</template>

<script setup lang="ts">
import {
  useFormatTimestamp,
  useHideMessageList,
  useRefreshOnlineStatus
} from '@/hooks'
import { useMessagesStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, onBeforeUnmount, onMounted } from 'vue'
import type { ContextMenuItem } from '@nuxt/ui'
import useDeleteMessageList from '@/hooks/use-delete-message-list'
import OverlayChat from '@/components/overlay/OverlayChat.vue'

let timer = null
let contextmenuId = ''
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile, userInfo, globalSocket } = storeToRefs(useUserStore())
const {
  isChatOpen,
  lastMsgMap,
  lastMsgList,
  activeTargetId,
  activeTargetIds,
  activeTargetNickname,
  contactProfileMap,
  indexMap,
  unreadMsgCounter,
  isFirstGetChatsOnlineStatus
} = storeToRefs(useRecentContactsStore())
const { messageRecordMap } = storeToRefs(useMessagesStore())
const contextMenuItems = ref<ContextMenuItem[][]>([
  [
    {
      label: '隐藏列表',
      icon: 'lucide:eye-off',
      onSelect: () =>
        useHideMessageList(
          userInfo,
          contextmenuId,
          unreadMsgCounter,
          indexMap,
          lastMsgList,
          lastMsgMap,
          activeTargetIds,
          isChatOpen,
          activeTargetId,
          activeTargetNickname,
          false,
          false
        )
    },
    {
      label: '删除列表',
      icon: 'lucide:circle-x',
      onSelect: () =>
        useDeleteMessageList(
          userInfo,
          contextmenuId,
          unreadMsgCounter,
          indexMap,
          lastMsgList,
          lastMsgMap,
          messageRecordMap,
          activeTargetIds,
          isChatOpen,
          activeTargetId,
          activeTargetNickname,
          false,
          false
        )
    }
  ]
])
const overlay = useOverlay()
const chatOverlay = overlay.create(OverlayChat)

const updateTarget = targetId => {
  activeTargetId.value = targetId
  activeTargetNickname.value = lastMsgMap.value[targetId].profile.nickname

  const _activeTargetIds = activeTargetIds.value

  // 无缝切换时，还需要手动更新 activeTargetIds 为新激活的项
  if (_activeTargetIds.size === 1) {
    _activeTargetIds.clear()
    _activeTargetIds.add(targetId)
  }

  isChatOpen.value = true
}

const onClick = targetId => {
  const targetNickname = lastMsgMap.value[targetId].profile.nickname

  if (isMobile.value) {
    chatOverlay.open({
      targetId,
      targetNickname
    })
  } else {
    activeTargetId.value = targetId
    activeTargetNickname.value = targetNickname
    isChatOpen.value = true
  }
}

const onDeleteMessageList = id =>
  useDeleteMessageList(
    userInfo,
    id,
    unreadMsgCounter,
    indexMap,
    lastMsgList,
    lastMsgMap,
    messageRecordMap,
    activeTargetIds,
    isChatOpen,
    activeTargetId,
    activeTargetNickname,
    true,
    true
  )

const onHideMessageList = id =>
  useHideMessageList(
    userInfo,
    id,
    unreadMsgCounter,
    indexMap,
    lastMsgList,
    lastMsgMap,
    activeTargetIds,
    isChatOpen,
    activeTargetId,
    activeTargetNickname,
    true,
    true
  )

defineShortcuts({
  arrowdown: () => {
    const _lastMsgList = lastMsgList.value
    const index = _lastMsgList.findIndex(id => id === activeTargetId.value)

    if (index === -1) {
      // 在没有打开任何聊天时，按向下箭头，此时 index 为 -1, index + 1 表示激活列表中
      // 的第一个
      updateTarget(_lastMsgList[0])
    } else if (index < _lastMsgList.length - 1) {
      // index >= 0 时，index + 1 表示激活列表中的下一个
      updateTarget(_lastMsgList[index + 1])
    }
  },
  arrowup: () => {
    const _lastMsgList = lastMsgList.value
    const index = _lastMsgList.findIndex(id => id === activeTargetId.value)

    if (index === -1) {
      // 在没有打开任何聊天时，按向上箭头，此时 index 为 -1,
      // _lastMsgList.length - 1 表示激活列表中的最后一个
      updateTarget(_lastMsgList[_lastMsgList.length - 1])
    } else if (index > 0) {
      // index >= 0 时，index - 1 表示激活列表中的上一个
      updateTarget(_lastMsgList[index - 1])
    }
  }
})

onMounted(() => {
  timer = useRefreshOnlineStatus(globalSocket, 'messageList', lastMsgList.value)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
