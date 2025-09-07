<template>
  <UDashboardPanel
    id="contact-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
  >
    <UDashboardNavbar title="好友">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>

      <template #right>
        <UButton icon="lucide:plus" variant="ghost"></UButton>
      </template>
    </UDashboardNavbar>

    <ContactList v-if="contactList.length" v-model="selectContactId" />
    <div
      v-if="isMobile && !contactList.length"
      class="flex flex-1 items-center justify-center"
    >
      <UIcon name="lucide:user-round" class="text-dimmed size-32" />
    </div>
  </UDashboardPanel>

  <ProfileSpace
    v-if="!isMobile && selectContactId"
    @close="selectContactId = ''"
    :select-contact-id="selectContactId"
  ></ProfileSpace>
  <div
    v-if="!isMobile && !selectContactId"
    class="flex flex-1 items-center justify-center"
  >
    <UIcon name="lucide:user-round" class="text-dimmed size-32" />
  </div>

  <USlideover
    v-if="isMobile"
    v-model:open="isOpenSlideover"
    title=" "
    description=" "
  >
    <template #content>
      <ProfileSpace
        v-if="selectContactId"
        @close="selectContactId = ''"
        :select-contact-id="selectContactId"
      ></ProfileSpace>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { getContacts } from '@/apis/contact'
import { useRecentContactsStore, useUserStore } from '@/store'
import type { users } from '@/types'
import { storeToRefs } from 'pinia'
import { onMounted, ref, computed } from 'vue'

const users = ref<users>([])
const selectContactId = ref('')
const toast = useToast()
const { isMobile } = storeToRefs(useUserStore())
const { contactList, contactProfileMap } = storeToRefs(useRecentContactsStore())
const isOpenSlideover = computed({
  get() {
    return Boolean(selectContactId.value)
  },
  set(value: boolean) {
    if (!value) {
      selectContactId.value = ''
    }
  }
})

const initContactList = async () => {
  const now = Date.now()
  const expired = now > Number(localStorage.getItem('contactListExpireAt'))

  // 过期，获取所有好友的最新资料
  if (expired) {
    try {
      const { data } = await getContacts()
      const _contactProfileMap = contactProfileMap.value

      contactList.value = data
      for (let i = 0, l = data.length; i < l; i++) {
        const item = data[i]
        const { id } = item
        _contactProfileMap[id] = item
      }
      localStorage.setItem('contactList', JSON.stringify(data))
      localStorage.setItem(
        'contactProfileMap',
        JSON.stringify(_contactProfileMap)
      )
      localStorage.setItem(
        'contactListExpireAt',
        String(now + 1000 * 60 * 60 * 6)
      )
    } catch (error) {
      toast.add({ title: error.message, color: 'error' })
    }
  }
}

onMounted(async () => {
  await initContactList()
})
</script>
