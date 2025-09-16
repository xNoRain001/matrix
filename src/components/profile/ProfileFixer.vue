<template>
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

  <UDrawer
    v-if="isMobile"
    v-model:open="isFixModalOpen"
    @close="state.a = false"
    title="修复聊天记录"
    description="这将清空所有聊天记录和聊天列表"
  >
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        class="justify-center"
        @click="isFixModalOpen = false"
      />
      <UButton label="确认" class="justify-center" @click="useFixIndexedDB" />
    </template>
  </UDrawer>
  <UModal
    v-else
    v-model:open="isFixModalOpen"
    title="修复聊天记录"
    description="这将清空所有聊天记录和聊天列表"
    @after:leave="state.a = false"
  >
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        class="justify-center"
        @click="isFixModalOpen = false"
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
import { storeToRefs } from 'pinia'
import { reactive, ref } from 'vue'

const isFixModalOpen = ref(false)
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
    isFixModalOpen.value = true
  }
}
</script>
