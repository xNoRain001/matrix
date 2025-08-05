<template>
  <div class="grid grid-cols-2 gap-4 pb-[72px]">
    <router-link
      v-for="({ icon, title, desc, to }, index) in list"
      :key="index"
      :to="to"
    >
      <div
        class="bg-x-card h-full rounded-[12px] border border-[#202127] p-[24px] hover:border-[#a8b1ff]"
      >
        <div
          class="flex-center mb-[20px] flex h-[48px] w-[48px] rounded-[6px] bg-[rgba(101,117,133,.16)] text-[24px]"
        >
          {{ icon }}
        </div>
        <h2 class="!text-base leading-[24px] !font-semibold text-[#dfdfd6]">
          {{ title }}
        </h2>
        <p
          class="!mb-0 pt-[8px] text-[14px] leading-[24px] font-medium text-[#98989f]"
        >
          {{ desc }}
        </p>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { useScrollToTop } from '@/hooks'
import { onMounted } from 'vue'

const { type } = defineProps<{
  type: 'room' | 'match'
}>()
const list = [
  {
    icon: '💬',
    title: '即时聊天',
    desc: '端到端加密，不留痕迹的安全对话',
    to: `/${type}/chat`
  },
  {
    icon: '🎙️',
    title: '语音聊天',
    desc: '高清音质，实时畅聊无延迟',
    to: `/${type}/audio-chat`
  },
  {
    icon: '📁',
    title: '文件传输',
    desc: '文件高速传输，极速分享体验',
    to: `/${type}/file-transfer`
  },
  {
    icon: '🎥',
    title: '视频聊天',
    desc: '开发中...',
    to: `/${type}`
  },
  {
    icon: '🖥️',
    title: '屏幕共享',
    desc: '开发中...',
    to: `/${type}`
  },
  {
    icon: '🎨',
    title: '多人绘画',
    desc: '开发中...',
    to: `/${type}`
  },
  {
    icon: '🗳️',
    title: '实时投票',
    desc: '开发中...',
    to: `/${type}`
  }
]

onMounted(useScrollToTop)
</script>
