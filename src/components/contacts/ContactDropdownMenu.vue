<template>
  <USlideover
    v-if="isMobile"
    title="好友信息"
    description=" "
    :ui="{ body: 'space-y-4', description: 'hidden' }"
  >
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />

    <template #body>
      <UPageCard variant="subtle">
        <UFormField
          label="备注"
          class="flex items-center justify-between gap-2 not-last:pb-4"
        >
          <UIcon name="lucide:chevron-right" class="size-5"></UIcon>
        </UFormField>
      </UPageCard>
      <UPageCard variant="subtle">
        <UFormField
          label="添加好友"
          class="flex items-center justify-between gap-2 not-last:pb-4"
        >
          <UIcon name="lucide:chevron-right" class="size-5"></UIcon>
        </UFormField>
      </UPageCard>
      <UPageCard variant="subtle">
        <UFormField
          label="删除好友"
          class="flex items-center justify-between gap-2 not-last:pb-4"
        >
          <UIcon name="lucide:chevron-right" class="size-5"></UIcon>
        </UFormField>
      </UPageCard>
      <UPageCard variant="subtle">
        <UFormField
          label="举报"
          class="flex items-center justify-between gap-2 not-last:pb-4"
        >
          <UIcon name="lucide:chevron-right" class="size-5"></UIcon>
        </UFormField>
      </UPageCard>
    </template>
  </USlideover>
  <UDropdownMenu v-else :items="dropdownItems">
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import { useAddContact, useDeleteContact } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{ targetId: string }>()
const toast = useToast()
const { activeTargetId, activeTargetProfile, contactProfileMap, contactList } =
  storeToRefs(useRecentContactsStore())
const { globalSocket, userInfo, isMobile } = storeToRefs(useUserStore())
const isFriend = computed(() =>
  Boolean(contactProfileMap.value[props.targetId])
)
const addContact = [
  {
    label: '添加好友',
    icon: 'lucide:circle-plus',
    onSelect: () => useAddContact(userInfo, props.targetId, globalSocket, toast)
  }
]
const deleteContact = [
  {
    label: '删除好友',
    icon: 'i-lucide-triangle-alert',
    onSelect: () =>
      useDeleteContact(
        userInfo,
        props.targetId,
        contactList,
        contactProfileMap,
        globalSocket,
        toast,
        activeTargetId,
        activeTargetProfile
      )
  }
]
const dropdownItems = computed(() =>
  isFriend.value ? deleteContact : addContact
)
</script>
