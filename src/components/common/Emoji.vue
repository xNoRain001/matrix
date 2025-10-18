<template>
  <DefineEmojiTemplate>
    <UTabs
      v-model="activeTab"
      :items="items"
      :ui="{
        root: 'gap-0',
        list: `overflow-x-auto${isMobile ? ' gap-2 py-2 px-0' : ''}`,
        indicator: 'hidden',
        trigger: `shrink-0 cursor-pointer${isMobile ? ' p-1.5' : ''}`,
        label: 'text-3xl'
      }"
      variant="link"
    >
      <template #emoji>
        <div
          class="gap grid cursor-pointer place-items-center overflow-y-auto pt-2 sm:p-6"
          :class="isMobile ? 'h-60 grid-cols-6' : 'h-100 grid-cols-10'"
          @click="onSelectEmoji"
        >
          <div
            v-for="(emoji, index) in smileysEmotion"
            :key="index"
            class="hover:bg-accented/50 rounded-lg p-1.5 text-3xl"
          >
            {{ emoji }}
          </div>
        </div>
        <div
          v-if="isMobile"
          class="fixed right-6 bottom-6 flex items-center gap-2 sm:right-8 sm:bottom-8"
        >
          <UButton icon="lucide:delete" @click="onDelete"></UButton>
          <UButton label="发送" @click="emits('send')"></UButton>
        </div>
      </template>
      <template #love>
        <div
          :class="isMobile ? 'h-60' : 'h-100 w-[37.2rem]'"
          class="flex flex-col items-center justify-center sm:p-6"
        >
          <UButton icon="lucide:plus" size="xl"></UButton>
          <div class="mt-2 text-xs">点击添加自定义表情</div>
        </div>
      </template>
    </UTabs>
  </DefineEmojiTemplate>
  <UCollapsible v-model:open="isEmojiOpen" v-if="isMobile">
    <template #content>
      <ReuseEmojiTemplate></ReuseEmojiTemplate>
    </template>
  </UCollapsible>
  <UPopover v-else v-model:open="isSlideroverOpen">
    <UTooltip text="表情">
      <UButton
        icon="lucide:smile"
        variant="ghost"
        class="w-fit"
        @click="isSlideroverOpen = true"
      />
    </UTooltip>
    <template #content>
      <ReuseEmojiTemplate></ReuseEmojiTemplate>
    </template>
  </UPopover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const { isMobile } = storeToRefs(useUserStore())
const props = defineProps<{
  elm: null | { textareaRef: HTMLTextAreaElement }
}>()
const emits = defineEmits(['send'])
const [DefineEmojiTemplate, ReuseEmojiTemplate] = createReusableTemplate()
const message = defineModel<string>()
const isEmojiOpen = defineModel<boolean>('is-emoji-open')
const isSlideroverOpen = ref(false)
const activeTab = ref('smileysEmotion')
const items = [
  {
    icon: 'lucide:smile',
    value: 'smileysEmotion',
    slot: 'emoji'
  },
  {
    icon: 'lucide:heart',
    value: 'love',
    slot: 'love'
  }
]
const smileysEmotion = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '🤣',
  '😂',
  '🙂',
  '🙃',
  '😉',
  '😊',
  '😇',
  '🥰',
  '😍',
  '🤩',
  '😘',
  '😗',
  '☺️',
  '😚',
  '😙',
  '🥲',
  '😋',
  '😛',
  '😜',
  '🤪',
  '😝',
  '🤑',
  '🤗',
  '🤭',
  '🤫',
  '🤔',
  '🤐',
  '🤨',
  '😐️',
  '😑',
  '😶',
  '😏',
  '😒',
  '🙄',
  '😬',
  '🤥',
  '😌',
  '😔',
  '😪',
  '🤤',
  '😴',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🤧',
  '🥵',
  '🥶',
  '🥴',
  '😵',
  '🤯',
  '🤠',
  '🥳',
  '🥸',
  '😎',
  '🤓',
  '🧐',
  '😕',
  '😟',
  '🙁',
  '☹️',
  '😮',
  '😯',
  '😲',
  '😳',
  '🥺',
  '😦',
  '😧',
  '😨',
  '😰',
  '😥',
  '😢',
  '😭',
  '😱',
  '😖',
  '😣',
  '😞',
  '😓',
  '😩',
  '😫',
  '🥱',
  '😤',
  '😡',
  '😠',
  '🤬',
  '😈',
  '👿',
  '💀',
  '☠️',
  '💩',
  '🤡',
  '👹',
  '👺',
  '👻',
  '👽️',
  '👾',
  '🤖',
  '😺',
  '😸',
  '😹',
  '😻',
  '😼',
  '😽',
  '🙀',
  '😿',
  '😾',
  '🙈',
  '🙉',
  '🙊',
  '💋',
  '💌',
  '💘',
  '💝',
  '💖',
  '💗',
  '💓',
  '💞',
  '💕',
  '💟',
  '❣️',
  '💔',
  '❤️',
  '🧡',
  '💛',
  '💚',
  '💙',
  '💜',
  '🤎',
  '🖤',
  '🤍',
  '💯',
  '💢',
  '💥',
  '💫',
  '💦',
  '💨',
  '🕳️',
  '💣️',
  '💬',
  '👁️‍🗨️',
  '🗨️',
  '🗯️',
  '💭',
  '💤'
]

const onDelete = () => {
  // 删除的可能是普通字符串也可能是 emoji，emoji 长度为 2
  const ary = [...message.value]
  // 转为数组直接删除最后一项，这样就不用在意长度了
  ary.pop()
  message.value = ary.join('')
}

const onSelectEmoji = ({ target, currentTarget }) => {
  if (target !== currentTarget) {
    const { textareaRef } = props.elm
    const index = textareaRef.selectionStart
    const { value } = textareaRef
    const { textContent } = target
    message.value = value.slice(0, index) + textContent + value.slice(index)
    // emoji 采用 UTF-16 编码，长度为 2
    const newIndex = index + 2

    setTimeout(() => {
      textareaRef.setSelectionRange(newIndex, newIndex)

      if (!isMobile.value) {
        textareaRef.focus()
      }
    })
  }

  isSlideroverOpen.value = false
}
</script>
