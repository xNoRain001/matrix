<template>
  <UContextMenu
    :items="contextMenuItems"
    :ui="{
      content: 'w-48'
    }"
  >
    <div class="divide-default divide-y overflow-y-auto">
      <template v-if="isFirstGetContactsOnlineStatus">
        <div
          v-for="i in 5"
          :key="i"
          class="flex items-center gap-2.5 p-4 sm:px-6"
        >
          <USkeleton class="size-10 rounded-full" />

          <div class="grid flex-1 gap-2">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-4/5" />
          </div>
        </div>
      </template>
      <div
        v-else
        v-for="id in contactList"
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
                class="bg-error flex flex-1 items-center justify-center"
                @click="onDeleteContact(id)"
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
                alt: contactProfileMap[id].profile.nickname[0]
              }"
              size="xl"
              :chip="{
                color: contactProfileMap[id].profile?.onlineStatus?.isOnline
                  ? 'primary'
                  : 'error'
              }"
              :name="contactProfileMap[id].profile.nickname"
              :description="`${contactProfileMap[id].profile?.onlineStatus?.isOnline ? '在线' : formatLastOnline(contactProfileMap[id].profile?.onlineStatus?.lastOnline)}`"
              :ui="{
                wrapper: 'flex-1 min-w-0',
                name: 'truncate'
              }"
            />
          </div>
        </SlideItem>
      </div>
    </div>
  </UContextMenu>
</template>

<script setup lang="ts">
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import type { ContextMenuItem } from '@nuxt/ui'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  useDeleteContact,
  useFormatTimestamp,
  useRefreshOnlineStatus
} from '@/hooks'
import type { userInfo } from '@/types'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'
import { day, fiveMinutes, haldAnHour, hour, tenMinutes } from '@/const'

let timer = null
let contextmenuId = ''
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile, userInfo, globalSocket } = storeToRefs(useUserStore())
const {
  isSpaceOpen,
  activeTargetId,
  activeTargetProfile,
  activeSpaceTargetIds,
  contactList,
  contactProfileMap,
  isFirstGetContactsOnlineStatus
} = storeToRefs(useRecentContactsStore())
const toast = useToast()
const contextMenuItems = ref<ContextMenuItem[][]>([
  [
    {
      label: '删除好友',
      icon: 'i-lucide-triangle-alert',
      onSelect: () =>
        useDeleteContact(
          userInfo,
          contextmenuId,
          contactList,
          contactProfileMap,
          globalSocket,
          toast,
          activeSpaceTargetIds,
          isSpaceOpen
        )
    }
  ]
])
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)

const updateTarget = targetId => {
  activeTargetId.value = targetId
  activeTargetProfile.value = contactProfileMap.value[targetId].profile

  const _activeSpaceTargetIds = activeSpaceTargetIds.value

  // 无缝切换时，还需要手动更新 activeSpaceTargetIds 为新激活的项
  if (_activeSpaceTargetIds.size === 1) {
    _activeSpaceTargetIds.clear()
    _activeSpaceTargetIds.add(targetId)
  }

  isSpaceOpen.value = true
}

const onClick = targetId => {
  const targetProfile = contactProfileMap.value[targetId].profile

  if (isMobile.value) {
    profileSpaceOverlay.open({
      targetId,
      targetProfile
    })
  } else {
    activeTargetId.value = targetId
    activeTargetProfile.value = targetProfile
    isSpaceOpen.value = true
  }
}

const onDeleteContact = id =>
  useDeleteContact(
    userInfo,
    id,
    contactList,
    contactProfileMap,
    globalSocket,
    toast,
    activeSpaceTargetIds,
    isSpaceOpen
  )

const formatLastOnline = timestamp => {
  if (timestamp === 0) {
    return '最后在线于：7 天前'
  }

  const diff = Date.now() - timestamp

  return diff < fiveMinutes
    ? '刚刚在线'
    : diff < tenMinutes
      ? '10 分钟内在线'
      : diff < haldAnHour
        ? '30 分钟内在线'
        : diff < hour
          ? '1 小时内在线'
          : diff < day
            ? '24 小时内在线'
            : `最后在线于：${useFormatTimestamp(timestamp)}`
}

defineShortcuts({
  arrowdown: () => {
    const _contactList = contactList.value
    const index = _contactList.findIndex(id => id === activeTargetId.value)

    if (index === -1) {
      updateTarget(_contactList[0])
    } else if (index < _contactList.length - 1) {
      updateTarget(_contactList[index + 1])
    }
  },
  arrowup: () => {
    const _contactList = contactList.value
    const index = _contactList.findIndex(id => id === activeTargetId.value)

    if (index === -1) {
      updateTarget(_contactList[_contactList.length - 1])
    } else if (index > 0) {
      updateTarget(_contactList[index - 1])
    }
  }
})

onMounted(async () => {
  timer = useRefreshOnlineStatus(globalSocket, 'contactList', contactList.value)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
