<template>
  <DefineSlideoverBodyTemplate>
    <div v-for="(section, index) in sections" :key="index">
      <UPageCard :title="section.title" variant="naked" class="mb-4" />

      <UPageCard variant="subtle">
        <UFormField
          v-for="{ name, label } in section.fields"
          :key="name"
          :name="name"
          :label="label"
          class="flex items-center justify-between gap-2 not-last:pb-4"
        >
          <USwitch v-model="state[name]" @update:model-value="onChange(name)" />
        </UFormField>
      </UPageCard>
    </div>
  </DefineSlideoverBodyTemplate>
  <USlideover
    v-if="isMobile"
    v-model:open="isDataManagerSlideoverOpen"
    title="数据管理"
    description=" "
    :ui="{ body: 'flex flex-col gap-4' }"
  >
    <template #body>
      <ReuseSlideoverBodyTemplate></ReuseSlideoverBodyTemplate>
    </template>
  </USlideover>
  <ReuseSlideoverBodyTemplate v-else></ReuseSlideoverBodyTemplate>
  <UDrawer
    v-if="isMobile"
    v-model:open="isDataManagerModalOpen"
    @close="state.a = false"
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
    title="修复聊天记录"
    description="这将清空所有聊天记录和聊天列表"
    @after:leave="state.a = false"
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
import { reactive, ref } from 'vue'

const isDataManagerSlideoverOpen = defineModel<boolean>({ required: false })
const isDataManagerModalOpen = ref(false)
const [DefineSlideoverBodyTemplate, ReuseSlideoverBodyTemplate] =
  createReusableTemplate()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const state = reactive<{ [key: string]: boolean }>({
  a: false,
  b: false
})
const sections = [
  {
    title: '聊天记录',
    fields: [
      {
        name: 'a',
        label: '清空聊天记录'
      }
      // {
      //   name: 'b',
      //   label: '清空缓存图片'
      // }
    ]
  }
]

const onChange = name => {
  if (state[name]) {
    isDataManagerModalOpen.value = true
  }
}
</script>
