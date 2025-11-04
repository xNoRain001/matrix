<template>
  <USlideover
    v-if="isMobile"
    :class="isMobile ? 'max-w-none' : ''"
    :close="{ onClick: () => emit('close', false) }"
    :title="title"
    :description="description"
  >
    <template #body>
      <UAccordion :items="items" />
    </template>
  </USlideover>
  <UModal
    v-else
    :close="{ onClick: () => emit('close', false) }"
    :title="title"
    :description="description"
  >
    <template #body>
      <UAccordion :items="items" />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import type { AccordionItem } from '@nuxt/ui'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const emit = defineEmits<{ close: [boolean] }>()
const { isMobile } = storeToRefs(useUserStore())
const title = '帮助和支持'
const description = ' '
const items = ref<AccordionItem[]>([
  {
    label: '如何开启麦克风权限',
    icon: 'lucide:mic',
    content:
      '点击地址栏左侧的图标，开启麦克风权限，如果开启麦克风权限后说话依然没有声音，检查系统中是否将输入设备设置了静音'
  }
])
</script>
