<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    title="发布"
    description=" "
    :ui="{
      description: 'hidden',
      body: 'space-y-4 sm:space-y-6'
    }"
  >
    <template #body>
      <UPageCard
        v-for="({ icon, title, desc, onSelect }, index) in list"
        :key="index"
        :title="title"
        :description="desc"
        :icon="icon"
        @click="onSelect"
        orientation="horizontal"
        variant="subtle"
        class="cursor-pointer"
      />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'
import OverlayPublishContent from '@/components/overlay/OverlayPublishContent.vue'
import OverlayPublishProduct from '../overlay/OverlayPublishProduct.vue'

const emit = defineEmits<{ close: [boolean] }>()
const overlay = useOverlay()
const publishContentOverlay = overlay.create(OverlayPublishContent)
const publishProductOverlay = overlay.create(OverlayPublishProduct)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const toast = useToast()
const list = [
  {
    icon: 'lucide:pencil-line',
    title: '发动态',
    desc: '分享此刻的心情',
    onSelect: () => {
      if (!userInfo.value.profile.college) {
        return toast.add({
          title: '请完善个人资料中的大学信息',
          color: 'error',
          icon: 'lucide:annoyed'
        })
      }

      publishContentOverlay.open({
        action: 'post',
        targetId: userInfo.value.id
      })

      setTimeout(() => {
        emit('close', true)
      }, 2000)
    }
  },
  {
    icon: 'lucide:shopping-bag',
    title: '卖闲置',
    desc: '自己拍图卖 · 啥都能换钱',
    onSelect: () => {
      if (!userInfo.value.profile.college) {
        return toast.add({
          title: '请完善个人资料中的大学信息',
          color: 'error',
          icon: 'lucide:annoyed'
        })
      }

      publishProductOverlay.open({
        action: 'publishProduct',
        targetId: userInfo.value.id
      })

      setTimeout(() => {
        emit('close', true)
      }, 2000)
    }
  },
  {
    icon: 'lucide:user-search',
    title: '找搭子',
    desc: '发现志同道合的伙伴',
    onSelect: () => {}
  }
]
</script>
