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
            class="flex w-full cursor-pointer items-center gap-4 border-l-2 p-4 text-sm transition-colors sm:px-6"
            :class="[
              targetId === id
                ? 'border-primary bg-primary/10 text-highlighted'
                : 'hover:border-primary hover:bg-primary/5 text-toned border-(--ui-bg)'
            ]"
            @click="onClick(id)"
          >
            <UChip
              inset
              :color="lastMsgMap[id].online ? 'primary' : 'error'"
              size="3xl"
            >
              <UAvatar :text="lastMsgMap[id].profile.nickname[0]"></UAvatar>
            </UChip>

            <div class="w-[calc(100%-4rem)]">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  {{ lastMsgMap[id].profile.nickname }}
                </div>
                <span>{{ lastMsgMap[id].timeAgo }}</span>
              </div>
              <div class="flex items-center justify-between">
                <p class="truncate">
                  {{ lastMsgMap[id].content }}
                </p>
                <UBadge
                  v-if="lastMsgMap[id].unreadMsgs"
                  inset
                  color="primary"
                  :show="Boolean(lastMsgMap[id].unreadMsgs)"
                  :label="lastMsgMap[id].unreadMsgs"
                  size="sm"
                >
                </UBadge>
              </div>
            </div>
          </div>
        </SlideItem>
      </div>
    </div>
  </UContextMenu>
</template>

<script setup lang="ts">
import { useFormatTimeAgo, useHideMessageList } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, onBeforeUnmount, onMounted } from 'vue'
import type { ContextMenuItem } from '@nuxt/ui'
import useDeleteMessageList from '@/hooks/use-delete-message-list'

let timer = null
let contextmenuId = ''
const { userInfo } = storeToRefs(useUserStore())
const {
  lastMsgMap,
  lastMsgList,
  targetId,
  targetProfile,
  messageList,
  lastFetchedId,
  contactProfileMap,
  indexMap,
  unreadMsgCounter
} = storeToRefs(useRecentContactsStore())
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
          unreadMsgCounter,
          indexMap,
          lastMsgList,
          lastMsgMap,
          messageList,
          targetId,
          lastFetchedId
        )
    }
  ]
])

const onClick = id => {
  targetId.value = id
  targetProfile.value = lastMsgMap.value[id].profile
}

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
    unreadMsgCounter,
    indexMap,
    lastMsgList,
    lastMsgMap,
    messageList,
    targetId,
    lastFetchedId
  )

const onHideMessageList = id =>
  useHideMessageList(
    userInfo,
    id,
    unreadMsgCounter,
    indexMap,
    lastMsgList,
    lastMsgMap,
    targetId
  )

defineShortcuts({
  arrowdown: () => {
    const _lastMsgList = lastMsgList.value
    const _lastMsgMap = lastMsgMap.value
    const index = _lastMsgList.findIndex(id => id === targetId.value)

    if (index === -1) {
      const _targetId = _lastMsgList[0]
      targetId.value = _targetId
      targetProfile.value = _lastMsgMap[_targetId].profile
    } else if (index < _lastMsgList.length - 1) {
      const _targetId = _lastMsgList[index + 1]
      targetId.value = _targetId
      targetProfile.value = _lastMsgMap[_targetId].profile
    }
  },
  arrowup: () => {
    const _lastMsgList = lastMsgList.value
    const _lastMsgMap = lastMsgMap.value
    const index = _lastMsgList.findIndex(id => id === targetId.value)

    if (index === -1) {
      const _targetId = _lastMsgList[_lastMsgList.length - 1]
      targetId.value = _targetId
      targetProfile.value = _lastMsgMap[_targetId].profile
    } else if (index > 0) {
      const _targetId = _lastMsgList[index - 1]
      targetId.value = _targetId
      targetProfile.value = _lastMsgMap[_targetId].profile
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
