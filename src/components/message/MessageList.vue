<template>
  <UContextMenu
    :items="contextMenuItems"
    :ui="{
      content: 'w-48'
    }"
  >
    <div class="divide-default divide-y overflow-y-auto">
      <div
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
                      : 'hover:border-primary hover:bg-primary/5 border-(--ui-bg)'
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
                color: lastMsgMap[id].profile.online ? 'primary' : 'error'
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
                >
                </UBadge>
              </template>
              <template #description>
                <span class="flex-1 truncate">{{
                  lastMsgMap[id].content
                }}</span>
                <time>{{ lastMsgMap[id].timeAgo }}</time>
              </template>
            </UUser>
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
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'
import type { ContextMenuItem } from '@nuxt/ui'
import useDeleteMessageList from '@/hooks/use-delete-message-list'
import OverlayMessageView from '../overlay/OverlayMessageView.vue'

let timer = null
let contextmenuId = ''
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile, userInfo } = storeToRefs(useUserStore())
const {
  lastMsgMap,
  lastMsgList,
  activeTargetId,
  activeTargetProfile,
  activeTargetIds,
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
          activeTargetId,
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
          messageList,
          activeTargetId,
          lastFetchedId,
          false,
          false
        )
    }
  ]
])
const overlay = useOverlay()
const messageViewOverlay = overlay.create(OverlayMessageView)

const onClick = id => {
  if (activeTargetId.value === id) {
    return
  }

  activeTargetId.value = id
  activeTargetProfile.value = lastMsgMap.value[id].profile

  if (!isMobile.value && activeTargetIds.value.size) {
    activeTargetIds.value.clear()
    activeTargetIds.value.add(id)
  }
}

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
    activeTargetId,
    lastFetchedId,
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
    activeTargetId,
    true,
    true
  )

watch(activeTargetId, v => {
  if (!isMobile.value) {
    return
  }

  if (v) {
    messageViewOverlay.open({
      targetId: activeTargetId.value,
      targetProfile: activeTargetProfile.value
    })
  } else {
    messageViewOverlay.close()
  }
})

defineShortcuts({
  arrowdown: () => {
    const _lastMsgList = lastMsgList.value
    const _lastMsgMap = lastMsgMap.value
    const index = _lastMsgList.findIndex(id => id === activeTargetId.value)

    if (index === -1) {
      const _targetId = _lastMsgList[0]
      activeTargetId.value = _targetId
      activeTargetProfile.value = _lastMsgMap[_targetId].profile
    } else if (index < _lastMsgList.length - 1) {
      const _targetId = _lastMsgList[index + 1]
      activeTargetId.value = _targetId
      activeTargetProfile.value = _lastMsgMap[_targetId].profile
    }
  },
  arrowup: () => {
    const _lastMsgList = lastMsgList.value
    const _lastMsgMap = lastMsgMap.value
    const index = _lastMsgList.findIndex(id => id === activeTargetId.value)

    if (index === -1) {
      const _targetId = _lastMsgList[_lastMsgList.length - 1]
      activeTargetId.value = _targetId
      activeTargetProfile.value = _lastMsgMap[_targetId].profile
    } else if (index > 0) {
      const _targetId = _lastMsgList[index - 1]
      activeTargetId.value = _targetId
      activeTargetProfile.value = _lastMsgMap[_targetId].profile
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
