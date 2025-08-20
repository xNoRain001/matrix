<template>
  <div class="divide-default divide-y overflow-y-auto">
    <div
      v-for="(user, index) in users"
      :key="index"
      :ref="
        el => {
          usersRefs[user.id] = el as Element
        }
      "
    >
      <div
        class="flex cursor-pointer items-center gap-4 border-l-2 p-4 text-sm transition-colors sm:px-6"
        :class="[
          'text-toned',
          // user.unread ? 'text-highlighted' : 'text-toned',
          selectedUser?.id === user.id
            ? 'border-primary bg-primary/10'
            : 'hover:border-primary hover:bg-primary/5 border-(--ui-bg)'
        ]"
        @click="selectedUser = user"
      >
        <UChip inset color="error" :text="5" size="3xl">
          <UAvatar :text="user.nickname[0]"></UAvatar>
        </UChip>

        <div class="w-[calc(100%-4rem)]">
          <!-- :class="[user.unread && 'font-semibold']" -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              {{ user.nickname }}

              <UChip :color="Math.random() > 0.5 ? 'primary' : 'error'" />
            </div>

            <span>17:20</span>
            <!-- <span>{{ isToday(new Date(user.date)) ? format(new Date(user.date), 'HH:mm') : format(new Date(user.date), 'dd MMM') }}</span> -->
          </div>
          <p class="truncate">
            {{ user.latestMsg }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
// import { format, isToday } from 'date-fns'

const props = defineProps<{
  users: any
}>()

const usersRefs = ref<Element[]>([])

const selectedUser = defineModel() as any

watch(selectedUser, () => {
  if (!selectedUser.value) {
    return
  }
  const ref = usersRefs.value[selectedUser.value.id]
  if (ref) {
    ref.scrollIntoView({ block: 'nearest' })
  }
})

defineShortcuts({
  arrowdown: () => {
    const index = props.users.findIndex(
      user => user.id === selectedUser.value?.id
    )

    if (index === -1) {
      selectedUser.value = props.users[0]
    } else if (index < props.users.length - 1) {
      selectedUser.value = props.users[index + 1]
    }
  },
  arrowup: () => {
    const index = props.users.findIndex(
      user => user.id === selectedUser.value?.id
    )

    if (index === -1) {
      selectedUser.value = props.users[props.users.length - 1]
    } else if (index > 0) {
      selectedUser.value = props.users[index - 1]
    }
  }
})
</script>
