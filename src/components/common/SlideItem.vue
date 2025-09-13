<template>
  <div
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @click.capture="onClick"
    class="relative flex overflow-hidden"
  >
    <slot></slot>
    <div
      ref="rightRef"
      class="absolute right-0 flex h-full w-1/3 translate-x-[calc(100%+1px)] transition-transform"
      :style="{ transform: `translateX(-${offsetX}px)` }"
    >
      <slot name="right"></slot>
    </div>
    <!-- <div
      class="bg-default absolute left-0 flex h-full items-center justify-center px-4 transition-transform"
    >
      <UCheckbox v-model="value" />
    </div> -->
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const rightRef = ref(null)
const startX = ref(0)
const offsetX = ref(0)
const width = document.documentElement.clientWidth
const minWidth = width / 9
const maxWidth = width / 3

const onTouchStart = e => {
  startX.value = e.touches[0].clientX
}

const onTouchMove = e => {
  // 到达最大宽度后继续拖动，或者松开后再继续拖动，不做处理
  if (offsetX.value === maxWidth) {
    return
  }

  const delta = startX.value - e.touches[0].clientX

  if (delta > 0) {
    // 拖动得非常快时，delta 可能会超出最大值
    offsetX.value = Math.min(delta, maxWidth)
  }
}

const onTouchEnd = () => {
  const _offset = offsetX.value

  if (_offset < minWidth) {
    // 小于阈值，取消滑动
    offsetX.value = 0
  } else if (_offset < maxWidth) {
    // 大于阈值，但没到最大距离，滑动至最大距离
    offsetX.value = maxWidth
  }
}

const onClick = (e: Event) => {
  // 如果滑动项打开时点击对应用户，关闭滑动项并阻止事件传播，不需要打开聊天界面
  if (
    offsetX.value &&
    (e.target as any).parentNode.parentNode !== rightRef.value
  ) {
    offsetX.value = 0
    e.stopPropagation()
  }
}
</script>
