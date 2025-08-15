<template>
  <DefineLogoutFooterTemplate>
    <UButton
      label="取消"
      color="neutral"
      class="justify-center"
      @click="openLogoutDrawer = false"
    />
    <UButton label="确认" class="justify-center" @click="onLogout" />
  </DefineLogoutFooterTemplate>
  <UModal
    v-if="isDesktop"
    v-model:open="openLogoutDrawer"
    v-on:after:leave="() => useBackToProfile(false, router)"
    title="退出登录"
    description=" "
  >
    <template #footer>
      <ReuseLogoutFooterTemplate></ReuseLogoutFooterTemplate>
    </template>
  </UModal>
  <UDrawer
    v-else
    v-model:open="openLogoutDrawer"
    @animation-end="open => useBackToProfile(open, router)"
    direction="bottom"
    title="退出登录"
    description=" "
  >
    <template #footer>
      <ReuseLogoutFooterTemplate></ReuseLogoutFooterTemplate>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import { useBackToProfile, useLogout } from '@/hooks'
import { createReusableTemplate, useMediaQuery } from '@vueuse/core'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const [DefineLogoutFooterTemplate, ReuseLogoutFooterTemplate] =
  createReusableTemplate()
const openLogoutDrawer = ref(true)
const isDesktop = useMediaQuery('(min-width: 768px)')
const router = useRouter()

const onLogout = () => {
  useLogout()
  router.replace('/login')
}
</script>
