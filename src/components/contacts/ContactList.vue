<template>
  <UContextMenu
    :items="contextMenuItems"
    :ui="{
      content: 'w-48'
    }"
  >
    <div class="divide-default divide-y overflow-y-auto">
      <div v-for="id in contactList" :key="id" @contextmenu="onContextmenu(id)">
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
              targetId === id
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
import { ref } from 'vue'
import { useDeleteContact } from '@/hooks'

let contextmenuId = ''
const { userInfo, globalSocket } = storeToRefs(useUserStore())
const { targetId, targetProfile, contactList, contactProfileMap } = storeToRefs(
  useRecentContactsStore()
)
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
          targetId
        )
    }
  ]
])

const onClick = id => {
  targetId.value = id
  targetProfile.value = contactProfileMap.value[id].profile
}

const onDeleteContact = id =>
  useDeleteContact(
    userInfo,
    id,
    contactList,
    contactProfileMap,
    globalSocket,
    toast,
    targetId
  )

const onContextmenu = id => (contextmenuId = id)

defineShortcuts({
  arrowdown: () => {
    const _contactList = contactList.value
    const _contactProfileMap = contactProfileMap.value
    const index = _contactList.findIndex(id => id === targetId.value)

    if (index === -1) {
      const _targetId = _contactList[0]
      targetId.value = _targetId
      targetProfile.value = _contactProfileMap[_targetId]
    } else if (index < _contactList.length - 1) {
      const _targetId = _contactList[index + 1]
      targetId.value = _contactList
      targetProfile.value = _contactProfileMap[_targetId]
    }
  },
  arrowup: () => {
    const _contactList = contactList.value
    const _contactProfileMap = contactProfileMap.value
    const index = _contactList.findIndex(id => id === targetId.value)

    if (index === -1) {
      const _targetId = _contactList[_contactList.length - 1]
      targetId.value = _targetId
      targetProfile.value = _contactProfileMap[_targetId].profile
    } else if (index > 0) {
      const _targetId = _contactList[index - 1]
      targetId.value = _targetId
      targetProfile.value = _contactProfileMap[_targetId].profile
    }
  }
})
</script>
