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

    <ContactList v-if="contactList.length" v-model="selectContactId" />
    <div
      v-if="isMobile && !contactList.length"
      class="flex flex-1 items-center justify-center"
    >
      <UIcon name="lucide:user-round" class="text-dimmed size-32" />
    </div>
  </UDashboardPanel>

  <ProfileSpace
    v-if="!isMobile && selectContactId"
    @close="selectContactId = ''"
    :select-contact-id="selectContactId"
  ></ProfileSpace>
  <div
    v-if="!isMobile && !selectContactId"
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
      <ProfileSpace
        v-if="selectContactId"
        @close="selectContactId = ''"
        :select-contact-id="selectContactId"
      ></ProfileSpace>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { getContacts } from '@/apis/contact'
import { useRefreshContacts } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import type { users } from '@/types'
import { storeToRefs } from 'pinia'
import { onMounted, ref, computed } from 'vue'

const users = ref<users>([])
const selectContactId = ref('')
const toast = useToast()
const isNotificationsSlideoverOpen = ref(false)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { contactList, contactProfileMap, contactNotifications } = storeToRefs(
  useRecentContactsStore()
)
const isOpenSlideover = computed({
  get() {
    return Boolean(selectContactId.value)
  },
  set(value: boolean) {
    if (!value) {
      selectContactId.value = ''
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
})
</script>
