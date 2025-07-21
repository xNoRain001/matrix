<template>
  <Card v-if="path === '/match'" :list="list"></Card>
  <router-view v-else></router-view>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { path } = toRefs(route)
const list = [
  {
    icon: '💬',
    title: '即时聊天',
    desc: '端到端加密，不留痕迹的安全对话',
    to: '/match/chat'
  },
  {
    icon: '🎙️',
    title: '语音聊天',
    desc: '高清音质，实时畅聊无延迟',
    to: '/match/audio-chat'
  },
  {
    icon: '📁',
    title: '文件传输',
    desc: '文件高速传输，极速分享体验',
    to: '/match/file-transfer'
  }
]
</script>
