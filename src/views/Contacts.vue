<template>
  <UDashboardPanel
    id="contact-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
    :class="isMobile ? 'pb-16' : ''"
  >
    <ContactHeader />
    <ContactList v-if="contactList.length" />
    <div
      v-if="isMobile && !contactList.length"
      class="flex flex-1 items-center justify-center"
    >
      <UIcon name="lucide:user-round" class="text-dimmed size-32" />
    </div>
  </UDashboardPanel>
  <template v-if="!isMobile">
    <ProfileSpace
      v-if="isSpaceOpen"
      @close="onClose"
      :target-id="activeTargetId"
    />
    <div v-else class="flex flex-1 items-center justify-center">
      <UIcon name="lucide:user-round" class="text-dimmed size-32" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { getContacts } from '@/apis/contact'
import { useRefreshContacts } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import type { userInfo } from '@/types'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted } from 'vue'

const toast = useToast()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const {
  isSpaceOpen,
  activeTargetId,
  activeTargetNickname,
  contactList,
  contactProfileMap
} = storeToRefs(useRecentContactsStore())

const refreshContactsProfile = async () => {
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

const onClose = () => {
  isSpaceOpen.value = false
  activeTargetId.value = ''
  activeTargetNickname.value = ''
}

onMounted(async () => {
  await refreshContactsProfile()
})

onBeforeUnmount(() => {
  if (isSpaceOpen.value) {
    onClose()
  }
})
</script>
