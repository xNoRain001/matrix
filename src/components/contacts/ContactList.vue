<template>
  <div class="divide-default divide-y overflow-y-auto">
    <div v-for="id in contactList" :key="id">
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
            color: contactProfileMap[id].profile.onlineStatus?.isOnline
              ? 'primary'
              : 'error'
          }"
          :name="contactProfileMap[id].profile.nickname"
          :description="`${contactProfileMap[id].profile.onlineStatus?.isOnline ? '在线' : formatLastOnline(contactProfileMap[id].profile.onlineStatus?.lastOnline)}`"
          :ui="{
            wrapper: 'flex-1 min-w-0',
            name: 'truncate'
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted } from 'vue'
import { useFormatTimestamp, useRefreshOnlineStatus } from '@/hooks'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'
import { day, fiveMinutes, haldAnHour, hour, tenMinutes } from '@/const'

let timer = null
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile, globalSocket } = storeToRefs(useUserStore())
const {
  isSpaceOpen,
  activeTargetId,
  activeTargetNickname,
  activeSpaceTargetIds,
  contactList,
  contactProfileMap
} = storeToRefs(useRecentContactsStore())
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)

const updateTarget = targetId => {
  activeTargetId.value = targetId
  activeTargetNickname.value =
    contactProfileMap.value[targetId].profile.nickname

  const _activeSpaceTargetIds = activeSpaceTargetIds.value

  // 无缝切换时，还需要手动更新 activeSpaceTargetIds 为新激活的项
  if (_activeSpaceTargetIds.size === 1) {
    _activeSpaceTargetIds.clear()
    _activeSpaceTargetIds.add(targetId)
  }

  isSpaceOpen.value = true
}

const onClick = targetId => {
  if (isMobile.value) {
    profileSpaceOverlay.open({
      targetId
    })
  } else {
    activeTargetId.value = targetId
    activeTargetNickname.value =
      contactProfileMap.value[targetId].profile.nickname
    isSpaceOpen.value = true
  }
}

const formatLastOnline = timestamp => {
  if (timestamp === undefined) {
    return '最后在线于：未知'
  }

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
