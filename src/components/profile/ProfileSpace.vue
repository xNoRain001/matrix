<template>
  <div class="h-screen w-full">
    <div
      id="post-scroller"
      ref="containerRef"
      class="relative h-full overflow-y-auto"
    >
      <!-- 顶部导航 -->
      <ProfileSpaceHeader
        @close="emits('close')"
        :is-match="isMatch"
        :target-id="targetId"
        :target-profile="targetProfile"
      />
      <!-- 用户资料 -->
      <ProfileSpaceUserCard
        :is-match="isMatch"
        :target-id="targetId"
        :target-profile="targetProfile"
      />
      <!-- 动态 -->
      <ProfileSpacePosts
        :is-match="isMatch"
        :target-id="targetId"
        :target-profile="targetProfile"
        :container="containerRef"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePostStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onBeforeUnmount, useTemplateRef } from 'vue'
import type { userInfo } from '@/types'

const props = withDefaults(
  defineProps<{
    isMatch?: boolean
    targetId: string
    targetProfile: userInfo['profile']
  }>(),
  {
    isMatch: false
  }
)
const emits = defineEmits(['close'])
const containerRef = useTemplateRef('containerRef')
const { userInfo } = storeToRefs(useUserStore())
const { postMap } = storeToRefs(usePostStore())
const { activeSpaceTargetIds } = storeToRefs(useRecentContactsStore())
const isSelf = props.targetId === userInfo.value.id

onBeforeMount(() => {
  activeSpaceTargetIds.value.add(props.targetId)
})

onBeforeUnmount(() => {
  activeSpaceTargetIds.value.delete(props.targetId)

  if (!isSelf) {
    delete postMap.value[props.targetId]
  }
})
</script>
