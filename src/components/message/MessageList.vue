<template>
  <UContextMenu
    :items="contextMenuItems"
    :ui="{
      content: 'w-48'
    }"
  >
    <div class="divide-default divide-y overflow-y-auto">
      <div v-for="id in lastMsgList" :key="id" @contextmenu="onContextmenu(id)">
        <SlideItem>
          <template #right>
            <div class="flex flex-1 text-sm font-semibold">
              <!-- <div class="bg-secondary flex flex-1 items-center justify-center">
                批量
              </div> -->
              <div
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
            class="flex w-full cursor-pointer items-center gap-4 border-l-2 p-4 text-sm transition-colors sm:px-6"
            :class="[
              targetId === id
                ? 'border-primary bg-primary/10 text-highlighted'
                : 'hover:border-primary hover:bg-primary/5 text-toned border-(--ui-bg)'
            ]"
            @click="targetId = id"
          >
            <UChip
              inset
              color="error"
              :show="Boolean(lastMsgMap[id].unreadMsgs)"
              :text="lastMsgMap[id].unreadMsgs"
              size="3xl"
            >
              <UAvatar :text="lastMsgMap[id].profile.nickname[0]"></UAvatar>
            </UChip>

            <div class="w-[calc(100%-4rem)]">
              <!-- :class="[user.unread && 'font-semibold']" -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  {{ lastMsgMap[id].profile.nickname }}
                  <!-- <UChip :color="Math.random() > 0.5 ? 'primary' : 'error'" /> -->
                </div>

                <span>{{ lastMsgMap[id].timeAgo }}</span>
                <!-- <span>{{ isToday(new Date(user.date)) ? format(new Date(user.date), 'HH:mm') : format(new Date(user.date), 'dd MMM') }}</span> -->
              </div>
              <p class="truncate">
                {{ lastMsgMap[id].content }}
              </p>
            </div>
          </div>
        </SlideItem>
      </div>
    </div>
  </UContextMenu>
</template>

<script setup lang="ts">
import {
  useClearMessageRecord,
  useFormatTimeAgo,
  useHideMessageList
} from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, onBeforeUnmount, onMounted } from 'vue'
import type { ContextMenuItem } from '@nuxt/ui'
import useDeleteMessageList from '@/hooks/use-delete-message-list'

let timer = null
let contextmenuId = ''
const { userInfo } = storeToRefs(useUserStore())
const { lastMsgMap, lastMsgList, targetId, messageList, lastFetchedId } =
  storeToRefs(useRecentContactsStore())
const contextMenuItems = ref<ContextMenuItem[][]>([
  [
    {
      label: '隐藏列表',
      icon: 'lucide:eye-off',
      onSelect: () =>
        useHideMessageList(
          userInfo,
          contextmenuId,
          lastMsgList,
          lastMsgMap,
          targetId
        )
    },
    {
      label: '删除列表',
      icon: 'lucide:circle-x',
      onSelect: () =>
        useDeleteMessageList(
          userInfo,
          contextmenuId,
          lastMsgList,
          lastMsgMap,
          messageList,
          targetId,
          lastFetchedId
        )
    },
    {
      label: '删除聊天记录',
      icon: 'lucide:circle-arrow-out-up-right',
      onSelect: () =>
        useClearMessageRecord(
          userInfo,
          contextmenuId,
          messageList,
          lastMsgMap,
          targetId,
          lastFetchedId
        )
    }
  ]
])

const onContextmenu = id => (contextmenuId = id)

const updateTimeAgo = () => {
  const _lastMsgList = lastMsgList.value
  const _lastMsgMap = lastMsgMap.value

  for (let i = 0, l = _lastMsgList.length; i < l; i++) {
    const item = _lastMsgMap[_lastMsgList[i]]
    const { timestamp } = item

    if (timestamp) {
      item.timeAgo = useFormatTimeAgo(timestamp)
    }
  }
}

const onDeleteMessageList = id =>
  useDeleteMessageList(
    userInfo,
    id,
    lastMsgList,
    lastMsgMap,
    messageList,
    targetId,
    lastFetchedId
  )

const onHideMessageList = id =>
  useHideMessageList(userInfo, id, lastMsgList, lastMsgMap, targetId)

defineShortcuts({
  arrowdown: () => {
    const _lastMsgList = lastMsgList.value
    const index = _lastMsgList.findIndex(id => id === targetId.value)

    if (index === -1) {
      targetId.value = _lastMsgList[0]
    } else if (index < _lastMsgList.length - 1) {
      targetId.value = _lastMsgList[index + 1]
    }
  },
  arrowup: () => {
    const _lastMsgList = lastMsgList.value
    const index = _lastMsgList.findIndex(id => id === targetId.value)

    if (index === -1) {
      targetId.value = _lastMsgList[_lastMsgList.length - 1]
    } else if (index > 0) {
      targetId.value = _lastMsgList[index - 1]
    }
  }
})

onMounted(() => {
  updateTimeAgo()
  timer = setInterval(updateTimeAgo, 2 * 1000 * 60)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
