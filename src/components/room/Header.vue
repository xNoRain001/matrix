<template>
  <div class="relative flex w-full items-center">
    <div class="absolute left-1/2 flex -translate-x-1/2 items-center">
      <UChip inset :color="online ? 'primary' : 'error'">
        <UAvatar :text="otherInfo?.nickname[0] || ''" size="md" />
      </UChip>
      <div class="ml-2 text-sm">
        {{
          remoteRoomInfo.latestId
            ? remoteRoomInfo.inRoom
              ? online
                ? otherInfo.nickname
                : '对方未在线...'
              : '对方已退出房间'
            : '对方未加入房间...'
        }}
      </div>
    </div>
    <UButton
      v-if="!leaved"
      @click="isOpenLeaveRoomModal = true"
      class="absolute right-0"
      variant="ghost"
      color="neutral"
      icon="i-lucide-x"
    ></UButton>
  </div>

  <DefineLeaveRoomFooterTemplate>
    <UButton
      label="取消"
      color="neutral"
      variant="outline"
      class="justify-center"
      @click="isOpenLeaveRoomModal = false"
    />
    <UButton label="确认" @click="onLeave" class="justify-center" />
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
import { useRoomStore } from '@/store'
import { createReusableTemplate, useMediaQuery } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const { onClick } = defineProps<{
  online: boolean
  leaved: boolean
  onClick: Function
}>()
const [DefineLeaveRoomFooterTemplate, ReuseLeaveRoomFooterTemplate] =
  createReusableTemplate()
const isDesktop = useMediaQuery('(min-width: 768px)')
const isOpenLeaveRoomModal = ref(false)
const { otherInfo, remoteRoomInfo } = storeToRefs(useRoomStore())

const onLeave = () => {
  isOpenLeaveRoomModal.value = true
  onClick()
}
</script>
