<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="好友申请"
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #body>
      <div
        v-for="(
          { id, profile, createdAt, content, actionType }, index
        ) in contactNotifications"
        :key="id"
        class="bg-elevated/50 cursor-pointer rounded-lg p-4 not-last:mb-2 sm:p-6"
        @click="
          profileSpaceOverlay.open({
            targetId: id,
            targetProfile: profile
          })
        "
      >
        <UUser
          :avatar="{
            src: `${VITE_OSS_BASE_URL}avatar/${id}`,
            alt: profile.nickname[0]
          }"
          size="xl"
          :ui="{
            wrapper: 'flex-1 min-w-0',
            name: 'flex justify-between items-center gap-2',
            description: 'flex justify-between gap-2'
          }"
        >
          <template #name>
            <span class="truncate">{{ profile.nickname }}</span>
            <div v-if="actionType === 'addContact'" class="flex gap-2">
              <UButton
                @click.stop="onRefuse(id)"
                color="error"
                label="拒绝"
                icon="lucide:x"
                size="xs"
              ></UButton>
              <UButton
                @click.stop="onAgree(id, profile)"
                label="同意"
                icon="lucide:check"
                size="xs"
              ></UButton>
            </div>
            <UButton
              v-else
              @click.stop="onDelete(index)"
              color="error"
              label="删除"
              size="xs"
            ></UButton>
          </template>
          <template #description>
            <span class="flex-1 truncate">{{ content }}</span>
            <time>{{ useFormatTimeAgo(createdAt) }}</time>
          </template>
        </UUser>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  useMatchStore,
  useNotificationsStore,
  useRecentContactsStore,
  useUserStore
} from '@/store'
import { useFormatTimeAgo, useSendMsg } from '@/hooks'
import { agreeCandidate, refuseCandidate } from '@/apis/contact'
import OverlayProfileSpace from '../overlay/OverlayProfileSpace.vue'

const { VITE_OSS_BASE_URL } = import.meta.env
const isNotificationsSlideoverOpen = defineModel<boolean>()
const { userInfo, globalSocket } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const {
  contactList,
  contactProfileMap,
  messageList,
  lastMsgList,
  lastMsgMap,
  indexMap,
  unreadMsgCounter,
  msgContainerRef
} = storeToRefs(useRecentContactsStore())
const { contactNotifications } = storeToRefs(useNotificationsStore())
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)
const toast = useToast()

const onDelete = index => {
  const _contactNotifications = contactNotifications.value
  _contactNotifications.splice(index, 1)
  localStorage.setItem(
    `contactNotifications-${userInfo.value.id}`,
    JSON.stringify(_contactNotifications)
  )
}

const onRefuse = async targetId => {
  try {
    await refuseCandidate(targetId)
    contactNotifications.value = contactNotifications.value.filter(
      item => item.id !== targetId
    )
    const { id, profile } = userInfo.value
    localStorage.setItem(
      `contactNotifications-${id}`,
      JSON.stringify(contactNotifications.value)
    )
    const notification = {
      id,
      content: '拒绝了你的好友请求',
      type: 'contact',
      actionType: 'refuseContact',
      createdAt: Date.now(),
      profile
    }
    globalSocket.value.emit('refuse-contact', targetId, notification)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onAgree = async (targetId, targetProfile) => {
  try {
    await agreeCandidate(targetId)

    contactNotifications.value = contactNotifications.value.filter(
      item => item.id !== targetId
    )
    const { id, profile } = userInfo.value

    localStorage.setItem(
      `contactNotifications-${id}`,
      JSON.stringify(contactNotifications.value)
    )

    // 互相添加好友，其中一方已经同意，不用进行后续处理
    if (contactProfileMap.value[targetId]) {
      return
    }

    const common = {
      id,
      createdAt: Date.now(),
      profile
    }
    const notification = {
      type: 'contact',
      actionType: 'agreeContact',
      content: '同意了你的好友请求',
      ...common
    }
    const contact = {
      remark: '',
      status: 'normal',
      ...common
    }
    const _contactList = contactList.value
    const _contactProfileMap = contactProfileMap.value
    const local = {
      id: targetId,
      createdAt: Date.now(),
      remark: '',
      status: 'normal' as const,
      profile: targetProfile
    }
    _contactList.unshift(targetId)
    _contactProfileMap[targetId] = local
    localStorage.setItem(`contactList-${id}`, JSON.stringify(_contactList))
    localStorage.setItem(
      `contactProfileMap-${id}`,
      JSON.stringify(_contactProfileMap)
    )
    globalSocket.value.emit('agree-contact', targetId, notification, contact)
    useSendMsg(
      'contactAgreeTip',
      '同意了你的好友请求',
      null,
      null,
      null,
      null,
      null,
      null,
      targetId,
      userInfo,
      globalSocket,
      messageList,
      lastMsgList,
      lastMsgMap,
      matchRes,
      indexMap,
      unreadMsgCounter,
      msgContainerRef,
      false
    )
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}
</script>
