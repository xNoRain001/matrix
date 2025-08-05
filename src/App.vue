<template>
  <q-layout class="bg-[#010409]">
    <q-header
      v-if="userInfo && !remoteRoomInfo.roomId && !isMobile"
      reveal
      class="flex-center flex border-b !border-b-[#3d444d] !bg-[#010409]"
    >
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu">
          <q-tooltip class="!bg-[#0d1117]"
            >{{ drawer ? '折叠' : '展开' }}菜单</q-tooltip
          >
        </q-btn>
        <q-avatar class="ml-4">
          <img
            style="filter: drop-shadow(rgba(0, 122, 204, 0.3) 0px 8px 24px)"
            src="/images/logo.svg"
          />
        </q-avatar>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="userInfo && !isMobile && !remoteRoomInfo.roomId"
      v-model="drawer"
      show-if-above
      mini-to-overlay
      :mini="mini"
      @mouseover="mini = false"
      @mouseout="mini = true"
      :width="260"
      :breakpoint="500"
      bordered
      class="bg-[#0d1117]"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <template
            v-for="({ label, icon, to, separator }, index) in menus"
            :key="index"
          >
            <q-item :to="to" clickable v-ripple>
              <q-item-section avatar>
                <q-icon :name="icon" />
              </q-item-section>
              <q-item-section>
                {{ label }}
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="separator" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page class="p-4">
        <Suspense>
          <router-view></router-view>
        </Suspense>
      </q-page>
    </q-page-container>

    <div
      v-show="userInfo && !remoteRoomInfo.roomId && isMobile"
      class="fixed bottom-0 w-full !bg-[#0d1117]"
    >
      <q-tabs
        v-model="tab"
        indicator-color="transparent"
        active-color="primary"
        class="text-grey-5"
      >
        <q-route-tab
          :ripple="false"
          v-for="({ label, icon, to }, index) in menus"
          :key="index"
          :name="label"
          :icon="icon"
          :label="label"
          :to="to"
        />
      </q-tabs>
    </div>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useRoomStore, useUserInfoStore } from './store'

const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
const $q = useQuasar()
const dark = ref(true)
const drawer = ref(false)
const mini = ref(true)
const menus = [
  {
    icon: 'auto_awesome',
    label: '匹配',
    to: '/match',
    separator: false
  },
  {
    icon: 'chair',
    label: '房间',
    to: '/room',
    separator: false
  },
  // {
  //   icon: 'chat',
  //   label: '聊天',
  //   to: '/message-list',
  //   separator: false
  // },
  {
    icon: 'face',
    label: '我的',
    to: '/profile',
    separator: false
  }
]
const { remoteRoomInfo } = storeToRefs(useRoomStore())
const { userInfo } = storeToRefs(useUserInfoStore())
const tab = ref('mails')

watch(
  dark,
  v => {
    $q.dark.set(v ? false : true)
    $q.dark.toggle()
  },
  { immediate: true }
)
</script>

<style>
.q-tab__label {
  font-size: 12px;
}
</style>
