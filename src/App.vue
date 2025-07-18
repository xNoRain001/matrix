<template>
  <q-layout class="bg-[#010409]">
    <q-header v-if="isChat" reveal class="border-b !border-b-[#3d444d]">
      <q-toolbar class="bg-[#010409]">
        <q-btn
          class="q-mr-sm"
          flat
          @click="drawer = !drawer"
          round
          dense
          icon="menu"
        />
        <q-avatar>
          <img src="/images/logo.svg" />
        </q-avatar>
        <!-- <q-toolbar-title>X-Tools</q-toolbar-title> -->
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="isChat"
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
            <div @click="onClick(label)">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon :name="icon" />
                </q-item-section>
                <q-item-section>
                  {{ label }}
                </q-item-section>
              </q-item>
              <q-separator :key="'sep' + index" v-if="separator" />
            </div>
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
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useClearMessages } from './hooks'

const route = useRoute()
const router = useRouter()
const isChat = ref(false)
const drawer = ref(false)
const mini = ref(true)
const $q = useQuasar()
const dark = ref(true)
const menus = [
  {
    icon: 'person',
    label: '修改昵称',
    separator: false
  },
  {
    icon: 'face',
    label: '修改头像',
    separator: false
  },
  {
    icon: 'face',
    label: '退出房间',
    separator: false
  },
  {
    icon: 'face',
    label: '返回主页',
    separator: false
  }
]

const onClick = async label => {
  if (label === '退出房间') {
    await useClearMessages()
    localStorage.removeItem('roomId')
    // location.href = '/chat?type=match'
  } else if (label === '返回主页') {
    router.push('/')
  }
}

watch(
  dark,
  v => {
    $q.dark.set(v ? false : true)
    $q.dark.toggle()
  },
  { immediate: true }
)

watch(
  () => route.path,
  newPath => {
    if (newPath.startsWith('/chat')) {
      isChat.value = true
    }
  }
)
</script>
