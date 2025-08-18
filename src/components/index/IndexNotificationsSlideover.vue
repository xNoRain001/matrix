<template>
  <USlideover v-model:open="isNotificationsSlideoverOpen" title="Notifications">
    <template #body>
      <RouterLink
        v-for="notification in notifications"
        :key="notification.id"
        :to="`/inbox?id=${notification.id}`"
        class="hover:bg-elevated/50 relative -mx-3 flex items-center gap-3 rounded-md px-3 py-2.5 first:-mt-3 last:-mb-3"
      >
        <UChip color="error" :show="!!notification.unread" inset>
          <UAvatar :alt="notification.sender.name" size="md" />
        </UChip>

        <div class="flex-1 text-sm">
          <p class="flex items-center justify-between">
            <span class="text-highlighted font-medium">{{
              notification.sender.name
            }}</span>

            <time
              :datetime="notification.date"
              class="text-muted text-xs"
              v-text="formatTimeAgo(new Date(notification.date))"
            />
          </p>

          <p class="text-dimmed">
            {{ notification.body }}
          </p>
        </div>
      </RouterLink>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'
import { useDashboard } from '@/hooks'

const { isNotificationsSlideoverOpen } = useDashboard()
const notifications = [
  {
    id: 1,
    unread: true,
    sender: {
      name: 'Jordan Xrown',
      email: 'jordan.xrown@example.com'
    },
    body: 'sent you a message',
    date: '1969-12-31T23:53:00.000Z'
  },
  {
    id: 2,
    sender: { name: 'Lindsay Walton' },
    body: 'subscribed to your email list',
    date: '1969-12-31T23:00:00.000Z'
  }
]
</script>
