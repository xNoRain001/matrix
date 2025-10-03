<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="好友申请"
    description=" "
    :ui="{ body: '!p-0' }"
  >
    <template #body>
      <div
        v-for="(
          { id, profile, createdAt, content, type }, index
        ) in contactNotifications"
        :key="id"
        class="hover:border-primary hover:bg-primary/5 cursor-pointer border-l-2 border-(--ui-bg) p-4 transition-colors sm:px-6"
        @click="
          profileSpaceOverlay.open({
            targetId: id,
            targetProfile: profile
          })
        "
      >
        <UUser
          :avatar="{ alt: profile.nickname[0] }"
          size="xl"
          :ui="{
            wrapper: 'flex-1',
            name: 'flex justify-between',
            description: 'flex justify-between'
          }"
        >
          <template #name>
            <span>{{ profile.nickname }}</span>
            <div v-if="type">
              <UButton
                @click.stop="onRefuse(id)"
                class="mr-2"
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
            <span>{{ content }}</span>
            <time>{{ useFormatTimeAgo(createdAt) }}</time>
          </template>
        </UUser>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMatchStore, useRecentContactsStore, useUserStore } from '@/store'
import { useFormatTimeAgo, useSendMsg } from '@/hooks'
import { agreeCandidate, refuseCandidate } from '@/apis/contact'
import OverlayProfileSpace from '../overlay/OverlayProfileSpace.vue'

const isNotificationsSlideoverOpen = defineModel<boolean>()
const { userInfo, globalSocket } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const {
  contactNotifications,
  contactList,
  contactProfileMap,
  messageList,
  lastMsgList,
  lastMsgMap,
  indexMap,
  unreadMsgCounter,
  msgContainerRef
} = storeToRefs(useRecentContactsStore())
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
