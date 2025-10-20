<template>
  <DefineSlideoverBodyTemplate>
    <div v-for="(section, index) in sections" :key="index">
      <UPageCard :title="section.title" variant="naked" class="mb-4" />

      <UPageCard
        variant="subtle"
        :ui="{ container: 'divide-y divide-default' }"
      >
        <UFormField
          v-for="{ name, label, onSelect } in section.fields"
          :key="name"
          :name="name"
          :label="label"
          class="flex items-center justify-between gap-2 not-last:pb-4"
          @click="onSelect ? onSelect() : useNoop()"
        >
          <UIcon
            v-if="name === 'chatBg'"
            name="lucide:chevron-right"
            class="size-5"
          ></UIcon>
          <USwitch
            v-else
            v-model="config.theme[name]"
            @update:model-value="onChange"
          />
        </UFormField>
      </UPageCard>
    </div>
  </DefineSlideoverBodyTemplate>
  <USlideover
    v-if="isMobile"
    v-model:open="isNotificationSlideoverOpen"
    title="主题"
    description=" "
    :ui="{ body: 'flex flex-col gap-4 sm:gap-6', description: 'hidden' }"
  >
    <template #body>
      <ReuseSlideoverBodyTemplate></ReuseSlideoverBodyTemplate>
      <div>
        <UPageCard title="控制台" variant="naked" class="mb-4" />
        <UPageCard
          variant="subtle"
          :ui="{ container: 'divide-y divide-default' }"
        >
          <UFormField
            label="控制台"
            class="flex items-center justify-between gap-2 not-last:pb-4"
          >
            <USwitch v-model="isConsoleOpen" />
          </UFormField>
        </UPageCard>
      </div>
    </template>
  </USlideover>
  <ReuseSlideoverBodyTemplate v-else></ReuseSlideoverBodyTemplate>
  <input
    @change="onUpdateChatBg"
    ref="chatBgRef"
    hidden
    type="file"
    accept="image/png, image/jpeg, image/webp"
  />
</template>

<script setup lang="ts">
import { useGetDB, useNoop } from '@/hooks'
import { useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

let vConsole = null
const isNotificationSlideoverOpen = defineModel<boolean>({ required: false })
const [DefineSlideoverBodyTemplate, ReuseSlideoverBodyTemplate] =
  createReusableTemplate()
const { config, userInfo, isMobile } = storeToRefs(useUserStore())
const sections = [
  {
    title: '全局背景',
    fields: [
      {
        name: 'starsBg',
        label: '星空背景'
      }
    ]
  },
  {
    title: '背景',
    fields: [
      // {
      //   name: 'sendBtn',
      //   label: '独立的发送按钮',
      //   description: '将键盘上的发送按钮替换为换行'
      // },
      // {
      //   name: 'fontSize',
      //   label: '字体大小'
      // },
      // {
      //   name: 'i18n',
      //   label: '多语言'
      // },
      {
        name: 'isChatBgOpen',
        label: '开启聊天背景'
      },
      {
        name: 'chatBg',
        label: '设置聊天背景',
        onSelect: () => chatBgRef.value.click()
      }
    ]
  }
]
const chatBgRef = ref(null)
const toast = useToast()
const isConsoleOpen = ref(false)

const onChange = async () => {
  localStorage.setItem(
    `config-${userInfo.value.id}`,
    JSON.stringify(config.value)
  )
}

const onUpdateChatBg = async e => {
  const input = e.target
  const file = input.files[0]
  const db = await useGetDB(userInfo.value.id)
  await db.put('chatBg', { id: userInfo.value.id, blob: file })
  config.value.theme.chatBg = URL.createObjectURL(file)
  input.value = ''
  toast.add({ title: '更新聊天背景成功', icon: 'lucide:smile' })
}

watch(isConsoleOpen, async v => {
  if (v) {
    const VConsole = (await import('vconsole')).default
    vConsole = new VConsole()
  } else {
    vConsole.destroy()
  }
})
</script>
