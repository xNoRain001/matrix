<template>
  <UContextMenu
    :items="contextMenuItems"
    :ui="{
      content: 'w-48'
    }"
  >
    <div class="divide-default divide-y overflow-y-auto">
      <div
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
            class="flex w-full cursor-pointer items-center gap-4 border-l-2 p-4 text-base transition-colors sm:px-6"
            :class="[
              activeTargetId === id
                ? 'border-primary bg-primary/10 text-highlighted'
                : 'hover:border-primary hover:bg-primary/5 text-toned border-(--ui-bg)'
            ]"
            @click="onClick(id)"
          >
            <UChip
              inset
              :color="contactProfileMap[id].online ? 'primary' : 'error'"
              size="3xl"
            >
              <UAvatar
                :text="contactProfileMap[id].profile.nickname[0]"
              ></UAvatar>
            </UChip>

            {{ contactProfileMap[id].profile.nickname }}
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
import { ref, watch } from 'vue'
import { useDeleteContact } from '@/hooks'
import type { userInfo } from '@/types'
import OverlayProfileSpace from '../overlay/OverlayProfileSpace.vue'

let contextmenuId = ''
const { isMobile, userInfo, globalSocket } = storeToRefs(useUserStore())
const {
  activeTargetId,
  activeTargetProfile,
  activeTargetIds,
  contactList,
  contactProfileMap
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
      activeTargetId.value = _contactList
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
</script>
