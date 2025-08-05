<template>
  <q-header
    v-if="remoteRoomInfo.roomId"
    reveal
    class="flex-center bg-x-dark flex border-b !border-b-[#3d444d]"
  >
    <q-toolbar class="w-full max-w-[var(--room-width)]">
      <q-icon v-if="leaved" class="!w-[42px]" name=""></q-icon>
      <q-btn v-else round icon="arrow_back_ios_new" @click="onLeave">
        <q-tooltip class="bg-x-drawer">离开</q-tooltip>
      </q-btn>
      <q-space />
      <q-avatar color="primary" text-color="white" class="!h-[32px] !w-[32px]">
        <!-- <img src="https://cdn.quasar.dev/img/avatar4.jpg" /> -->
        {{ otherInfo?.nickname[0] || '' }}
      </q-avatar>
      <div class="flex-center ml-2 flex">
        {{
          remoteRoomInfo.latestId
            ? remoteRoomInfo.inRoom
              ? online
                ? otherInfo.nickname
                : '对方未在线...'
              : '对方已退出房间'
            : '对方未加入房间...'
        }}
        <q-badge class="ml-2" rounded :color="online ? 'green' : 'red'" />
      </div>
      <q-space />
      <q-btn round flat icon="more_vert">
        <q-tooltip class="bg-x-drawer">操作</q-tooltip>
        <q-menu auto-close class="bg-x-drawer">
          <q-list class="w-40">
            <q-item clickable>
              <q-item-section>清除聊天记录</q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section>举报对方</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts" setup>
import { useRoomStore } from '@/store'
import { storeToRefs } from 'pinia'

defineProps<{
  leaved: boolean
  onLeave: () => void
}>()
const { online, otherInfo, remoteRoomInfo } = storeToRefs(useRoomStore())
</script>
