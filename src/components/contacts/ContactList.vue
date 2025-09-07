<template>
  <div class="divide-default divide-y overflow-y-auto">
    <div
      v-for="({ id, profile: { nickname } }, index) in contactList"
      :key="index"
    >
      <div
        class="flex cursor-pointer items-center gap-4 border-l-2 p-4 text-base transition-colors sm:px-6"
        :class="[
          'text-toned',
          selectContactId === id
            ? 'border-primary bg-primary/10'
            : 'hover:border-primary hover:bg-primary/5 border-(--ui-bg)'
        ]"
        @click="selectContactId = id"
      >
        <UChip inset color="primary" size="3xl">
          <UAvatar :text="nickname[0]"></UAvatar>
        </UChip>

        {{ nickname }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRecentContactsStore } from '@/store'
import { storeToRefs } from 'pinia'

const selectContactId = defineModel<string>()
const { contactList } = storeToRefs(useRecentContactsStore())

defineShortcuts({
  arrowdown: () => {
    const _contactList = contactList.value
    const index = _contactList.findIndex(
      item => item.id === selectContactId.value
    )

    if (index === -1) {
      selectContactId.value = _contactList[0].id
    } else if (index < _contactList.length - 1) {
      selectContactId.value = _contactList[index + 1].id
    }
  },
  arrowup: () => {
    const _contactList = contactList.value
    const index = _contactList.findIndex(
      item => item.id === selectContactId.value
    )

    if (index === -1) {
      selectContactId.value = _contactList[_contactList.length - 1].id
    } else if (index > 0) {
      selectContactId.value = _contactList[index - 1].id
    }
  }
})
</script>
