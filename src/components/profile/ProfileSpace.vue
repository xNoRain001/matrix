<template>
  <div class="h-screen w-full">
    <div
      id="post-scroller"
      ref="containerRef"
      class="relative h-full overflow-y-auto"
    >
      <!-- 顶部导航 -->
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
      <!-- 背景图片，由于移动端有 pb-16，所有高度全部使用 50vh，而不是 50% -->
      <!-- 灰色滤镜：grayscale-50 filter -->
      <Placeholder
        v-if="isPlaceholderShow"
        :class="isMatch ? '' : '-mt-16'"
        class="sticky -top-[calc(50vh-4rem)] z-10 h-[50vh] border-none"
      />
      <img
        v-else
        @click="viewerOverlay.open({ urls: [{ url: bgURL }] })"
        :src="bgURL"
        :class="isMatch ? '' : '-mt-16'"
        class="sticky -top-[calc(50vh-4rem)] z-10 h-[50vh] cursor-pointer object-cover"
        @error="isPlaceholderShow = true"
      />
      <!-- 个人资料卡片 -->
      <UPageCard
        class="absolute top-[50vh] right-4 left-4 z-20 -translate-y-[calc(100%+1rem)] sm:right-6 sm:left-6 sm:-translate-y-[calc(100%+1.5rem)]"
        variant="soft"
      >
        <template #title>
          <div class="flex items-start gap-2">
            <span class="break-all">{{ targetProfile.nickname }}</span>
            <!-- <UButton
              v-if="!isSelf && Boolean(contactProfileMap[targetId])"
              icon="lucide:user-round-pen"
              label="备注"
              size="xs"
            ></UButton> -->
            <UButton
              v-if="
                !(
                  // 自己的空间不显示
                  (
                    isSelf ||
                    // PC 端的匹配聊天界面不显示
                    (isMatch && !isMobile) ||
                    // 消息界面的一级空间不显示，因为是先打开聊天界面，再打开一级空间
                    isChatBtnShow
                  )
                )
              "
              @click="chatOverlay.open({ targetId, targetProfile })"
              icon="lucide:message-circle-more"
              label="聊天"
              size="xs"
            />
            <UBadge
              icon="lucide:calendar"
              :label="`${computeDays(targetProfile.createdAt)} 天`"
            />
            <UButton
              v-if="isSelf"
              @click="spaceBgRef.click()"
              icon="lucide:camera"
              label="背景"
              size="xs"
            />
          </div>
        </template>
        <template #description>
          <div class="flex items-center gap-2">
            <span>{{ targetProfile.bio }}一条咸鱼</span>
          </div>
          <div class="mt-2 space-y-2 space-x-2">
            <ProfileSpaceTags :target-profile="targetProfile" />
            <UBadge
              v-if="isSelf"
              icon="lucide:circle-plus"
              label="标签"
              @click="isTagSlideoverOpen = true"
            />
          </div>
        </template>
        <template #header>
          <UAvatar
            @click="
              viewerOverlay.open({
                urls: [
                  {
                    url: isSelf
                      ? avatarURL
                      : `${VITE_OSS_BASE_URL}avatar/${targetId}`
                  }
                ]
              })
            "
            class="ring-default absolute top-0 -translate-y-1/2 cursor-pointer ring-2"
            :src="isSelf ? avatarURL : `${VITE_OSS_BASE_URL}avatar/${targetId}`"
            :alt="targetProfile.nickname[0]"
            size="3xl"
          />
        </template>
      </UPageCard>
      <!-- 动态 -->
      <ProfileSpacePosts
        :is-match="isMatch"
        :target-id="targetId"
        :container="containerRef"
      />
    </div>

    <!-- 选择背景图片 -->
    <input
      @change="onSpaceBgChange"
      ref="spaceBgRef"
      hidden
      type="file"
      accept="image/png, image/jpeg, image/gif"
    />
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
    <!-- 标签 -->
    <ProfileSpaceTagsSlideover
      v-if="isSelf"
      v-model="isTagSlideoverOpen"
      :target-id="targetId"
      :target-profile="targetProfile"
    />
  </div>
</template>

<script lang="ts" setup>
import { usePostStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import { useGetDB, useUpdateStaticNameFile } from '@/hooks'
import { useRoute } from 'vue-router'
import OverlayViewer from '@/components/overlay/OverlayViewer.vue'
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
import OverlayChat from '@/components/overlay/OverlayChat.vue'
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
const containerRef = useTemplateRef('containerRef')
const isSettingSlideoverOpen = ref(false)
const isUserInfoSlideoverOpen = ref(false)
const isUpdatePasswordSlideoverOpen = ref(false)
const isNotificationSlideoverOpen = ref(false)
const isDataManagerSlideoverOpen = ref(false)
const isLogoffSlideoverOpen = ref(false)
const isThemeSlideoverOpen = ref(false)
const spaceBgRef = ref(null)
const toast = useToast()
const { isMobile, userInfo, avatarURL } = storeToRefs(useUserStore())
const { postMap } = storeToRefs(usePostStore())
const { activeSpaceTargetIds, activeTargetIds } = storeToRefs(
  useRecentContactsStore()
)
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
const bgBlob = isSelf
  ? (
      await (
        await useGetDB(userInfo.value.id)
      ).get('spaceBg', userInfo.value.id)
    )?.blob
  : null
const { VITE_OSS_BASE_URL } = import.meta.env
const bgURL = ref(
  isSelf
    ? bgBlob
      ? URL.createObjectURL(bgBlob)
      : // 本地数据库中删除了但 OSS 中还存在，TODO: 重新保存到本地数据库
        `${VITE_OSS_BASE_URL}spaceBg/${userInfo.value.id}`
    : `${VITE_OSS_BASE_URL}spaceBg/${props.targetId}`
)
const viewerOverlay = overlay.create(OverlayViewer)
const logoutOverlay = overlay.create(OverlayLogout)
const publisherOverlay = overlay.create(OverlayPublisher)
const helpAndSupportOverlay = overlay.create(OverlayHelpAndSupport)
const aboutOverlay = overlay.create(OverlayAbout)
const chatOverlay = overlay.create(OverlayChat)
const isTagSlideoverOpen = ref(false)
const isPlaceholderShow = ref(false)
const { path } = route
const isChatBtnShow = path === '/messages' && activeTargetIds.value.size === 1
const isSetting = path === '/profile' && activeSpaceTargetIds.value.size === 0
const isContacts = path === '/contacts'

const computeDays = timestamp =>
  Math.ceil((Date.now() - timestamp) / (1000 * 60 * 60 * 24))

const onSpaceBgChange = e =>
  useUpdateStaticNameFile(e, 'spaceBg', userInfo, toast, bgURL)

watch(
  () => props.targetId,
  v => {
    // PC 端允许无缝切换空间操作，需要更新背景，不需要添加是否是 PC 端判断，因为
    // props.targetId 能发生变化时，肯定是 PC 端
    if (v && isContacts) {
      bgURL.value = `${VITE_OSS_BASE_URL}spaceBg/${v}`
    }
  }
)

onBeforeMount(() => {
  activeSpaceTargetIds.value.add(props.targetId)
})

onBeforeUnmount(() => {
  activeSpaceTargetIds.value.delete(props.targetId)

  if (!isSelf) {
    delete postMap.value[props.targetId]
  }
})
</script>
