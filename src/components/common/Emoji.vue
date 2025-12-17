<template>
  <DefineEmojiTemplate>
    <div
      class="border-default flex gap-2 border-b"
      :class="isMobile ? 'px-0 py-2' : 'p-2'"
    >
      <UButton
        @click="activeTab = 'emoji'"
        icon="lucide:smile"
        variant="ghost"
        :color="activeTab === 'emoji' ? 'primary' : 'neutral'"
      />
      <UButton
        @click="activeTab = 'favorite'"
        icon="lucide:heart"
        variant="ghost"
        :color="activeTab === 'favorite' ? 'primary' : 'neutral'"
      />
    </div>
    <template v-if="activeTab === 'emoji'">
      <div
        class="gap grid cursor-pointer grid-cols-6 items-start overflow-y-auto pt-2 sm:grid-cols-10 sm:p-6"
        :class="isMobile ? 'h-60' : 'h-100'"
        @click="onSelectEmoji"
      >
        <div
          v-for="(emoji, index) in emojis"
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
        <UButton icon="lucide:delete" @click="onDelete" />
        <UButton label="发送" @click="emit('send')" />
      </div>
    </template>
    <div
      v-else-if="activeTab === 'favorite'"
      :class="[
        isMobile ? 'h-60' : 'h-100 w-[37.2rem]',
        favoriteEmojis.length
          ? 'grid grid-cols-4 overflow-y-auto sm:grid-cols-5'
          : 'flex flex-col items-center justify-center'
      ]"
      class="cursor-pointer pt-2 sm:p-6"
    >
      <div
        v-if="favoriteEmojis.length"
        class="hover:bg-accented/50 relative aspect-square rounded-lg p-1.5"
        @click="onAddEmoji"
      >
        <UButton
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          icon="lucide:plus"
          size="xl"
        />
        <img class="opacity-0" :src="favoriteEmojis[0].blobURL" />
      </div>
      <div
        v-for="{ blob, blobURL, id } in favoriteEmojis"
        :key="id"
        class="hover:bg-accented/50 flex aspect-square items-center justify-center rounded-lg p-1.5"
        @click="onSendEmoji(blob)"
      >
        <img class="rounded-lg" :src="blobURL" />
      </div>
      <template v-if="!favoriteEmojis.length">
        <UButton @click="onAddEmoji" icon="lucide:plus" size="xl" />
        <div class="mt-2 text-xs">点击添加自定义表情</div>
      </template>
      <input
        @change="onChange"
        ref="emojiRef"
        hidden
        type="file"
        accept="image/png, image/jpeg, image/gif"
      />
    </div>
  </DefineEmojiTemplate>
  <UCollapsible v-model:open="isEmojiOpen" v-if="isMobile">
    <template #content>
      <ReuseEmojiTemplate />
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
      <ReuseEmojiTemplate />
    </template>
  </UPopover>
</template>

<script lang="ts" setup>
import { useGenHash, useGetDB } from '@/hooks'
import { useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref, useTemplateRef, watch } from 'vue'

const { isMobile, userInfo } = storeToRefs(useUserStore())
const props = defineProps<{
  elm: null | { textareaRef: HTMLTextAreaElement }
  inputRef: null | HTMLInputElement
}>()
const emit = defineEmits(['send'])
const [DefineEmojiTemplate, ReuseEmojiTemplate] = createReusableTemplate()
const message = defineModel<string>()
const isEmojiOpen = defineModel<boolean>('is-emoji-open')
const isSlideroverOpen = ref(false)
const activeTab = ref('emoji')
const emojis = [
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
const emojiRef = useTemplateRef('emojiRef')
const toast = useToast()
const favoriteEmojis = ref([])
const favoriteEmojisLoaded = ref(false)

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
      // 移动端选择表情后修改光标位置时会激活输入框的 focus 事件，需要跳过
      if (isMobile.value) {
        textareaRef.setAttribute('skipFocus', 'true')
      }

      textareaRef.setSelectionRange(newIndex, newIndex)

      if (!isMobile.value) {
        textareaRef.focus()
      }
    })
  }

  isSlideroverOpen.value = false
}

const onAddEmoji = () => emojiRef.value.click()

const onChange = async e => {
  const input = e.target
  const file = input.files[0]

  if (file.size > 10 * 1024 * 1024) {
    toast.add({
      title: '图片大小超过 10 MB',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  try {
    const db = await useGetDB(userInfo.value.id)
    const hash = await useGenHash(file)
    const id = await db.add('favoriteEmojis', { hash, blob: file })
    favoriteEmojis.value.push({
      id,
      blob: file,
      blobURL: URL.createObjectURL(file)
    })
    toast.add({ title: '添加成功', icon: 'lucide:smile' })
  } catch (error) {
    toast.add({
      title: '添加失败，表情已存在',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  } finally {
    input.value = ''
  }
}

const onSendEmoji = (file: File) => {
  // 添加图片
  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(file)
  props.inputRef.files = dataTransfer.files
  isSlideroverOpen.value = false
  // 发送图片
  const event = new Event('change')
  props.inputRef.dispatchEvent(event)
}

const loadfavoriteEmojis = async () => {
  const db = await useGetDB(userInfo.value.id)
  const ary = await db.getAll('favoriteEmojis')

  for (let i = 0, l = ary.length; i < l; i++) {
    const emoji = ary[i]
    emoji.blobURL = URL.createObjectURL(emoji.blob)
  }

  favoriteEmojis.value = ary
  favoriteEmojisLoaded.value = true
}

watch(activeTab, v => {
  if (v === 'favorite' && !favoriteEmojisLoaded.value) {
    loadfavoriteEmojis()
  }
})
</script>
