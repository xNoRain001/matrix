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
        <USwitch v-model="config[name]" @update:model-value="onChange" />
      </UFormField>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const { config, userInfo } = storeToRefs(useUserStore())
const sections = [
  {
    title: '消息通知',
    fields: [
      {
        name: 'beep',
        label: '消息提示音'
      }
      // {
      //   name: 'notify',
      //   label: '页面内消息横幅'
      // }
    ]
  }
]

const onChange = async () => {
  localStorage.setItem(
    `config-${userInfo.value.id}`,
    JSON.stringify(config.value)
  )
}
</script>
