<template>
  <UDashboardPanel
    id="contact-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
    :class="isMobile ? 'pb-16' : ''"
    :ui="{}"
  >
    <UDashboardNavbar title="好友">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>

      <template #right>
        <UTooltip text="通知">
          <UButton
            color="neutral"
            variant="ghost"
            square
            @click="isNotificationsSlideoverOpen = true"
          >
            <UChip
              :show="Boolean(unreadContactNotificationCount)"
              color="error"
              inset
            >
              <UIcon name="i-lucide-bell" class="text-primary size-5" />
            </UChip>
          </UButton>
        </UTooltip>
      </template>
    </UDashboardNavbar>

    <ContactList v-if="contactList.length" />
    <div
      v-if="isMobile && !contactList.length"
      class="flex flex-1 items-center justify-center"
    >
      <UIcon name="lucide:user-round" class="text-dimmed size-32" />
    </div>
  </UDashboardPanel>

  <ProfileSpace
    v-if="!isMobile && activeTargetId"
    @close="activeTargetId = ''"
    :target-id="activeTargetId"
    :target-profile="activeTargetProfile"
  ></ProfileSpace>
  <div
    v-if="!isMobile && !activeTargetId"
    class="flex flex-1 items-center justify-center"
  >
    <UIcon name="lucide:user-round" class="text-dimmed size-32" />
  </div>

  <!-- 好友申请通知 -->
  <ContactNotificationsSlideover v-model="isNotificationsSlideoverOpen" />
</template>

<script setup lang="ts">
import { getContacts } from '@/apis/contact'
import { useRefreshContacts, useRefreshOnline } from '@/hooks'
import {
  useNotificationsStore,
  useRecentContactsStore,
  useUserStore
} from '@/store'
import type { userInfo } from '@/types'
import { storeToRefs } from 'pinia'
import { onMounted, ref, onBeforeUnmount, watch } from 'vue'

let timer = null
const toast = useToast()
const isNotificationsSlideoverOpen = ref(false)
const { isMobile, userInfo, globalSocket } = storeToRefs(useUserStore())
const { activeTargetId, activeTargetProfile, contactList, contactProfileMap } =
  storeToRefs(useRecentContactsStore())
const { unreadContactNotificationCount } = storeToRefs(useNotificationsStore())

const initContactList = async () => {
  const now = Date.now()
  const expired =
    now >
    Number(localStorage.getItem(`contactListExpireAt-${userInfo.value.id}`))

  // 过期，获取所有好友的最新资料
  if (expired) {
    try {
      const { data } = await getContacts()
      useRefreshContacts(
        userInfo.value.id,
        data,
        contactList,
        contactProfileMap
      )
    } catch (error) {
      toast.add({
        title: error.message,
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }
  }
}

watch(isNotificationsSlideoverOpen, v => {
  if (v && unreadContactNotificationCount.value) {
    unreadContactNotificationCount.value = 0
    localStorage.setItem(
      `unreadContactNotificationCount-${userInfo.value.id}`,
      '0'
    )
  }
})

onMounted(async () => {
  await initContactList()
  timer = useRefreshOnline(globalSocket, 'contactList', contactList.value)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
