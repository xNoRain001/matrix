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
        <USwitch v-model="state[name]" @update:model-value="onChange" />
      </UFormField>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive<{ [key: string]: boolean }>({
  email: true,
  desktop: false,
  product_updates: true
})
const sections = [
  {
    title: '消息通知',
    fields: [
      {
        name: 'email',
        label: '邮箱消息提醒'
      },
      {
        name: 'desktop',
        label: '桌面消息提醒'
      }
    ]
  },
  {
    title: '隐私设置',
    fields: [
      {
        name: 'product_updates',
        label: '显示切换到其他应用'
      }
    ]
  }
]

async function onChange() {
  // Do something with data
  // console.log(state)
}
</script>
