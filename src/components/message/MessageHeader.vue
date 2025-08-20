<template>
  <UDashboardNavbar
    :ui="{ root: 'bg-default', title: 'absolute left-1/2 -translate-x-1/2' }"
    :title="props.user.nickname"
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
</template>

<script setup lang="ts">
const props = defineProps<{
  user: any
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
</script>
