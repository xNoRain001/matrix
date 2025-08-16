<template>
  <UPopover :ui="{ content: 'w-72 px-6 py-4 flex flex-col gap-4' }">
    <template #default="{ open }">
      <UButton
        icon="i-lucide-swatch-book"
        color="neutral"
        :variant="open ? 'soft' : 'ghost'"
        square
        aria-label="Color picker"
        :ui="{ leadingIcon: 'text-primary' }"
      />
    </template>

    <template #content>
      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold">主题色</legend>

        <div class="-mx-2 grid grid-cols-3 gap-1">
          <ThemePickerButton
            label="Black"
            :selected="appConfig.theme.blackAsPrimary"
            @click="setBlackAsPrimary(true)"
          >
            <template #leading>
              <span
                class="inline-block h-2 w-2 rounded-full bg-black dark:bg-white"
              ></span>
            </template>
          </ThemePickerButton>

          <ThemePickerButton
            v-for="color in primaryColors"
            :key="color"
            :label="color"
            :chip="color"
            :selected="!appConfig.theme.blackAsPrimary && primary === color"
            @click="primary = color"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold">中性色</legend>

        <div class="-mx-2 grid grid-cols-3 gap-1">
          <ThemePickerButton
            v-for="color in neutralColors"
            :key="color"
            :label="color"
            :chip="color"
            :selected="neutral === color"
            @click="neutral = color"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold">圆角</legend>

        <div class="-mx-2 grid grid-cols-5 gap-1">
          <ThemePickerButton
            v-for="r in radiuses"
            :key="r"
            :label="String(r)"
            class="justify-center px-0"
            :selected="radius === r"
            @click="radius = r"
          />
        </div>
      </fieldset>

      <!-- <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold">主题</legend>

        <div class="-mx-2 grid grid-cols-3 gap-1">
          <ThemePickerButton
            v-for="m in modes"
            :key="m.label"
            v-bind="m"
            :selected="store === m.value"
            @click="store = m.value"
          />
        </div>
      </fieldset> -->
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import colors from 'tailwindcss/colors'
import { omit } from '@nuxt/ui/utils'
// import { useColorMode } from '@vueuse/core'
import { computed, reactive } from 'vue'
import { appConfig as _appConfig } from '@/const'
import { useUpdateTheme } from '@/hooks'

const appConfig = reactive(_appConfig)
// const { store } = useColorMode()
const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone']
const neutral = computed({
  get() {
    return appConfig.ui.colors.neutral
  },
  set(v) {
    useUpdateTheme('neutral', v)
    appConfig.ui.colors.neutral = v
    localStorage.setItem('nuxt-ui-neutral', v)
  }
})
const colorsToOmit = [
  'inherit',
  'current',
  'transparent',
  'black',
  'white',
  ...neutralColors
]
const primaryColors = Object.keys(omit(colors, colorsToOmit as any))
const primary = computed({
  get() {
    return appConfig.ui.colors.primary
  },
  set(v) {
    useUpdateTheme('primary', v)
    appConfig.ui.colors.primary = v
    localStorage.setItem('nuxt-ui-primary', v)
    setBlackAsPrimary(false)
  }
})
const radiuses = [0, 0.125, 0.25, 0.375, 0.5]
const radius = computed({
  get() {
    return appConfig.theme.radius
  },
  set(v) {
    useUpdateTheme('radius', v)
    appConfig.theme.radius = v
    localStorage.setItem('nuxt-ui-radius', String(v))
  }
})
// const modes: {
//   label: 'light' | 'dark' | 'system'
//   value: 'light' | 'dark' | 'auto'
//   icon: string
// }[] = [
//   { label: 'light', value: 'light', icon: 'i-lucide:sun' },
//   { label: 'dark', value: 'dark', icon: 'i-lucide:moon' },
//   { label: 'system', value: 'auto', icon: 'i-lucide:monitor' }
// ]

const setBlackAsPrimary = (v: boolean) => {
  useUpdateTheme('blackAsPrimary', v)
  appConfig.theme.blackAsPrimary = v
  localStorage.setItem('nuxt-ui-black-as-primary', String(v))
}
</script>
