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
            >
            </UUser>
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
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDeleteContact, useRefreshOnlineStatus } from '@/hooks'
import type { userInfo } from '@/types'
import OverlayProfileSpace from '../overlay/OverlayProfileSpace.vue'

let timer = null
let contextmenuId = ''
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile, userInfo, globalSocket } = storeToRefs(useUserStore())
const {
  activeTargetId,
  activeTargetProfile,
  activeTargetIds,
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
          activeTargetId,
          activeTargetProfile
        )
    }
  ]
])
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)
const minute = 60 * 1000
const fiveMinutes = 5 * minute
const tenMinutes = 10 * minute
const hour = 60 * minute
const day = 24 * hour
const haldAnHour = 1000 * 60 * 30

const onClick = id => {
  if (activeTargetId.value === id) {
    return
  }

  activeTargetId.value = id
  activeTargetProfile.value = contactProfileMap.value[id].profile

  // pc 端可以无缝切换好友，如果在打开了空间时点击其他联系人，由于空间没有销毁，因此
  // 需要手动更新 id
  if (!isMobile.value && activeTargetIds.value.size) {
    activeTargetIds.value.clear()
    activeTargetIds.value.add(id)
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
    activeTargetId,
    activeTargetProfile
  )

const formatLastOnline = timestamp => {
  if (timestamp === 0) {
    return '最后在线于：7 天前'
  }

  const now = Date.now()
  const diff = now - timestamp

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
            : `最后在线于：${new Date(timestamp).toLocaleString('zh-CN', {
                day: '2-digit'
              })}`
}

watch(activeTargetId, v => {
  if (!isMobile.value) {
    return
  }

  if (v) {
    profileSpaceOverlay.open({
      targetId: activeTargetId.value,
      targetProfile: activeTargetProfile.value
    })
  } else {
    profileSpaceOverlay.close()
  }
})

defineShortcuts({
  arrowdown: () => {
    const _contactList = contactList.value
    const _contactProfileMap = contactProfileMap.value
    const index = _contactList.findIndex(id => id === activeTargetId.value)

    if (index === -1) {
      const _targetId = _contactList[0]
      activeTargetId.value = _targetId
      activeTargetProfile.value = _contactProfileMap[_targetId].profile
    } else if (index < _contactList.length - 1) {
      const _targetId = _contactList[index + 1]
      activeTargetId.value = _targetId
      activeTargetProfile.value = _contactProfileMap[_targetId].profile
    }
  },
  arrowup: () => {
    const _contactList = contactList.value
    const _contactProfileMap = contactProfileMap.value
    const index = _contactList.findIndex(id => id === activeTargetId.value)

    if (index === -1) {
      const _targetId = _contactList[_contactList.length - 1]
      activeTargetId.value = _targetId
      activeTargetProfile.value = _contactProfileMap[_targetId].profile
    } else if (index > 0) {
      const _targetId = _contactList[index - 1]
      activeTargetId.value = _targetId
      activeTargetProfile.value = _contactProfileMap[_targetId].profile
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
