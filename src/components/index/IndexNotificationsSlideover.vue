<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="Notifications"
    description=" "
  >
    <template #body>
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="hover:bg-elevated/50 relative -mx-3 flex items-center gap-3 rounded-md px-3 py-2.5 first:-mt-3 last:-mb-3"
      >
        <UChip color="error" :show="!!notification.unread" inset>
          <UAvatar :text="notification.profile.nickname[0]" size="md" />
        </UChip>

        <div class="flex-1 text-sm">
          <p class="flex items-center justify-between">
            <span class="text-highlighted font-medium">{{
              notification.profile.nickname
            }}</span>

            <time
              :datetime="notification.date"
              class="text-muted text-xs"
              v-text="formatTimeAgo(new Date(notification.createdAt))"
            />
          </p>

          <p class="text-dimmed">
            {{ notification.desc }}
          </p>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'
import { useDashboard } from '@/hooks'
import { onMounted, ref } from 'vue'
import { getCandidates } from '@/apis/contact'

const { isNotificationsSlideoverOpen } = useDashboard()
const notifications = ref([])
const toast = useToast()

const _initNotifications = async () => {
  try {
    const { data } = await getCandidates()
    localStorage.setItem('notifications', JSON.stringify(data))
    notifications.value = data
  } catch (error) {
    toast.add({ title: error.message, color: 'error' })
  }
}

const initNotifications = () => {
  const localNotifications = localStorage.getItem('notifications')

  if (!localNotifications) {
    _initNotifications()
  } else {
    try {
      notifications.value = JSON.parse(localNotifications)
    } catch (error) {
      // 数据被修改，重新从接口获取
      localStorage.removeItem('notifications')
      _initNotifications()
    }
  }
}

onMounted(async () => {
  initNotifications()
})
</script>
