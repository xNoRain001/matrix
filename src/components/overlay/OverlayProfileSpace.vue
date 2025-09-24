<template>
  <!-- class="max-w-none" 实现平板全屏 -->
  <USlideover title=" " description=" " @after:leave="onLeave">
    <template #content>
      <ProfileSpace
        v-if="targetId"
        @close="emit('close', false)"
      ></ProfileSpace>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useRecentContactsStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

const { targetId } = storeToRefs(useRecentContactsStore())
const emit = defineEmits<{ close: [boolean] }>()
const route = useRoute()

const onLeave = () => {
  // 聊天界面中打开 profile space，关闭时不需要清空 targetId，否则会将聊天界面
  // 也一起关闭
  if (route.path === '/contacts') {
    targetId.value = ''
  }
}
</script>
