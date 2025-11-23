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
    <ContactList v-if="contactList?.length" />
    <div
      v-if="isMobile && !contactList?.length"
      class="flex flex-1 items-center justify-center"
    >
      <UIcon name="lucide:user-round" class="text-dimmed size-32" />
    </div>
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
import { getMutualsAPI } from '@/apis/follow'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted } from 'vue'

const toast = useToast()
const { isMobile } = storeToRefs(useUserStore())
const {
  isSpaceOpen,
  activeTargetId,
  activeTargetNickname,
  contactList,
  contactProfileMap
} = storeToRefs(useRecentContactsStore())

const refreshContactsProfile = async () => {
  try {
    const { data } = await getMutualsAPI()

    if (data.length) {
      contactList.value = data.map(item => item.following)

      for (let i = 0, l = data.length; i < l; i++) {
        const { following, followingProfile } = data[i]
        contactProfileMap.value[following] = { profile: followingProfile }
      }
    }
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
  if (contactList.value === null) {
    await refreshContactsProfile()
  }
})

onBeforeUnmount(() => {
  if (isSpaceOpen.value) {
    onClose()
  }
})
</script>
