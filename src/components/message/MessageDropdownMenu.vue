<template>
  <USlideover
    v-if="isMobile"
    title="聊天信息"
    description=" "
    :ui="{ content: 'max-w-none', body: 'space-y-4', description: 'hidden' }"
    v-model:open="isOverlayOpen"
  >
    <UButton
      @click="isOverlayOpen = true"
      icon="lucide:ellipsis"
      color="neutral"
      variant="ghost"
    />
    <template #body>
      <UPageCard
        variant="subtle"
        :ui="{ container: 'divide-y divide-default' }"
      >
        <UFormField
          v-for="({ label, onSelect }, index) in dropdownItems"
          :key="index"
          :label="label"
          class="flex items-center justify-between gap-2 not-last:pb-4"
          @click="onSelect"
        >
          <UIcon name="lucide:chevron-right" class="size-5"></UIcon>
        </UFormField>
      </UPageCard>
    </template>
  </USlideover>
  <UDropdownMenu v-else :items="dropdownItems">
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
  </UDropdownMenu>
  <defineOverlayTemplate>
    <UButton
      label="取消"
      color="neutral"
      class="justify-center"
      @click="isConfirmOverlayOpen = false"
    />
    <UButton
      label="确认"
      class="justify-center"
      @click="
        title === '删除列表'
          ? onDeleteList()
          : title === '隐藏列表'
            ? onHideList()
            : onDeleteMessageRecord()
      "
    />
  </defineOverlayTemplate>
  <UDrawer
    v-if="isMobile"
    v-model:open="isConfirmOverlayOpen"
    :title="title"
    :description="description"
  >
    <template #footer>
      <reuseOverlayTemplate></reuseOverlayTemplate>
    </template>
  </UDrawer>
  <UModal
    v-else
    v-model:open="isConfirmOverlayOpen"
    :title="title"
    :description="description"
  >
    <template #footer>
      <reuseOverlayTemplate></reuseOverlayTemplate>
    </template>
  </UModal>
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
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import OverlayPublisher from '../overlay/OverlayPublisher.vue'

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
const emits = defineEmits(['close'])
const toast = useToast()
const [defineOverlayTemplate, reuseOverlayTemplate] = createReusableTemplate()
const {
  activeTargetId,
  activeTargetIds,
  contactProfileMap,
  lastMsgMap,
  lastMsgList,
  messageList,
  lastFetchedId,
  indexMap,
  unreadMsgCounter
} = storeToRefs(useRecentContactsStore())
const { globalSocket, userInfo, isMobile } = storeToRefs(useUserStore())
const isFriend = computed(() =>
  Boolean(contactProfileMap.value[props.targetId])
)
const route = useRoute()
const isConfirmOverlayOpen = ref(false)
const isOverlayOpen = ref(false)
const isMessage = computed(() => route.path === '/message')
const title = ref('')
const description = ref(' ')
const deleteList = {
  label: '删除列表',
  icon: 'lucide:circle-x',
  onSelect: () => {
    title.value = '删除列表'
    description.value = '该操作会删除聊天记录'
    isConfirmOverlayOpen.value = true
  }
}
const deleteMessageRecord = {
  label: '清空聊天记录',
  icon: 'lucide:circle-arrow-out-up-right',
  onSelect: () => {
    title.value = '清空聊天记录'
    description.value = '该操作会删除聊天记录'
    isConfirmOverlayOpen.value = true
  }
}
const addContact = {
  label: '添加好友',
  icon: 'lucide:circle-plus',
  onSelect: () => useAddContact(props.targetId, globalSocket, toast)
}
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const report = {
  label: '举报聊天记录',
  icon: 'lucide:circle-alert',
  onSelect: () =>
    publisherOverlay.open({
      action: 'report',
      reportTarget: 'messageRecord',
      reportedUserId: props.targetId
    })
}
const reportAvatarOrSpaceBg = {
  label: '举报个人资料',
  icon: 'lucide:circle-alert',
  onSelect: () =>
    publisherOverlay.open({
      action: 'report',
      reportTarget: 'profile',
      reportedUserId: props.targetId
    })
}

const dropdownItems = computed(() =>
  isFriend.value
    ? props.isMatch
      ? isMobile.value
        ? [deleteMessageRecord, report]
        : [deleteMessageRecord, report, reportAvatarOrSpaceBg]
      : activeTargetIds.value.size === 1 && isMessage.value
        ? // 只有 message 页面下的一级界面才提供修改列表的选项
          [
            {
              label: '隐藏列表',
              icon: 'lucide:eye-off',
              onSelect: () => {
                title.value = '隐藏列表'
                description.value = '该操作不会删除聊天记录'
                isConfirmOverlayOpen.value = true
              }
            },
            deleteList,
            deleteMessageRecord,
            report
          ]
        : [deleteMessageRecord, report]
    : props.isMatch
      ? isMobile.value
        ? [addContact, deleteMessageRecord, report]
        : [addContact, deleteMessageRecord, report, reportAvatarOrSpaceBg]
      : activeTargetIds.value.size === 1 && isMessage.value
        ? [addContact, deleteList, deleteMessageRecord, report]
        : [addContact, deleteMessageRecord, report]
)

const onDeleteList = async () => {
  isConfirmOverlayOpen.value = false
  // 关闭聊天界面，因为之后会关闭用户信息界面
  isOverlayOpen.value = false

  try {
    await useDeleteMessageList(
      userInfo,
      props.targetId,
      unreadMsgCounter,
      indexMap,
      lastMsgList,
      lastMsgMap,
      messageList,
      activeTargetId,
      lastFetchedId,
      false,
      isMobile.value,
      emits
    )
    toast.add({ title: '删除列表成功', icon: 'lucide:smile' })
  } catch {
    toast.add({ title: '删除列表失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onHideList = async () => {
  isConfirmOverlayOpen.value = false
  // 关闭聊天界面，因为之后会关闭用户信息界面
  isOverlayOpen.value = false

  try {
    await useHideMessageList(
      userInfo,
      props.targetId,
      unreadMsgCounter,
      indexMap,
      lastMsgList,
      lastMsgMap,
      activeTargetId,
      false,
      isMobile.value,
      emits
    )
    toast.add({ title: '隐藏列表成功', icon: 'lucide:smile' })
  } catch {
    toast.add({ title: '隐藏列表失败', color: 'error', icon: 'lucide:annoyed' })
  } finally {
  }
}

const onDeleteMessageRecord = async () => {
  try {
    await useClearMessageRecord(
      userInfo,
      props.targetId,
      messageList,
      lastMsgMap,
      activeTargetId,
      lastFetchedId
    )
    toast.add({ title: '删除聊天记录成功', icon: 'lucide:smile' })
  } catch {
    toast.add({
      title: '删除聊天记录失败',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  } finally {
    isConfirmOverlayOpen.value = false
    isOverlayOpen.value = false
  }
}
</script>
