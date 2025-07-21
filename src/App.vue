<template>
  <q-layout class="bg-[#010409]">
    <q-header
      v-if="!isMobile || (isMobile && remoteroomId)"
      reveal
      class="flex-center flex border-b !border-b-[#3d444d] !bg-[#010409]"
    >
      <q-toolbar>
        <q-btn v-if="isMobile" flat round dense icon="arrow_back_ios_new">
          <q-tooltip class="!bg-[#0d1117]">返回主页</q-tooltip>
        </q-btn>
        <q-btn v-else flat @click="drawer = !drawer" round dense icon="menu">
          <q-tooltip class="!bg-[#0d1117]"
            >{{ drawer ? '折叠' : '展开' }}菜单</q-tooltip
          >
        </q-btn>

        <q-space v-if="remoteroomId" />

        <q-avatar v-if="remoteroomId">
          <img src="https://cdn.quasar.dev/img/avatar4.jpg" />
        </q-avatar>

        <div v-if="remoteroomId" class="flex-center ml-2 flex">
          昵称<q-badge class="ml-2" rounded :color="online ? 'green' : 'red'" />
        </div>

        <q-space v-if="remoteroomId" />

        <q-btn v-if="remoteroomId" dense round flat icon="more_vert">
          <q-menu auto-close class="!bg-[#0d1117]">
            <q-list class="w-40">
              <q-item clickable>
                <q-item-section>清除聊天记录</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="!isMobile"
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

          <q-avatar class="absolute bottom-4">
            <img src="/images/logo.svg" />
          </q-avatar>
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

    <q-footer
      v-show="
        isMobile &&
        !(path.startsWith('/match/chat') || path.startsWith('/room/chat'))
      "
      class="!bg-[#0d1117]"
    >
      <q-tabs
        v-model="tab"
        indicator-color="transparent"
        active-color="primary"
        class="text-grey-5"
      >
        <q-route-tab
          v-for="({ label, icon, to }, index) in menus"
          :key="index"
          :name="label"
          :icon="icon"
          :label="label"
          :to="to"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useRoomStore } from './store'
import { useRoute } from 'vue-router'

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
  {
    icon: 'chat',
    label: '聊天',
    to: '/message-list',
    separator: false
  },
  {
    icon: 'face',
    label: '我',
    to: '/profile',
    separator: false
  }
]
const { online, remoteroomId } = storeToRefs(useRoomStore())
const tab = ref('mails')
const { path } = toRefs(useRoute())

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
