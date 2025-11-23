<template>
  <USlideover
    v-if="isMobile"
    title="操作"
    description=" "
    :ui="{ content: 'max-w-none', body: 'space-y-4', description: 'hidden' }"
  >
    <template #default>
      <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
    </template>
    <template #body>
      <UPageCard
        variant="subtle"
        :ui="{ container: 'divide-y divide-default' }"
      >
        <UFormField
          v-for="({ label, onSelect }, index) in dropdownItems"
          :key="index"
          :label="label"
          class="flex items-center justify-between gap-2 not-last:pb-4"
          @click="onSelect"
        >
          <UIcon name="lucide:chevron-right" class="size-5" />
        </UFormField>
      </UPageCard>
    </template>
  </USlideover>
  <UDropdownMenu v-else :items="dropdownItems">
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import OverlayPublisher from '@/components/overlay/OverlayPublisher.vue'

const props = defineProps<{
  targetId: string
}>()
const { isMobile } = storeToRefs(useUserStore())
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const dropdownItems = [
  {
    label: '举报个人资料',
    icon: 'lucide:circle-alert',
    onSelect: () => {
      publisherOverlay.open({
        action: 'report',
        reportTarget: 'profile',
        reportedUserId: props.targetId
      })
    }
  }
]
</script>
