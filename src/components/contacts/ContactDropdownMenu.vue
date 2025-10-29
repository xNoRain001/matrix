<template>
  <USlideover
    v-if="isMobile"
    title="好友信息"
    description=" "
    :ui="{ body: 'space-y-4', description: 'hidden' }"
  >
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
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
          <UIcon name="lucide:chevron-right" class="size-5"></UIcon>
        </UFormField>
      </UPageCard>
    </template>
  </USlideover>
  <UDropdownMenu v-else :items="dropdownItems">
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
  </UDropdownMenu>
  <defineOverlayTemplate>
    <UButton
      label="取消"
      color="neutral"
      class="justify-center"
      @click="isOverlayOpen = false"
    />
    <UButton label="确认" class="justify-center" @click="onDeleteContact()" />
  </defineOverlayTemplate>
  <UDrawer
    v-if="isMobile"
    v-model:open="isOverlayOpen"
    :title="title"
    description=" "
    :ui="{ description: 'hidden' }"
  >
    <template #footer>
      <reuseOverlayTemplate></reuseOverlayTemplate>
    </template>
  </UDrawer>
  <UModal
    v-else
    v-model:open="isOverlayOpen"
    :title="title"
    description=" "
    :ui="{ description: 'hidden' }"
  >
    <template #footer>
      <reuseOverlayTemplate></reuseOverlayTemplate>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useAddContact, useDeleteContact } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import OverlayPublisher from '../overlay/OverlayPublisher.vue'

const props = defineProps<{ targetId: string }>()
const toast = useToast()
const [defineOverlayTemplate, reuseOverlayTemplate] = createReusableTemplate()
const isOverlayOpen = ref(false)
const title = ref('')
const {
  activeTargetId,
  activeTargetIds,
  activeTargetProfile,
  contactProfileMap,
  contactList
} = storeToRefs(useRecentContactsStore())
const { globalSocket, userInfo, isMobile } = storeToRefs(useUserStore())
const isFriend = computed(() =>
  Boolean(contactProfileMap.value[props.targetId])
)
const route = useRoute()
const isContacts = computed(() => route.path === '/contacts')
const addContact = {
  label: '添加好友',
  icon: 'lucide:circle-plus',
  onSelect: () => useAddContact(userInfo, props.targetId, globalSocket, toast)
}
const deleteContact = {
  label: '删除好友',
  icon: 'i-lucide-triangle-alert',
  onSelect: () => {
    title.value = '删除好友'
    isOverlayOpen.value = true
  }
}
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const report = {
  label: '举报头像/背景/昵称/签名',
  icon: 'lucide:circle-alert',
  onSelect: () => {
    publisherOverlay.open({
      action: 'report',
      reportTarget: 'avatarOrSpaceBg',
      reportUserId: props.targetId
    })
  }
}
const dropdownItems = computed(() =>
  isFriend.value
    ? // 只有 contacts 页面下的一级界面才提供删除好友的选项
      activeTargetIds.value.size === 1 && isContacts.value
      ? [deleteContact, report]
      : [report]
    : [addContact, report]
)

const onDeleteContact = async () => {
  try {
    await useDeleteContact(
      userInfo,
      props.targetId,
      contactList,
      contactProfileMap,
      globalSocket,
      toast,
      activeTargetId,
      activeTargetProfile
    )
  } catch {
  } finally {
    isOverlayOpen.value = false
  }
}
</script>
