<template>
  <UContextMenu
    :items="contextMenuItems"
    :ui="{
      content: 'w-48'
    }"
  >
    <div class="divide-default divide-y overflow-y-auto">
      <div
        v-for="({ id, profile: { nickname } }, index) in contactList"
        :key="index"
        @contextmenu="onContextmenu(id)"
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
              targetId === id
                ? 'border-primary bg-primary/10 text-highlighted'
                : 'hover:border-primary hover:bg-primary/5 text-toned border-(--ui-bg)'
            ]"
            @click="targetId = id"
          >
            <UChip inset color="primary" size="3xl">
              <UAvatar :text="nickname[0]"></UAvatar>
            </UChip>

            {{ nickname }}
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
const { targetId, contactList, contactProfileMap } = storeToRefs(
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
    const index = _contactList.findIndex(item => item.id === targetId.value)

    if (index === -1) {
      targetId.value = _contactList[0].id
    } else if (index < _contactList.length - 1) {
      targetId.value = _contactList[index + 1].id
    }
  },
  arrowup: () => {
    const _contactList = contactList.value
    const index = _contactList.findIndex(item => item.id === targetId.value)

    if (index === -1) {
      targetId.value = _contactList[_contactList.length - 1].id
    } else if (index > 0) {
      targetId.value = _contactList[index - 1].id
    }
  }
})
</script>
