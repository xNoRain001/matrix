<template>
  <DefineSlideoverBodyTemplate>
    <div v-for="(section, index) in sections" :key="index">
      <UPageCard :title="section.title" variant="naked" class="mb-4" />

      <UPageCard variant="subtle">
        <UFormField
          v-for="{ label, onSelect } in section.fields"
          :key="label"
          :label="label"
          class="flex items-center justify-between gap-2 not-last:pb-4"
          @click="onSelect"
        >
          <UIcon name="lucide:chevron-right" class="size-5"></UIcon>
        </UFormField>
      </UPageCard>
    </div>
  </DefineSlideoverBodyTemplate>
  <USlideover
    v-if="isMobile"
    v-model:open="isDataManagerSlideoverOpen"
    title="数据管理"
    description=" "
    :ui="{ body: 'flex flex-col gap-4', description: 'hidden' }"
  >
    <template #body>
      <ReuseSlideoverBodyTemplate></ReuseSlideoverBodyTemplate>
    </template>
  </USlideover>
  <ReuseSlideoverBodyTemplate v-else></ReuseSlideoverBodyTemplate>
  <UDrawer
    v-if="isMobile"
    v-model:open="isDataManagerModalOpen"
    title="修复聊天记录"
    description="这将清空所有聊天记录和聊天列表"
  >
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        class="justify-center"
        @click="isDataManagerModalOpen = false"
      />
      <UButton label="确认" class="justify-center" @click="useFixIndexedDB" />
    </template>
  </UDrawer>
  <UModal
    v-else
    v-model:open="isDataManagerModalOpen"
    title="清空聊天记录"
    description="该操作将清空所有聊天记录和聊天列表"
  >
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        class="justify-center"
        @click="isDataManagerModalOpen = false"
      />
      <UButton
        label="确认"
        class="justify-center"
        @click="useFixIndexedDB(userInfo.id)"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useFixIndexedDB } from '@/hooks'
import { useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const isDataManagerSlideoverOpen = defineModel<boolean>({ required: false })
const isDataManagerModalOpen = ref(false)
const [DefineSlideoverBodyTemplate, ReuseSlideoverBodyTemplate] =
  createReusableTemplate()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const sections = [
  {
    title: '聊天记录',
    fields: [
      {
        label: '清空聊天记录',
        onSelect: () => (isDataManagerModalOpen.value = true)
      }
      // {
      //   label: '清空缓存图片'
      // }
    ]
  }
]
</script>
