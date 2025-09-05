<template>
  <div class="divide-default divide-y overflow-y-auto">
    <div v-for="(user, index) in users" :key="index">
      <div
        class="flex cursor-pointer items-center gap-4 border-l-2 p-4 text-base transition-colors sm:px-6"
        :class="[
          'text-toned',
          selectedUser?.id === user.id
            ? 'border-primary bg-primary/10'
            : 'hover:border-primary hover:bg-primary/5 border-(--ui-bg)'
        ]"
        @click="selectedUser = user"
      >
        <UChip inset color="primary" size="3xl">
          <UAvatar :text="user.profile.nickname[0]"></UAvatar>
        </UChip>

        {{ user.profile.nickname }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import type { user, users } from '@/types'
import type { Ref } from 'vue'

const props = defineProps<{
  users: users
}>()
const selectedUser = defineModel() as Ref<user>

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
