<template>
  <UDropdownMenu :items="dropdownItems">
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import {
  useAddContact,
  useClearMessageRecord,
  useHideMessageList
} from '@/hooks'
import useDeleteMessageList from '@/hooks/use-delete-message-list'
import { useRecentContactsStore, useUserStore } from '@/store'
import type { userInfo } from '@/types'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = withDefaults(
  defineProps<{
    isMatch?: boolean
    targetId: string
    targetProfile: userInfo['profile']
  }>(),
  {
    isMatch: false
  }
)
const toast = useToast()
const {
  activeTargetId,
  contactProfileMap,
  lastMsgMap,
  lastMsgList,
  messageList,
  lastFetchedId,
  indexMap,
  unreadMsgCounter
} = storeToRefs(useRecentContactsStore())
const { globalSocket, userInfo } = storeToRefs(useUserStore())
const isFriend = computed(() =>
  Boolean(contactProfileMap.value[props.targetId])
)
const route = useRoute()
const isContacts = computed(() => route.path === '/contacts')
const deleteList = {
  label: '删除列表',
  icon: 'lucide:circle-x',
  onSelect: () => {
    const _targetId = props.targetId
    useDeleteMessageList(
      userInfo,
      _targetId,
      unreadMsgCounter,
      indexMap,
      lastMsgList,
      lastMsgMap,
      messageList,
      activeTargetId,
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
      props.targetId,
      messageList,
      lastMsgMap,
      activeTargetId,
      lastFetchedId
    )
  }
}
const addContact = {
  label: '添加好友',
  icon: 'lucide:circle-plus',
  onSelect: () => useAddContact(userInfo, props.targetId, globalSocket, toast)
}
const dropdownItems = computed(() =>
  isFriend.value
    ? props.isMatch
      ? [deleteMessageRecord]
      : isContacts.value
        ? [deleteMessageRecord]
        : [
            // 好友才提供隐藏列表的选项，这个操作能保留聊天记录
            {
              label: '隐藏列表',
              icon: 'lucide:eye-off',
              onSelect: () => {
                const _targetId = props.targetId
                useHideMessageList(
                  userInfo,
                  _targetId,
                  unreadMsgCounter,
                  indexMap,
                  lastMsgList,
                  lastMsgMap,
                  activeTargetId
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
