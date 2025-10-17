<template>
  <DefineEmojiTemplate>
    <UTabs
      v-model="activeTab"
      :items="items"
      :ui="{
        root: 'gap-0 ',
        list: 'overflow-x-auto',
        trigger: 'shrink-0 cursor-pointer ',
        label: 'text-3xl'
      }"
      :variant="isMobile ? 'link' : 'pill'"
    >
      <template #content>
        <div
          class="gap grid cursor-pointer place-items-center overflow-y-auto pt-4 sm:p-6"
          :class="isMobile ? 'h-60 grid-cols-6' : 'h-100 grid-cols-10'"
          @click="onSelectEmoji"
        >
          <div
            v-for="(emoji, index) in emojiMap[activeTab]"
            :key="index"
            class="hover:bg-accented/50 rounded-lg p-1.5 text-3xl"
          >
            {{ emoji }}
          </div>
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
import activities from '@/emojis/activities.json'
import animalsNature from '@/emojis/animals-nature.json'
// import component from '@/emojis/component.json'
import flags from '@/emojis/flags.json'
import foodDrink from '@/emojis/food-drink.json'
import objects from '@/emojis/objects.json'
import peopleBody from '@/emojis/people-body.json'
import smileysEmotion from '@/emojis/smileys-emotion.json'
import symbols from '@/emojis/symbols.json'
import travelPlaces from '@/emojis/travel-places.json'
import { useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const { isMobile } = storeToRefs(useUserStore())
const props = defineProps<{
  elm: null | { textareaRef: HTMLTextAreaElement }
}>()
const [DefineEmojiTemplate, ReuseEmojiTemplate] = createReusableTemplate()
const message = defineModel<string>()
const isEmojiOpen = defineModel<boolean>('is-emoji-open')
const isSlideroverOpen = ref(false)
const activeTab = ref('smileysEmotion')
const items = [
  {
    label: '😀',
    value: 'smileysEmotion'
  },
  {
    label: '👋',
    value: 'peopleBody'
  },
  // {
  //   label: '🦱',
  //   value: 'component'
  // },
  {
    label: '🐵',
    value: 'animalsNature'
  },
  {
    label: '🍇',
    value: 'foodDrink'
  },
  {
    label: '🌍️',
    value: 'travelPlaces'
  },
  {
    label: '🎃',
    value: 'activities'
  },
  {
    label: '👓️',
    value: 'objects'
  },
  {
    label: '🏧',
    value: 'symbols'
  },
  {
    label: '🏁',
    value: 'flags'
  }
]
const emojiMap = {
  activities,
  animalsNature,
  // component,
  flags,
  foodDrink,
  objects,
  peopleBody,
  smileysEmotion,
  symbols,
  travelPlaces
}

const onSelectEmoji = ({ target, currentTarget }) => {
  if (target !== currentTarget) {
    const { textareaRef } = props.elm
    const index = textareaRef.selectionStart
    const { value } = textareaRef
    message.value =
      value.slice(0, index) + target.textContent + value.slice(index)
    const newIndex = index + 1

    if (!isMobile.value) {
      setTimeout(() => {
        textareaRef.setSelectionRange(newIndex, newIndex)
        textareaRef.focus()
      })
    }
  }

  isSlideroverOpen.value = false
}
</script>
