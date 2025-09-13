<template>
  <UDropdownMenu :items="dropdownItems">
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import { useAddContact, useDeleteContact } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const toast = useToast()
const { contactProfileMap, contactList, targetId } = storeToRefs(
  useRecentContactsStore()
)
const { globalSocket, userInfo } = storeToRefs(useUserStore())
const isFriend = computed(() =>
  Boolean(contactProfileMap.value[targetId.value])
)
const addContact = [
  {
    label: '添加好友',
    icon: 'lucide:circle-plus',
    onSelect: () => useAddContact(userInfo, targetId, globalSocket, toast)
  }
]
const deleteContact = [
  {
    label: '删除好友',
    icon: 'i-lucide-triangle-alert',
    onSelect: () =>
      useDeleteContact(
        userInfo,
        targetId.value,
        contactList,
        contactProfileMap,
        globalSocket,
        toast,
        targetId
      )
  }
]
const dropdownItems = computed(() =>
  isFriend.value ? deleteContact : addContact
)
</script>
