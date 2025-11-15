<template>
  <UDashboardNavbar
    v-if="!isMatch"
    :toggle="false"
    :ui="{
      root: 'border-none sticky top-0 z-30'
    }"
  >
    <!-- 返回按钮，只有在移动端并处于我的页面时，才不显示 -->
    <template v-if="!isSetting" #leading>
      <UButton
        icon="lucide:chevron-left"
        color="neutral"
        variant="ghost"
        class="-ms-1.5"
        @click="emits('close')"
      />
    </template>
    <template #right>
      <UButton
        v-if="isSelf"
        icon="lucide:pencil-line"
        variant="ghost"
        @click="publisherOverlay.open({ action: 'post', targetId })"
      />
      <UButton
        v-if="isSetting"
        icon="lucide:settings"
        variant="ghost"
        @click="isSettingSlideoverOpen = true"
      />
      <ProfileSpaceDropdownMenu
        v-if="!isSelf"
        :target-id="targetId"
        :target-profile="targetProfile"
      />
    </template>
  </UDashboardNavbar>
  <!-- 移动端设置界面 -->
  <USlideover
    v-if="isMobile && isSelf"
    :class="isMobile ? 'max-w-none' : ''"
    v-model:open="isSettingSlideoverOpen"
    title="设置"
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #body>
      <UPageCard
        v-for="items in cards"
        variant="subtle"
        class="not-last:mb-4"
        :ui="{ container: 'divide-y divide-default' }"
      >
        <UFormField
          v-for="{ label, icon, onSelect } in items"
          :key="label"
          class="flex items-center gap-2 not-last:pb-4"
          @click="onSelect"
          :ui="{ container: 'flex-1 flex items-center justify-end' }"
        >
          <template #label>
            <div class="flex gap-2">
              <UIcon :name="icon" class="size-5" />
              {{ label }}
            </div>
          </template>
          <UIcon name="lucide:chevron-right" class="size-5" />
        </UFormField>
      </UPageCard>
    </template>
  </USlideover>
  <!-- 移动端二级设置界面，不放入 slider 的 body 中，因为会导致 not-last:mb-4 失效 -->
  <template v-if="isMobile && isSelf">
    <UserInfo v-model="isUserInfoSlideoverOpen" />
    <UpdatePassword v-model="isUpdatePasswordSlideoverOpen" />
    <Notifications v-model="isNotificationSlideoverOpen" />
    <DataManager v-model="isDataManagerSlideoverOpen" />
    <Logoff v-model="isLogoffSlideoverOpen" />
    <Theme v-model="isThemeSlideoverOpen" />
  </template>
</template>

<script lang="ts" setup>
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import UserInfo from '@/views/Profile/UserInfo.vue'
import UpdatePassword from '@/views/Profile/UpdatePassword.vue'
import Notifications from '@/views/Profile/Notifications.vue'
import DataManager from '@/views/Profile/DataManager.vue'
import Logoff from '@/views/Profile/Logoff.vue'
import Theme from '@/views/Profile/Theme.vue'
import OverlayLogout from '@/components/overlay/OverlayLogout.vue'
import OverlayPublisher from '@/components/overlay/OverlayPublisher.vue'
import OverlayHelpAndSupport from '@/components/overlay/OverlayHelpAndSupport.vue'
import OverlayAbout from '@/components/overlay/OverlayAbout.vue'
import type { userInfo } from '@/types'

const overlay = useOverlay()
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
const isSettingSlideoverOpen = ref(false)
const isUserInfoSlideoverOpen = ref(false)
const isUpdatePasswordSlideoverOpen = ref(false)
const isNotificationSlideoverOpen = ref(false)
const isDataManagerSlideoverOpen = ref(false)
const isLogoffSlideoverOpen = ref(false)
const isThemeSlideoverOpen = ref(false)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { activeSpaceTargetIds } = storeToRefs(useRecentContactsStore())
const cards = [
  [
    {
      icon: 'lucide:user-round',
      label: '个人资料',
      onSelect: () => (isUserInfoSlideoverOpen.value = true)
    },
    {
      icon: 'lucide:bell',
      label: '通知管理',
      onSelect: () => (isNotificationSlideoverOpen.value = true)
    },
    {
      icon: 'lucide:palette',
      label: '主题管理',
      onSelect: () => (isThemeSlideoverOpen.value = true)
    }
  ],
  [
    {
      icon: 'lucide:database',
      label: '数据管理',
      onSelect: () => (isDataManagerSlideoverOpen.value = true)
    }
    // {
    //   icon: 'lucide:shield',
    //   label: '修改密码',
    //   onSelect: () => (isUpdatePasswordSlideoverOpen.value = true)
    // }
  ],
  [
    {
      icon: 'lucide:message-circle',
      label: '反馈',
      onSelect: () => publisherOverlay.open({ action: 'feedback' })
    },
    {
      icon: 'lucide:circle-question-mark',
      label: '帮助和支持',
      onSelect: () => helpAndSupportOverlay.open()
    },
    {
      icon: 'lucide:info',
      label: '关于我们',
      onSelect: () => aboutOverlay.open()
    }
  ],
  [
    // {
    //   icon: 'lucide:ban',
    //   label: '注销账号',
    //   onSelect: () => (isLogoffSlideoverOpen.value = true)
    // },
    {
      icon: 'lucide:log-out',
      label: '退出登录',
      onSelect: () => logoutOverlay.open()
    }
  ]
]
const isSelf = props.targetId === userInfo.value.id
const route = useRoute()
const logoutOverlay = overlay.create(OverlayLogout)
const publisherOverlay = overlay.create(OverlayPublisher)
const helpAndSupportOverlay = overlay.create(OverlayHelpAndSupport)
const aboutOverlay = overlay.create(OverlayAbout)
const isSetting =
  route.path === '/profile' && activeSpaceTargetIds.value.size === 1
</script>
