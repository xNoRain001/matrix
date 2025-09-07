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

    <ContactList v-model="selectUser" :users="users" />
  </UDashboardPanel>

  <div
    v-if="!selectUser"
    class="hidden flex-1 items-center justify-center lg:flex"
  >
    <UIcon name="lucide:user-round" class="text-dimmed size-32" />
  </div>
</template>

<script setup lang="ts">
import { getContacts } from '@/apis/contact'
import type { users } from '@/types'
import { onMounted, ref, watch } from 'vue'

const users = ref<users>([])
const selectUser = ref(null)
const toast = useToast()

watch(selectUser, v => {
  if (v) {
  }
})

const _initContacts = async () => {
  try {
    const { data } = await getContacts()
    localStorage.setItem('contacts', JSON.stringify(data))
    users.value = data
  } catch (error) {
    toast.add({ title: error.message, color: 'error' })
  }
}

const initContacts = () => {
  _initContacts()

  // const localContacts = localStorage.getItem('contacts')

  // if (!localContacts) {
  //   _initContacts()
  // } else {
  //   try {
  //     users.value = JSON.parse(localContacts)
  //   } catch (error) {
  //     // 数据被修改，重新从接口获取
  //     localStorage.removeItem('contacts')
  //     _initContacts()
  //   }
  // }
}

onMounted(async () => {
  initContacts()
})
</script>
