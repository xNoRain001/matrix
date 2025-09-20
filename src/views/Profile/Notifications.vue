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
          <USwitch v-model="config[name]" @update:model-value="onChange" />
        </UFormField>
      </UPageCard>
    </div>
  </DefineSlideoverBodyTemplate>
  <USlideover
    v-if="isMobile"
    v-model:open="isNotificationSlideoverOpen"
    title="通知"
    description=" "
    :ui="{ body: 'flex flex-col gap-4 sm:gap-6' }"
  >
    <template #body>
      <ReuseSlideoverBodyTemplate></ReuseSlideoverBodyTemplate>
    </template>
  </USlideover>
  <ReuseSlideoverBodyTemplate v-else></ReuseSlideoverBodyTemplate>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'

const isNotificationSlideoverOpen = defineModel<boolean>({ required: false })
const [DefineSlideoverBodyTemplate, ReuseSlideoverBodyTemplate] =
  createReusableTemplate()
const { config, userInfo, isMobile } = storeToRefs(useUserStore())
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
