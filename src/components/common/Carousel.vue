<template>
  <div class="select-none">
    <template v-if="items.length > 1">
      <UCarousel
        ref="carousel"
        v-slot="{ item, index }"
        :items="items"
        :class="
          viewer
            ? isMobile
              ? 'w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)]'
              : 'w-[calc(100vw-3rem)]'
            : 'w-80'
        "
        :ui="{ container: 'items-center' }"
        @select="onSelect"
      >
        <img
          :loading="setLoading ? 'lazy' : undefined"
          :crossorigin="setCrossorigin ? 'anonymous' : undefined"
          @click="
            !viewer && viewerOverlay.open({ urls: items, activeIndex: index })
          "
          :src="
            item.url.startsWith('blob:') || item.url.startsWith('https://')
              ? item.url
              : VITE_OSS_BASE_URL + item.url
          "
          class="w-fit rounded-lg"
          :width="item.width"
          :height="item.height"
          :class="
            viewer
              ? isMobile
                ? 'mx-auto max-h-[calc(100vh-9.75rem)] max-w-[calc(100vw-2rem)] sm:max-h-[calc(100vh-10.75rem)] sm:max-w-[calc(100vw-3rem)]'
                : 'mx-auto max-h-[calc(100vh-10.75rem)] max-w-[calc(100vw-3rem)]'
              : 'max-h-80 max-w-80'
          "
        />
      </UCarousel>
      <div
        :class="viewer ? 'mx-auto justify-center pt-4' : 'pt-2'"
        class="flex w-full max-w-xs gap-2 overflow-auto sm:max-w-md"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="shrink-0 opacity-25 transition-opacity hover:opacity-100"
          :class="{ 'opacity-100': _activeIndex === index }"
          @click="select(index)"
        >
          <img
            :loading="setLoading ? 'lazy' : undefined"
            :crossorigin="setCrossorigin ? 'anonymous' : undefined"
            :src="
              item.url.startsWith('blob:') || item.url.startsWith('https://')
                ? item.url
                : VITE_OSS_BASE_URL + item.url
            "
            class="size-11 rounded-lg"
          />
        </div>
      </div>
    </template>
    <img
      v-else
      :loading="setLoading ? 'lazy' : undefined"
      :crossorigin="setCrossorigin ? 'anonymous' : undefined"
      @click="!viewer && viewerOverlay.open({ urls: items })"
      :src="
        items[0].url.startsWith('blob:') || items[0].url.startsWith('https://')
          ? items[0].url
          : VITE_OSS_BASE_URL + items[0].url
      "
      class="w-fit rounded-lg"
      :width="items[0].width"
      :height="items[0].height"
      :class="
        viewer
          ? isMobile
            ? 'mx-auto max-h-[calc(100vh-6rem)] max-w-[calc(100vw-2rem)] sm:max-h-[calc(100vh-7rem)] sm:max-w-[calc(100vw-3rem)]'
            : 'mx-auto max-h-[calc(100vh-7rem)] max-w-[calc(100vw-3rem)]'
          : 'max-h-80 max-w-80'
      "
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, useTemplateRef } from 'vue'
import OverlayViewer from '@/components/overlay/OverlayViewer.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'

const props = withDefaults(
  defineProps<{
    items: { url: string; width?: number; height?: number }[]
    activeIndex: number
    viewer?: boolean
    setCrossorigin?: boolean
    setLoading?: boolean
  }>(),
  {
    viewer: false,
    setCrossorigin: false,
    setLoading: false
  }
)
const overlay = useOverlay()
const carousel = useTemplateRef('carousel')
const _activeIndex = ref(props.activeIndex)
const viewerOverlay = overlay.create(OverlayViewer)
const { isMobile } = storeToRefs(useUserStore())
const { VITE_OSS_BASE_URL } = import.meta.env

const onSelect = (index: number) => {
  // 滑动图片时更新缩略图的高亮
  _activeIndex.value = index
}

const select = (index: number) => {
  // 点击缩略图时更新缩略图的高亮
  _activeIndex.value = index
  // 滚动到对应的图片
  carousel.value.emblaApi.scrollTo(index)
}

onMounted(() => {
  setTimeout(() => {
    const { activeIndex } = props

    if (activeIndex) {
      carousel.value.emblaApi.scrollTo(activeIndex)
    }
  })
})
</script>
