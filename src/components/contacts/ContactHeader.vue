<template>
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

  <!-- 好友申请通知 -->
  <ContactNotificationsSlideover v-model="isNotificationsSlideoverOpen" />
</template>

<script lang="ts" setup>
import { useNotificationsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

const isNotificationsSlideoverOpen = ref(false)
const { userInfo } = storeToRefs(useUserStore())
const { unreadContactNotificationCount } = storeToRefs(useNotificationsStore())

watch(isNotificationsSlideoverOpen, v => {
  if (v && unreadContactNotificationCount.value) {
    unreadContactNotificationCount.value = 0
    localStorage.setItem(
      `unreadContactNotificationCount-${userInfo.value.id}`,
      '0'
    )
  }
})
</script>
