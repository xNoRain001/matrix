<template>
  <UModal
    fullscreen
    :close="{ onClick: () => emit('close', false) }"
    title="预览"
    description=" "
    :ui="{
      body: 'flex justify-center items-center'
    }"
  >
    <template #body>
      <Carousel
        :items="urls"
        :active-index="_activeIndex"
        :viewer="true"
      ></Carousel>
    </template>
    <!-- <template #footer>
      <UButton label="下载" />
    </template> -->
  </UModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    urls: string[]
    activeIndex?: number
  }>(),
  {
    activeIndex: 0
  }
)
const emit = defineEmits<{ close: [boolean] }>()
const _activeIndex = ref(props.activeIndex)

// const onDownload = (url, filename) => {
//   fetch(url)
//     .then(res => res.blob())
//     .then(blob => useExportFile(filename, blob))
// }
</script>
