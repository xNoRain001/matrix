<template>
  <q-layout class="bg-[#010409]">
    <q-header
      reveal
      class="flex-center flex border-b !border-b-[#3d444d] !bg-[#010409]"
    >
      <q-toolbar>
        <q-btn v-if="isMobile" to="/" flat round dense icon="home">
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
            v-for="({ label, icon, separator }, index) in menus"
            :key="index"
          >
            <q-item clickable v-ripple>
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
  </q-layout>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useRoomStore } from './store'

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
    icon: 'chat',
    label: '文字聊天',
    separator: false
  },
  {
    icon: 'call',
    label: '语音聊天',
    separator: false
  },
  {
    icon: 'folder',
    label: '文件传输',
    separator: false
  },
  {
    icon: 'person',
    label: '个人资料',
    separator: false
  }
]
const { online, remoteroomId } = storeToRefs(useRoomStore())

watch(
  dark,
  v => {
    $q.dark.set(v ? false : true)
    $q.dark.toggle()
  },
  { immediate: true }
)
</script>
