<template>
  <UDashboardPanel id="contact-2" class="overflow-y-auto">
    <UDashboardNavbar
      :toggle="false"
      :ui="{
        root: 'border-none sticky top-0 z-10'
      }"
    >
      <template #title>
        <div class="absolute left-1/2 -translate-x-1/2">
          {{ contactProfileMap[selectContactId].profile.nickname }}
        </div>
        <!-- <UUser
          class="absolute left-1/2 -translate-x-1/2"
          :name="contactProfileMap[selectContactId].profile.nickname"
          :avatar="{
            alt: contactProfileMap[selectContactId].profile.nickname[0]
          }"
          :chip="{
            color: 'primary'
          }"
        /> -->
      </template>
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
          <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
        </UDropdownMenu>
      </template>
    </UDashboardNavbar>

    <!-- TODO: 背景色占位 -->
    <img
      class="sticky -top-[calc(50%-4rem)] -mt-16 h-1/2 w-full"
      src="https://picsum.photos/id/46/400"
    />

    <UPageCard
      class="absolute top-1/2 right-4 left-4 -translate-y-[calc(100%+1rem)] sm:right-6 sm:left-6 sm:-translate-y-[calc(100%+1.5rem)]"
      :title="contactProfileMap[selectContactId].profile.nickname"
      description="Nuxt UI v3 integrates with latest Tailwind CSS v4, bringing significant improvements."
      icon="lucide:circle-ellipsis"
      variant="soft"
    >
      <template #title>
        <div class="flex items-center gap-2">
          {{ contactProfileMap[selectContactId].profile.nickname }}
          <UButton icon="lucide:user-round-pen" label="备注"></UButton>
          <UButton
            @click="onChat"
            icon="lucide:message-circle-more"
            label="聊天"
          ></UButton>
        </div>
      </template>
    </UPageCard>

    <USlideover v-model:open="isOpenSlideover" title=" " description=" ">
      <template #content>
        <MessageView v-if="targetId" @close="onClose" :target-id="targetId" />
      </template>
    </USlideover>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { useRecentContactsStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const props = defineProps<{ selectContactId: string }>()
const emits = defineEmits(['close'])
const isOpenSlideover = ref(false)

const { targetId, contactProfileMap } = storeToRefs(useRecentContactsStore())
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

const onChat = () => {
  isOpenSlideover.value = true
  targetId.value = props.selectContactId
}

const onClose = () => {
  isOpenSlideover.value = false
  targetId.value = ''
}
</script>
