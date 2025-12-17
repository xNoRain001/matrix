<template>
  <UPopover :ui="{ content: 'w-72 px-6 py-4 flex flex-col gap-4' }">
    <template #default="{ open }">
      <UButton
        icon="i-lucide-swatch-book"
        color="neutral"
        :variant="open ? 'soft' : 'ghost'"
        aria-label="Color picker"
        :ui="{ leadingIcon: 'text-primary' }"
      />
    </template>

    <template #content>
      <fieldset>
        <legend class="mb-2 text-xs leading-none font-semibold">主题色</legend>

        <div class="-mx-2 grid grid-cols-3 gap-1">
          <IndexThemePickerButton
            label="Black"
            :selected="appConfig.theme.blackAsPrimary"
            @click="setBlackAsPrimary(true)"
          >
            <template #leading>
              <span
                class="inline-block h-2 w-2 rounded-full bg-black dark:bg-white"
              ></span>
            </template>
          </IndexThemePickerButton>

          <IndexThemePickerButton
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
          <IndexThemePickerButton
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
          <IndexThemePickerButton
            v-for="r in radiuses"
            :key="r"
            :label="String(r)"
            class="justify-center px-0"
            :selected="radius === r"
            @click="radius = r"
          />
        </div>
      </fieldset>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import {
  appConfig as _appConfig,
  neutralColors,
  primaryColors,
  radiuses
} from '@/const'
import { useUpdateTheme } from '@/hooks'

const appConfig = reactive(_appConfig)
const neutral = computed({
  get() {
    return appConfig.ui.colors.neutral
  },
  set(v) {
    useUpdateTheme('neutral', appConfig, v)
  }
})
const primary = computed({
  get() {
    return appConfig.ui.colors.primary
  },
  set(v) {
    useUpdateTheme('primary', appConfig, v)
  }
})
const radius = computed({
  get() {
    return appConfig.theme.radius
  },
  set(v) {
    useUpdateTheme('radius', appConfig, v)
  }
})

const setBlackAsPrimary = (v: boolean) =>
  useUpdateTheme('blackAsPrimary', appConfig, v)
</script>
