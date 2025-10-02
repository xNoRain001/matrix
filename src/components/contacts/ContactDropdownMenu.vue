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

const props = defineProps<{ targetId: string }>()
const toast = useToast()
const { activeTargetId, activeTargetProfile, contactProfileMap, contactList } =
  storeToRefs(useRecentContactsStore())
const { globalSocket, userInfo } = storeToRefs(useUserStore())
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
