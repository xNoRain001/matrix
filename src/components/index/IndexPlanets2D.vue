<template>
  <!-- padding 决定圆环之间的间隔大小 -->
  <!-- sm:p-12 md:p-14 lg:p-10 xl:p-16 -->
  <div
    class="circle before:bg-default relative isolate z-(--level) aspect-square w-full rounded-full p-8 before:absolute before:inset-px before:rounded-full sm:p-12"
    :class="paused ? 'animation-paused' : ''"
    :style="{
      '--duration': `${(level + 1) * 8}s`,
      '--level': level + 1
    }"
  >
    <IndexPlanets2D
      v-if="level + 1 < max"
      :max="max"
      :level="level + 1"
      :planets="props.planets.slice(5)"
      :paused="paused"
    />

    <div
      ref="el"
      class="avatars absolute inset-0 grid"
      :style="{
        '--total': planets.length,
        '--offset': `${width / 2}px`
      }"
    >
      <UTooltip
        v-for="({ profile, user, _id, color }, index) in planets"
        :key="_id"
        :text="profile.nickname"
        :delay-duration="0"
      >
        <!-- lg:hover:ring-inverted  -->
        <div
          @click="
            profileSpaceOverlay.open({
              targetId: user._id,
              targetProfile: profile
            })
          "
          :class="
            profile.gender === 'male'
              ? 'ring-sky-400'
              : profile.gender === 'female'
                ? 'ring-pink-400'
                : 'ring-default'
          "
          class="avatar text-muted bg-elevated absolute top-1/2 left-1/2 size-7 rounded-full text-center text-xl ring-2 transition"
          tabindex="-1"
          :style="{
            '--color': color,
            '--index': index + 1
          }"
        >
          <img
            :src="`${VITE_OSS_BASE_URL}avatar/${user._id}`"
            :alt="profile.nickname[0]"
            class="size-full rounded-full object-cover"
            @error="onError"
          />
        </div>
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { userInfo } from '@/types'
import { useElementSize } from '@vueuse/core'
import { computed, ref } from 'vue'
import OverlayProfileSpace from '../overlay/OverlayProfileSpace.vue'

const props = withDefaults(
  defineProps<{
    planets: {
      profile: userInfo['profile']
      user: { _id: string }
      _id: string
      color: string
    }[]
    level?: number
    max?: number
    paused?: boolean
  }>(),
  {
    level: 0,
    max: 4,
    paused: false
  }
)
const planets = computed(() => props.planets.slice(0, 5))
const el = ref(null)
const { width } = useElementSize(el)
const { VITE_OSS_BASE_URL } = import.meta.env
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)

const onError = e => {
  const { target } = e
  target.replaceWith(target.alt)
}
</script>

<style scoped>
.circle:after {
  --start: 0deg;
  --end: 360deg;
  --border-color: var(--ui-border);
  --highlight-color: var(--ui-color-neutral-400);

  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: -1px;
  opacity: 1;
  border-radius: 9999px;
  z-index: -1;
  background: var(--border-color);

  @supports (background: paint(houdini)) {
    background: linear-gradient(
      var(--angle),
      var(--border-color),
      var(--border-color),
      var(--border-color),
      var(--border-color),
      var(--highlight-color)
    );
    animation: var(--duration) rotate linear infinite;
  }
}

.dark .circle:after {
  --highlight-color: white;
}

.animation-paused.circle:after,
.animation-paused .avatars {
  animation-play-state: paused;
}

.avatars {
  --start: calc(var(--level) * 36deg);
  --end: calc(360deg + (var(--level) * 36deg));
  transform: rotate(var(--angle));
  animation: calc(var(--duration) + 60s) rotate linear infinite;
}

.avatar {
  --deg: calc(var(--index) * (360deg / var(--total)));
  --transformX: calc(cos(var(--deg)) * var(--offset));
  --transformY: calc(sin(var(--deg)) * var(--offset));
  transform: translate(
      calc(-50% + var(--transformX)),
      calc(-50% + var(--transformY))
    )
    rotate(calc(360deg - var(--angle)));
}

@keyframes rotate {
  from {
    --angle: var(--start);
  }
  to {
    --angle: var(--end);
  }
}

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: true;
}
</style>
