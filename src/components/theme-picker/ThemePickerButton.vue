<template>
  <UButton
    size="sm"
    color="neutral"
    variant="outline"
    :icon="icon"
    :label="label"
    class="ring-default rounded-xl text-[11px] capitalize"
    :class="[selected ? 'bg-elevated' : 'hover:bg-elevated/50']"
  >
    <template v-if="chip || !!slots.leading" #leading>
      <slot name="leading">
        <!-- :class="`bg-(--color-light) dark:bg-(--color-dark)`" -->
        <span
          class="inline-block size-2 rounded-full"
          :class="colorMap[chip]"
        ></span>
      </slot>
    </template>
  </UButton>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  icon?: string
  chip?: string
  selected?: boolean
}>()

const slots = defineSlots<{
  leading: () => any
}>()

const colorMap = {
  red: 'bg-red-500 dark:bg-red-400',
  orange: 'bg-orange-500 dark:bg-orange-400',
  amber: 'bg-amber-500 dark:bg-amber-400',
  yellow: 'bg-yellow-500 dark:bg-yellow-400',
  lime: 'bg-lime-500 dark:bg-lime-400',
  green: 'bg-green-500 dark:bg-green-400',
  emerald: 'bg-emerald-500 dark:bg-emerald-400',
  teal: 'bg-teal-500 dark:bg-teal-400',
  cyan: 'bg-cyan-500 dark:bg-cyan-400',
  sky: 'bg-sky-500 dark:bg-sky-400',
  blue: 'bg-blue-500 dark:bg-blue-400',
  indigo: 'bg-indigo-500 dark:bgindigo-400',
  violet: 'bg-violet-500 dark:bg-violet-400',
  purple: 'bg-purple-500 dark:bg-purple-400',
  fuchsia: 'bg-fuchsia-500 dark:bg-fuchsia-400',
  pink: 'bg-pink-500 dark:bg-pink-400',
  rose: 'bg-rose-500 dark:bg-rose-400',

  slate: 'bg-slate-500 dark:bg-slate-400',
  gray: 'bg-gray-500 dark:bg-gray-400',
  zinc: 'bg-zinc-500 dark:bg-zinc-400',
  'old-neutral': 'bg-old-neutral-500 dark:bg-old-neutral-400',
  stone: 'bg-stone-500 dark:bg-stone-400'
}
</script>
