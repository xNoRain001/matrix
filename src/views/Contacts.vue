<template>
  <UDashboardPanel
    id="contact-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
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
              :show="Boolean(contactNotifications.length)"
              color="error"
              inset
            >
              <UIcon
                name="i-lucide-bell"
                class="text-primary size-5 shrink-0"
              />
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
    v-if="!isMobile && targetId"
    @close="targetId = ''"
  ></ProfileSpace>
  <div
    v-if="!isMobile && !targetId"
    class="flex flex-1 items-center justify-center"
  >
    <UIcon name="lucide:user-round" class="text-dimmed size-32" />
  </div>

  <!-- 好友申请通知 -->
  <ContactNotificationsSlideover v-model="isNotificationsSlideoverOpen" />

  <!-- 移动端点击用户进入的个人空间 -->
  <!-- class="max-w-none" 实现平板全屏 -->
  <USlideover
    v-if="isMobile"
    v-model:open="isOpenSlideover"
    title=" "
    description=" "
  >
    <template #content>
      <ProfileSpace v-if="targetId" @close="targetId = ''"></ProfileSpace>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { getContacts } from '@/apis/contact'
import { useRefreshContacts, useRefreshOnline } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'

let timer = null
const toast = useToast()
const isNotificationsSlideoverOpen = ref(false)
const { isMobile, userInfo, globalSocket } = storeToRefs(useUserStore())
const { targetId, contactList, contactProfileMap, contactNotifications } =
  storeToRefs(useRecentContactsStore())
const isOpenSlideover = computed({
  get() {
    return Boolean(targetId.value)
  },
  set(value: boolean) {
    if (!value) {
      targetId.value = ''
    }
  }
})

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

onMounted(async () => {
  await initContactList()
  timer = useRefreshOnline(globalSocket, 'contactList', contactList.value)
})

onBeforeUnmount(() => {
  targetId.value = ''
  clearTimeout(timer)
})
</script>
