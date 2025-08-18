<template>
  <UDashboardPanel id="message-2">
    <UDashboardNavbar
      :ui="{ title: 'absolute left-1/2 -translate-x-1/2' }"
      :title="props.mail.from.name"
      :toggle="false"
    >
      <template #leading>
        <UButton
          icon="lucide:chevron-left"
          color="neutral"
          variant="ghost"
          class="-ms-1.5"
          @click="emits('close')"
        />
      </template>

      <template #right>
        <UDropdownMenu :items="dropdownItems">
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="neutral"
            variant="ghost"
          />
        </UDropdownMenu>
      </template>
    </UDashboardNavbar>

    <div class="flex flex-col justify-between gap-1 p-4 sm:flex-row sm:px-6">
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Architecto unde,
      error id tempore ut officiis aspernatur, ex laudantium beatae, vitae enim
      eius dolore aut? Aperiam perspiciatis hic totam reprehenderit maxime?
    </div>

    <div class="shrink-0 px-4 pb-4 sm:px-6">Input</div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { format } from 'date-fns'
// import type { Mail } from '../../types'

const props = defineProps<{
  mail: any
}>()

const emits = defineEmits(['close'])

const dropdownItems = [
  [
    {
      label: '备注',
      icon: 'i-lucide-check-circle'
    },
    {
      label: '删除好友',
      icon: 'i-lucide-triangle-alert'
    }
  ],
  [
    {
      label: '删除聊天记录',
      icon: 'i-lucide-star'
    },
    {
      label: '屏蔽',
      icon: 'i-lucide-circle-pause'
    }
  ]
]
// @ts-ignore
const message = ref('')
</script>
