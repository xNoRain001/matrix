<template>
  <div class="h-screen w-full">
    <div
      v-if="(!isSelf && targetProfile) || (isSelf && targetProfile.loginDates)"
      id="post-scroller"
      ref="containerRef"
      class="relative h-full overflow-y-auto"
    >
      <!-- 顶部导航 -->
      <ProfileSpaceHeader
        @close="emits('close')"
        :is-match="isMatch"
        :target-id="targetId"
      />
      <!-- 用户资料 -->
      <ProfileSpaceUserCard
        :is-match="isMatch"
        :target-id="targetId"
        :target-profile="targetProfile"
      />
      <!-- 日历热力图 -->
      <ProfileSpaceCalHeatMap :target-profile="targetProfile" />
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
import {
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef
} from 'vue'
import type { userInfo } from '@/types'
import { getProfile } from '@/apis/profile'

const props = withDefaults(
  defineProps<{
    isMatch?: boolean
    targetId: string
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
const targetProfile = isSelf ? userInfo.value.profile : ref(null)
const toast = useToast()

onBeforeMount(() => {
  activeSpaceTargetIds.value.add(props.targetId)
})

onBeforeUnmount(() => {
  activeSpaceTargetIds.value.delete(props.targetId)

  if (!isSelf) {
    delete postMap.value[props.targetId]
  }
})

onMounted(async () => {
  if (!isSelf) {
    try {
      ;(targetProfile as any).value = (await getProfile(props.targetId)).data
    } catch (error) {
      toast.add({
        title: error.message,
        color: 'error',
        icon: 'lucide:annoyed'
      })
      emits('close', true)
    }
  }
})
</script>
