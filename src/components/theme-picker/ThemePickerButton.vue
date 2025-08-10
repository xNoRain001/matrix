<template>
  <UButton
    color="neutral"
    variant="outline"
    :icon="icon"
    :label="label"
    class="ring-default rounded-xl text-xs capitalize"
    :class="[selected ? 'bg-elevated' : 'hover:bg-elevated/50']"
  >
    <template v-if="chip || !!slots.leading" #leading>
      <slot name="leading">
        <span
          :class="`bg-(--color-light) dark:bg-(--color-dark)`"
          class="inline-block size-2 rounded-full"
          :style="{
            '--color-light': colors[chip]?.[500],
            '--color-dark': colors[chip]?.[400]
          }"
        ></span>
      </slot>
    </template>
  </UButton>
</template>

<script setup lang="ts">
import colors from 'tailwindcss/colors'

defineProps<{
  label: string
  icon?: string
  chip?: string
  selected?: boolean
}>()
const slots = defineSlots<{
  leading: () => any
}>()
</script>
