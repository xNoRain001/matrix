<template>
  <UDashboardPanel
    id="contact-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
    :class="isMobile ? 'pb-16' : ''"
  >
    <ContactHeader />
    <Skeleton v-if="loading" :count="5" />
    <template v-if="!loading">
      <ContactList v-if="contactList.length" />
      <div
        v-if="isMobile && !contactList.length"
        class="flex flex-1 items-center justify-center"
      >
        <UIcon name="lucide:user-round" class="text-dimmed size-32" />
      </div>
    </template>
  </UDashboardPanel>
  <template v-if="!isMobile">
    <ProfileSpace
      v-if="isSpaceOpen"
      @close="onClose"
      :target-id="activeTargetId"
    />
    <div v-else class="flex flex-1 items-center justify-center">
      <UIcon name="lucide:user-round" class="text-dimmed size-32" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { getMutualsAPI } from '@/apis/follower'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const toast = useToast()
const { isMobile } = storeToRefs(useUserStore())
const {
  isSpaceOpen,
  activeTargetId,
  activeTargetNickname,
  contactList,
  contactProfileMap
} = storeToRefs(useRecentContactsStore())
const loading = ref(true)

const getMutuals = async () => {
  try {
    const { data } = await getMutualsAPI()

    if (data.length) {
      contactList.value = data.map(item => item.user)

      for (let i = 0, l = data.length; i < l; i++) {
        const { user, profile } = data[i]
        contactProfileMap.value[user] = { profile }
      }
    }

    loading.value = false
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onClose = () => {
  isSpaceOpen.value = false
  activeTargetId.value = ''
  activeTargetNickname.value = ''
}

onMounted(async () => {
  await getMutuals()
})

onBeforeUnmount(() => {
  if (isSpaceOpen.value) {
    onClose()
  }
})
</script>
