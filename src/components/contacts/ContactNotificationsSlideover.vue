<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    v-model:open="isNotificationsSlideoverOpen"
    title="好友申请"
    description=" "
    :ui="{
      body: 'p-0 sm:p-0',
      description: 'hidden'
    }"
  >
    <template #body>
      <div
        v-if="contactNotifications.length"
        v-for="(
          { _id, targetId, targetProfile: { nickname }, createdAt, content },
          index
        ) in contactNotifications"
        :key="_id"
        class="bg-elevated/50 border-b-accented/50 cursor-pointer rounded-none border-b p-4 sm:p-6"
        @click="
          !activeSpaceTargetIds.has(targetId) &&
          profileSpaceOverlay.open({
            targetId
          })
        "
      >
        <UUser
          :avatar="{
            src: `${VITE_OSS_BASE_URL}avatar/${targetId}`,
            alt: nickname[0]
          }"
          size="xl"
          :ui="{
            wrapper: 'flex-1 min-w-0',
            name: 'flex justify-between items-center gap-2',
            description: 'flex justify-between gap-2'
          }"
        >
          <template #name>
            <span class="truncate">{{ nickname }}</span>
            <UButton
              @click.stop="onDelete(index)"
              color="error"
              label="删除"
              size="xs"
            />
          </template>
          <template #description>
            <span class="flex-1 truncate">{{ content }}</span>
            <time>{{ useFormatTimeAgo(createdAt) }}</time>
          </template>
        </UUser>
      </div>
      <div v-else class="flex h-full items-center justify-center">
        <UIcon name="lucide:bell" class="text-dimmed size-32" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  useNotificationsStore,
  useRecentContactsStore,
  useUserStore
} from '@/store'
import { useFormatTimeAgo } from '@/hooks'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'

const { VITE_OSS_BASE_URL } = import.meta.env
const isNotificationsSlideoverOpen = defineModel<boolean>()
const { userInfo, isMobile } = storeToRefs(useUserStore())
const { activeSpaceTargetIds } = storeToRefs(useRecentContactsStore())
const { contactNotifications } = storeToRefs(useNotificationsStore())
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)

const onDelete = index => {
  const _contactNotifications = contactNotifications.value
  _contactNotifications.splice(index, 1)
  localStorage.setItem(
    `contactNotifications-${userInfo.value.id}`,
    JSON.stringify(_contactNotifications)
  )
}
</script>
