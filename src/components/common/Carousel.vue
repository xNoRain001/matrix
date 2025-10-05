<template>
  <div class="w-fit select-none">
    <UCarousel
      ref="carousel"
      v-slot="{ item, index }"
      :arrows="viewer && items.length > 1"
      :items="items"
      :prev="{ onClick: onClickPrev }"
      :next="{ onClick: onClickNext }"
      :class="
        viewer
          ? isMobile
            ? 'w-[calc(100vw-2rem)] sm:w-[calc(100vh-11rem)]'
            : 'w-[calc(100vh-11rem)]'
          : 'w-full max-w-xs'
      "
      @select="onSelect"
    >
      <img
        @click="viewerOverlay.open({ urls: items, activeIndex: index })"
        :src="
          item.url.startsWith('blob:')
            ? item.url
            : item.url.startsWith('https://')
              ? item.url
              : VITE_OSS_BASE_URL + item.url
        "
        class="rounded-lg"
        :width="item.width"
        :height="item.height"
        :class="
          viewer
            ? isMobile
              ? 'mx-auto max-h-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-h-[calc(100vh-11rem)] sm:max-w-[calc(100vh-11rem)]'
              : 'mx-auto max-h-[calc(100vh-11rem)] max-w-[calc(100vh-11rem)]'
            : 'max-h-80 w-full max-w-80'
        "
      />
    </UCarousel>
    <div
      v-if="items.length > 1"
      :class="viewer ? 'mx-auto' : ''"
      class="flex w-full max-w-xs gap-1 overflow-auto pt-4 sm:max-w-md"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="shrink-0 opacity-25 transition-opacity hover:opacity-100"
        :class="{ 'opacity-100': activeIndex === index }"
        @click="select(index)"
      >
        <img
          :src="
            item.url.startsWith('blob:')
              ? item.url
              : VITE_OSS_BASE_URL + item.url
          "
          class="size-11 rounded-lg"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, useTemplateRef } from 'vue'
import OverlayViewer from '../overlay/OverlayViewer.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'

const props = withDefaults(
  defineProps<{
    items: { url: string; width?: number; height?: number }[]
    activeIndex: number
    viewer?: boolean
  }>(),
  {
    viewer: false
  }
)
const overlay = useOverlay()
const carousel = useTemplateRef('carousel')
const _activeIndex = ref(props.activeIndex)
const viewerOverlay = overlay.create(OverlayViewer)
const { isMobile } = storeToRefs(useUserStore())
const { VITE_OSS_BASE_URL } = import.meta.env

const onClickPrev = () => {
  _activeIndex.value--
}

const onClickNext = () => {
  _activeIndex.value++
}

const onSelect = (index: number) => {
  _activeIndex.value = index
}

const select = (index: number) => {
  _activeIndex.value = index
  carousel.value?.emblaApi?.scrollTo(index)
}

onMounted(() => carousel.value?.emblaApi?.scrollTo(_activeIndex.value))
</script>
