<template>
  <UDropdownMenu :items="dropdownItems">
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import { addCandidate } from '@/apis/contact'
import { useClearMessageRecord, useHideMessageList } from '@/hooks'
import useDeleteMessageList from '@/hooks/use-delete-message-list'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = withDefaults(defineProps<{ isMatch?: boolean }>(), {
  isMatch: false
})
const toast = useToast()
const {
  contactProfileMap,
  lastMsgMap,
  lastMsgList,
  messageList,
  lastFetchedId,
  targetId
} = storeToRefs(useRecentContactsStore())
const { globalSocket, userInfo } = storeToRefs(useUserStore())
const isFriend = computed(() =>
  Boolean(contactProfileMap.value[targetId.value])
)
const route = useRoute()
const isContacts = computed(() => route.path === '/contacts')
const deleteList = {
  label: '删除列表',
  icon: 'lucide:circle-x',
  onSelect: () => {
    const _targetId = targetId.value
    useDeleteMessageList(
      userInfo,
      _targetId,
      lastMsgList,
      lastMsgMap,
      messageList,
      targetId,
      lastFetchedId
    )
  }
}
const deleteMessageRecord = {
  label: '清空聊天记录',
  icon: 'lucide:circle-arrow-out-up-right',
  onSelect: () => {
    useClearMessageRecord(
      userInfo,
      targetId.value,
      messageList,
      lastMsgMap,
      targetId,
      lastFetchedId
    )
  }
}
const addContact = {
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
const dropdownItems = computed(() =>
  isFriend.value
    ? props.isMatch
      ? [deleteMessageRecord]
      : isContacts
        ? [deleteMessageRecord]
        : [
            // 好友才提供隐藏列表的选项，这个操作能保留聊天记录
            {
              label: '隐藏列表',
              icon: 'lucide:eye-off',
              onSelect: () => {
                const _targetId = targetId.value
                useHideMessageList(
                  userInfo,
                  _targetId,
                  lastMsgList,
                  lastMsgMap,
                  targetId
                )
              }
            },
            deleteList,
            deleteMessageRecord
          ]
    : props.isMatch
      ? [deleteMessageRecord, addContact]
      : [deleteList, deleteMessageRecord, addContact]
)
</script>
