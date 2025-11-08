<template>
  <DefineSlideoverBodyTemplate>
    <div v-for="(section, index) in sections" :key="index">
      <UPageCard :title="section.title" variant="naked" class="mb-4" />
      <UPageCard
        v-if="index === 0"
        variant="subtle"
        :ui="{ container: 'divide-y divide-default' }"
      >
        <UFormField
          v-for="{ name, label } in section.fields"
          :key="name"
          :name="name"
          :label="label"
          class="flex items-center justify-between gap-2 not-last:pb-4"
        >
          <USwitch
            v-model="config.notification[name]"
            @update:model-value="onChange"
          />
        </UFormField>
      </UPageCard>
      <URadioGroup
        v-else
        @update:model-value="onUpateBeep"
        variant="table"
        :default-value="config.notification.beep"
        indicator="hidden"
        :items="items"
        :ui="{
          // has-data-[state=checked]:bg-elevated
          item: 'bg-elevated/50'
        }"
      >
        <template #label="{ item: { label, value } }">
          <div class="flex items-center justify-between">
            {{ label }}
            <UIcon
              v-if="value === config.notification.beep"
              name="lucide:circle-check"
              class="text-primary size-5"
            />
          </div>
        </template>
      </URadioGroup>
    </div>
  </DefineSlideoverBodyTemplate>
  <USlideover
    v-if="isMobile"
    :class="isMobile ? 'max-w-none' : ''"
    v-model:open="isNotificationSlideoverOpen"
    title="通知"
    description=" "
    :ui="{ body: 'flex flex-col gap-4 sm:gap-6', description: 'hidden' }"
  >
    <template #body>
      <ReuseSlideoverBodyTemplate />
    </template>
  </USlideover>
  <ReuseSlideoverBodyTemplate v-else />
  <audio hidden ref="audioRef"></audio>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import type { RadioGroupItem } from '@nuxt/ui'
import { ref } from 'vue'

const isNotificationSlideoverOpen = defineModel<boolean>({ required: false })
const [DefineSlideoverBodyTemplate, ReuseSlideoverBodyTemplate] =
  createReusableTemplate()
const { config, userInfo, isMobile } = storeToRefs(useUserStore())
const sections = [
  {
    title: '消息通知',
    fields: [
      {
        name: 'isBeepOpen',
        label: '消息提示音'
      }
      // {
      //   name: 'vibration',
      //   label: '震动'
      // },
      // {
      //   name: 'messageBanner',
      //   label: '消息横幅'
      // }
    ]
  },
  {
    title: '提示音',
    fields: [
      {
        name: 'beep-1',
        label: '声音1'
      },
      {
        name: 'beep-2',
        label: '声音2'
      },
      {
        name: 'beep-3',
        label: '声音3'
      },
      {
        name: 'beep-4',
        label: '声音4'
      },
      {
        name: 'beep-5',
        label: '声音5'
      },
      {
        name: 'beep-6',
        label: '声音6'
      }
    ]
  }
]
const items = ref<RadioGroupItem[]>([
  {
    label: '声音 1',
    value: 'beep-1'
  },
  {
    label: '声音 2',
    value: 'beep-2'
  },
  {
    label: '声音 3',
    value: 'beep-3'
  },
  {
    label: '声音 4',
    value: 'beep-4'
  },
  {
    label: '声音 5',
    value: 'beep-5'
  },
  {
    label: '声音 6',
    value: 'beep-6'
  }
])
const audioRef = ref(null)

const onChange = async () => {
  localStorage.setItem(
    `config-${userInfo.value.id}`,
    JSON.stringify(config.value)
  )
}

const onUpateBeep = v => {
  const audio = audioRef.value
  audio.src = `/audio/${v}.mp3`
  audio.play()
  config.value.notification.beep = v
  localStorage.setItem(
    `config-${userInfo.value.id}`,
    JSON.stringify(config.value)
  )
}
</script>
