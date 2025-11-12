<template>
  <UModal
    fullscreen
    :close="{ onClick: () => emit('close', false) }"
    title="预览"
    description=" "
    :ui="{
      body: 'flex justify-center items-center',
      footer: 'justify-center',
      description: 'hidden'
    }"
  >
    <template #body>
      <Carousel :items="urls" :active-index="_activeIndex" :viewer="true" />
    </template>
    <!-- <template #footer>
      <UButton
        label="下载"
        class="w-full justify-center"
        icon="lucide:cloud-download"
      />
    </template> -->
  </UModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    urls: { url: string; width?: number; height?: number }[]
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
