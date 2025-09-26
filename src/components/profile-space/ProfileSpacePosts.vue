<template>
  <UPageList divide>
    <UPageCard
      @click="postDetailOverlay.open({ isMatch })"
      variant="soft"
      class="cursor-pointer"
    >
      <p class="text-highlighted">
        我门前有两棵树，一颗是枣树，另一颗也是枣树。
      </p>
      <div class="flex items-center justify-between">
        <p class="text-toned text-sm">
          {{ new Date(Date.now()).toLocaleString('zh-CN') }}
        </p>
        <div>
          <UButton
            variant="ghost"
            icon="lucide:message-circle"
            label="123"
            @click.stop="onComment"
          ></UButton>
          <UButton
            variant="ghost"
            icon="lucide:heart"
            label="456"
            @click.stop="onLike"
          ></UButton>
        </div>
      </div>
    </UPageCard>
    <UPageCard
      @click="postDetailOverlay.open({ isMatch })"
      variant="soft"
      class="cursor-pointer"
    >
      <p class="text-highlighted">
        我门前有两棵树，一颗是枣树，另一颗也是枣树。
      </p>
      <Carousel
        @click.stop="useNoop"
        :items="items"
        :active-index="0"
      ></Carousel>
      <div class="flex items-center justify-between">
        <p class="text-toned text-sm">
          {{ new Date(Date.now()).toLocaleString('zh-CN') }}
        </p>
        <div>
          <UButton
            variant="ghost"
            icon="lucide:message-circle"
            label="123"
            @click.stop="onComment"
          ></UButton>
          <UButton
            variant="ghost"
            icon="lucide:heart"
            label="456"
            @click.stop="onLike"
          ></UButton>
        </div>
      </div>
    </UPageCard>
  </UPageList>
</template>

<script lang="ts" setup>
import { useNoop } from '@/hooks'
import OverlayPostDetail from '../overlay/OverlayPostDetail.vue'

defineProps<{ isMatch?: boolean }>()
const overlay = useOverlay()
const postDetailOverlay = overlay.create(OverlayPostDetail)
const items = [
  'https://picsum.photos/640/640?random=1',
  'https://picsum.photos/640/320?random=2',
  'https://picsum.photos/640/640?random=3',
  'https://picsum.photos/640/320?random=4',
  'https://picsum.photos/640/640?random=5',
  'https://picsum.photos/320/640?random=6'
]

const onComment = () => {}

const onLike = () => {
  console.log('@')
}
</script>
