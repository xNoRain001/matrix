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
        class="text-toned hover:border-primary hover:bg-primary/5 flex cursor-pointer items-center gap-4 border-l-2 border-(--ui-bg) p-4 text-base transition-colors sm:px-6"
      >
        <UAvatar :text="profile.nickname[0]" size="3xl" />
        <div class="flex flex-1 flex-col gap-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-highlighted line-clamp-1 max-w-1/2 font-medium">
              {{ profile.nickname }}</span
            >
            <time class="text-muted text-xs">{{
              useFormatTimeAgo(createdAt)
            }}</time>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-dimmed line-clamp-1 max-w-1/2">
              {{ content }}
            </div>
            <div v-if="type">
              <UButton
                @click="onRefuse(id)"
                class="mr-2"
                color="error"
                label="拒绝"
                icon="lucide:x"
                size="xs"
              ></UButton>
              <UButton
                @click="onAgree(id, profile)"
                label="同意"
                icon="lucide:check"
                size="xs"
              ></UButton>
            </div>
            <UButton
              v-else
              @click="onDelete(index)"
              color="error"
              label="删除"
              icon="lucide:x"
              size="xs"
            ></UButton>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRecentContactsStore, useUserStore } from '@/store'
import { useFormatTimeAgo } from '@/hooks'
import { agreeCandidate, refuseCandidate } from '@/apis/contact'

const isNotificationsSlideoverOpen = defineModel<boolean>()
const { userInfo, globalSocket } = storeToRefs(useUserStore())
const { contactNotifications, contactList, contactProfileMap } = storeToRefs(
  useRecentContactsStore()
)
const toast = useToast()

const onDelete = index => {
  const _contactNotifications = contactNotifications.value
  _contactNotifications.splice(index, 1)
  localStorage.setItem(
    'contactNotifications',
    JSON.stringify(_contactNotifications)
  )
}

const onRefuse = async targetId => {
  try {
    await refuseCandidate(targetId)
    contactNotifications.value = contactNotifications.value.filter(
      item => item.id !== targetId
    )
    localStorage.setItem(
      'contactNotifications',
      JSON.stringify(contactNotifications.value)
    )
    const { id, nickname, avatar } = userInfo.value
    const notification = {
      id,
      content: '拒绝了你的好友请求',
      createdAt: Date.now(),
      profile: {
        nickname,
        avatar
      }
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
    localStorage.setItem(
      'contactNotifications',
      JSON.stringify(contactNotifications.value)
    )

    // 互相添加好友，其中一方已经同意，不用进行后续处理
    if (contactProfileMap.value[targetId]) {
      return
    }

    const { id, nickname, avatar, gender, region, birthday } = userInfo.value
    const common = {
      id,
      createdAt: Date.now(),
      profile: {
        nickname,
        avatar,
        gender,
        region,
        birthday
      }
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
      status: 'normal',
      profile: targetProfile
    }
    _contactList.unshift(local)
    _contactProfileMap[local.id] = local
    localStorage.setItem('contactList', JSON.stringify(_contactList))
    localStorage.setItem(
      'contactProfileMap',
      JSON.stringify(_contactProfileMap)
    )
    globalSocket.value.emit('agree-contact', targetId, notification, contact)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}
</script>
