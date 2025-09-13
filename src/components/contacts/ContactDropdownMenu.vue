<template>
  <UDropdownMenu :items="dropdownItems">
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import { addCandidate } from '@/apis/contact'
import { useDeleteContact } from '@/hooks'
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
    onSelect: async () => {
      try {
        const _targetId = targetId.value
        await addCandidate(_targetId)
        toast.add({ title: '已向对方发送好友申请', icon: 'lucide:smile' })
        const { id, nickname, region, birthday, gender } = userInfo.value
        const notification = {
          id,
          content: '请求添加你为好友',
          type: 'add-contact',
          createdAt: Date.now(),
          profile: {
            nickname,
            region,
            birthday,
            gender
          }
        }
        globalSocket.value.emit('add-contact', _targetId, notification)
      } catch (error) {
        toast.add({
          title: error.message,
          color: 'error',
          icon: 'lucide:annoyed'
        })
      }
    }
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
