<template>
  <div class="flex w-full justify-center">
    <div class="flex w-full max-w-(--room-width) justify-between">
      <div class="absolute left-1/2 flex -translate-x-1/2 items-center">
        <UChip inset :color="online ? 'primary' : 'error'">
          <UAvatar :text="otherInfo?.nickname[0] || ''" size="md" />
        </UChip>
        <div class="ml-2">
          <div class="text-sm font-medium">
            {{
              remoteRoomInfo.latestId || remoteRoomInfo.showExitRoomTip
                ? remoteRoomInfo.inRoom
                  ? online
                    ? otherInfo.nickname
                    : otherInfo?.nickname || '对方未在线...' // 如果建立连接的情况下一方离线，会显示对方昵称，如果双方都不在线时一方进入房间，显示对方未在线...
                  : '对方已退出房间'
                : '对方未加入房间...'
            }}
            <div v-if="otherInfo" class="text-muted text-xs">
              <div v-if="isDesktop">
                [性别：{{ useTransformGender(otherInfo.gender) }}] - [年龄：{{
                  computeAge(otherInfo.birthday)
                }}] - [地区：{{ otherInfo.region }}]
              </div>
              <div v-else>
                {{ useTransformGender(otherInfo.gender) }}
                {{ computeAge(otherInfo.birthday) }}
                {{ otherInfo.region }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <UButton
        v-if="!leaved"
        @click="isOpenLeaveRoomModal = true"
        class=""
        variant="ghost"
        color="neutral"
        icon="lucide:chevron-left"
      ></UButton>
      <UDropdownMenu :items="dropdownItems">
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
        />
      </UDropdownMenu>
    </div>
  </div>

  <DefineLeaveRoomFooterTemplate>
    <UButton
      label="取消"
      color="neutral"
      class="justify-center"
      @click="isOpenLeaveRoomModal = false"
    />
    <UButton
      loading-auto
      label="确认"
      @click="onLeave"
      class="justify-center"
    />
  </DefineLeaveRoomFooterTemplate>
  <UModal
    v-if="isDesktop"
    v-model:open="isOpenLeaveRoomModal"
    title="离开房间"
    description=" "
  >
    <template #footer>
      <ReuseLeaveRoomFooterTemplate></ReuseLeaveRoomFooterTemplate>
    </template>
  </UModal>
  <UDrawer
    v-else
    v-model:open="isOpenLeaveRoomModal"
    title="离开房间"
    description=" "
  >
    <template #footer>
      <ReuseLeaveRoomFooterTemplate></ReuseLeaveRoomFooterTemplate>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import { addCandidate } from '@/apis/contact'
import { useTransformGender } from '@/hooks'
import { sharedVars } from '@/hooks/use-init-pc'
import { useRoomStore, useUserInfoStore } from '@/store'
import { createReusableTemplate, useMediaQuery } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const { onClick } = defineProps<{
  leaved: boolean
  onClick: Function
}>()
const [DefineLeaveRoomFooterTemplate, ReuseLeaveRoomFooterTemplate] =
  createReusableTemplate()
const isDesktop = useMediaQuery('(min-width: 768px)')
const isOpenLeaveRoomModal = ref(false)
const { otherInfo, remoteRoomInfo } = storeToRefs(useRoomStore())
const { userInfo } = storeToRefs(useUserInfoStore())
const { online, socket } = sharedVars()
const toast = useToast()
const dropdownItems = [
  [
    {
      label: '添加好友',
      icon: 'i-lucide-triangle-alert',
      onSelect: async () => {
        try {
          await addCandidate(otherInfo.value.id)
          if (online.value) {
            socket.value.emit(
              'add-contact',
              remoteRoomInfo.value.roomId,
              userInfo.value.id
            )
          }
          toast.add({ title: '已向对方发起好友请求' })
        } catch (error) {
          toast.add({ title: error.message, color: 'error' })
        }
      }
    }
  ],
  [
    {
      label: '删除聊天记录',
      icon: 'i-lucide-star'
    },
    {
      label: '举报',
      icon: 'i-lucide-star'
    }
  ]
]

const computeAge = v => {
  if (!v) {
    return '未知'
  }

  const year = new Date().getFullYear()
  const month = new Date().getMonth()
  const day = new Date().getDate()
  const _year = new Date(v).getFullYear()
  const _month = new Date(v).getMonth()
  const _day = new Date(v).getDate()
  const full = _month > month || (_month === month && _day <= day)

  return year - _year - (full ? 0 : 1)
}

const onLeave = async () => {
  await onClick()
  isOpenLeaveRoomModal.value = true
}
</script>
