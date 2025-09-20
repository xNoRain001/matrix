<template>
  <div class="h-screen">
    <div ref="container" class="relative h-full overflow-y-auto">
      <!-- 顶部导航 -->
      <UDashboardNavbar
        v-if="!isMatch"
        :toggle="false"
        :ui="{
          root: 'border-none sticky top-0 z-30'
        }"
      >
        <!-- 返回 -->
        <template v-if="!isSelf || (isSelf && !isMobile)" #leading>
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
            @click="
              container.scrollTo({
                top: 0,
                behavior: 'smooth'
              })
            "
            icon="lucide:chevrons-up"
            variant="ghost"
            color="neutral"
          />
          <UButton
            v-if="isSelf"
            icon="lucide:plus"
            variant="ghost"
            color="neutral"
          />
          <UButton
            v-if="isSelf && isMobile"
            icon="lucide:settings"
            variant="ghost"
            color="neutral"
            @click="isSettingSlideoverOpen = true"
          />
          <ContactDropdownMenu
            v-if="!isSelf && isContacts"
          ></ContactDropdownMenu>
        </template>
      </UDashboardNavbar>
      <!-- 背景图片，由于移动端有 pb-16，所有高度全部使用 50vh，而不是 50% -->
      <div
        @click="viewerModal.open({ url: bgURL })"
        :class="[
          isSelf ? 'cursor-pointer' : '',
          bgURL ? 'bg-cover bg-center bg-no-repeat' : 'bg-default',
          isMatch ? '' : '-mt-16'
        ]"
        :style="bgURL ? { 'background-image': `url(${bgURL})` } : {}"
        class="sticky -top-[calc(50vh-4rem)] z-10 h-[50vh] cursor-pointer"
      ></div>
      <!-- 个人资料卡片 -->
      <UPageCard
        class="absolute top-[50vh] right-4 left-4 z-20 -translate-y-[calc(100%+1rem)] sm:right-6 sm:left-6 sm:-translate-y-[calc(100%+1.5rem)]"
        :title="nickname"
        description="Nuxt UI v3 integrates with latest Tailwind CSS v4, bringing significant improvements."
        variant="soft"
      >
        <template #title>
          <div class="flex items-center gap-2">
            {{ nickname }}
            <UButton
              v-if="!isSelf && Boolean(contactProfileMap[targetId])"
              icon="lucide:user-round-pen"
              label="备注"
            ></UButton>
            <UButton
              v-if="!isSelf && !inView"
              @click="isMessageViewSlideoverOpen = true"
              icon="lucide:message-circle-more"
              label="聊天"
            ></UButton>
          </div>
        </template>
        <template #header>
          <UAvatar
            @click="viewerModal.open({ url: avatarURL })"
            class="absolute top-0 -translate-y-1/2 cursor-pointer"
            :class="isSelf ? 'cursor-pointer' : ''"
            :src="avatarURL"
            :alt="nickname"
            size="3xl"
          ></UAvatar>
          <UButton
            v-if="isSelf"
            @click="spaceBgRef.click()"
            class="absolute top-4 right-4"
            icon="lucide:camera"
            variant="ghost"
          ></UButton>
        </template>
      </UPageCard>
      <!-- 选项卡 -->
      <div v-if="isSelf" class="p-4 sm:p-6">
        <UTabs v-model="activeTab" :items="tabItems" :content="false" />
      </div>
      <!-- 动态 -->
      <UPageCard
        @click="isCardSlideoverOpen = true"
        variant="soft"
        class="border-b-muted cursor-pointer rounded-none border-b"
      >
        <p class="text-highlighted">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Architecto
          reiciendis exercitationem aperiam natus, pariatur eos iste repellat ab
          inventore eius harum consequatur necessitatibus libero officiis
          soluta, autem ea tenetur assumenda!
        </p>
        <div class="flex items-center justify-between">
          <p class="text-muted text-sm">
            {{ new Date(Date.now()).toLocaleString('zh-CN') }}
          </p>
          <UButton variant="ghost" icon="lucide:ellipsis"></UButton>
        </div>
      </UPageCard>
      <UPageCard
        @click="isCardSlideoverOpen = true"
        v-for="i in 3"
        :key="i"
        variant="soft"
        class="border-b-muted cursor-pointer rounded-none border-b"
      >
        <p class="text-highlighted">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Saepe
          facilis
        </p>
        <img
          src="https://picsum.photos/id/46/400"
          alt="Tailwind CSS"
          :width="400"
          :height="400"
          class="w-full"
        />
        <div class="flex items-center justify-between">
          <p class="text-muted text-sm">
            {{ new Date(Date.now()).toLocaleString('zh-CN') }}
          </p>
          <UButton variant="ghost" icon="lucide:ellipsis"></UButton>
        </div>
      </UPageCard>
    </div>

    <!-- 选择背景图片 -->
    <input
      @change="onSpaceBgChange"
      ref="spaceBgRef"
      hidden
      type="file"
      accept="image/*"
    />
    <!-- 聊天界面 -->
    <USlideover
      v-if="!isSelf"
      v-model:open="isMessageViewSlideoverOpen"
      title=" "
      description=" "
    >
      <template #content>
        <MessageView
          v-if="targetId"
          @close="isMessageViewSlideoverOpen = false"
        />
      </template>
    </USlideover>
    <!-- 移动端设置界面 -->
    <USlideover
      v-if="isMobile && isSelf"
      v-model:open="isSettingSlideoverOpen"
      title="设置"
      description=" "
    >
      <template #body>
        <UPageCard
          v-for="items in cards"
          variant="subtle"
          class="mb-4"
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

        <UserInfo v-model="isUserInfoSlideoverOpen"></UserInfo>
        <UpdatePassword
          v-model="isUpdatePasswordSlideoverOpen"
        ></UpdatePassword>
        <Notifications v-model="isNotificationSlideoverOpen"></Notifications>
        <DataManager v-model="isDataManagerSlideoverOpen"></DataManager>
      </template>
    </USlideover>
    <!-- 空间动态详情 -->
    <USlideover
      :dismissible="!isMobile && isMatch ? false : true"
      :overlay="!isMobile && isMatch ? false : true"
      :side="!isMobile && isMatch ? 'left' : 'right'"
      v-model:open="isCardSlideoverOpen"
      :class="!isMobile && isMatch ? 'max-w-2/5' : ''"
      title="详情"
      description=" "
    >
      <template #body>
        <UPageCard @click="isCardSlideoverOpen = true" variant="soft">
          <p class="text-highlighted">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Architecto
            reiciendis exercitationem aperiam natus, pariatur eos iste repellat
            ab inventore eius harum consequatur necessitatibus libero officiis
            soluta, autem ea tenetur assumenda!
          </p>
          <div class="flex items-center justify-between">
            <p class="text-muted text-sm">
              {{ new Date(Date.now()).toLocaleString('zh-CN') }}
            </p>
            <UButton variant="ghost" icon="lucide:ellipsis"></UButton>
          </div>
        </UPageCard>
      </template>
    </USlideover>
  </div>
</template>

<script lang="ts" setup>
import { useMatchStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import DrawerLogout from '@/components/drawer/DrawerLogout.vue'
import { useGetDB, useUpdateOSS } from '@/hooks'
import { useRoute } from 'vue-router'
import ModalViewer from '../modal/ModalViewer.vue'
import UserInfo from '@/views/Profile/UserInfo.vue'
import UpdatePassword from '@/views/Profile/UpdatePassword.vue'
import Notifications from '@/views/Profile/Notifications.vue'
import DataManager from '@/views/Profile/DataManager.vue'

const overlay = useOverlay()
withDefaults(defineProps<{ isMatch?: boolean }>(), {
  isMatch: false
})
const emits = defineEmits(['close'])
const container = ref(null)
const isMessageViewSlideoverOpen = ref(false)
const isSettingSlideoverOpen = ref(false)
const logoutDrawer = overlay.create(DrawerLogout)
const isUserInfoSlideoverOpen = ref(false)
const isUpdatePasswordSlideoverOpen = ref(false)
const isNotificationSlideoverOpen = ref(false)
const isDataManagerSlideoverOpen = ref(false)
const isCardSlideoverOpen = ref(false)
const spaceBgRef = ref(null)
const toast = useToast()
const { matchRes } = storeToRefs(useMatchStore())
const {
  isMobile,
  userInfo,
  avatarURL: _avatarURL
} = storeToRefs(useUserStore())
const { targetId, contactProfileMap, lastMsgMap } = storeToRefs(
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
      label: '通知',
      onSelect: () => (isNotificationSlideoverOpen.value = true)
    }
  ],
  // [
  //   {
  //     icon: 'lucide:palette',
  //     label: '重置主题',
  //     onSelect: () => (isUserInfoSlideoverOpen.value = true)
  //   }
  // ],
  [
    {
      icon: 'lucide:database',
      label: '数据管理',
      onSelect: () => (isDataManagerSlideoverOpen.value = true)
    },
    {
      icon: 'lucide:shield',
      label: '修改密码',
      onSelect: () => (isUpdatePasswordSlideoverOpen.value = true)
    }
  ],
  [
    {
      icon: 'lucide:log-out',
      label: '退出登录',
      onSelect: () => logoutDrawer.open()
    }
  ]
]
const tabItems = [
  {
    label: '我的',
    value: 'my'
  },
  {
    label: '好友',
    value: 'friends'
  }
]
const activeTab = ref('my')
const isSelf = !targetId.value
const route = useRoute()
const isContacts = computed(() => route.path === '/contacts')
// 在聊天界面中打开对方空间或匹配到对方显示的空间不需要显示聊天按钮
const inView = computed(() => {
  const { path } = route
  return path === '/message' || path === '/chat' || path === '/voice-chat'
})
const nickname = computed(() =>
  isSelf
    ? userInfo.value.nickname
    : contactProfileMap.value[targetId.value]?.profile?.nickname ||
      lastMsgMap.value[targetId.value]?.profile?.nickname ||
      matchRes.value.nickname
)
const bgBlob = isSelf
  ? (await (await useGetDB(userInfo.value.id)).get('bg', userInfo.value.id))
      ?.blob
  : null
const { VITE_OSS_BASE_URL } = import.meta.env
const bgURL = ref(
  isSelf
    ? bgBlob
      ? URL.createObjectURL(bgBlob)
      : // 本地数据库中删除了但 OSS 中还存在，TODO: 重新保存到本地数据库
        `${VITE_OSS_BASE_URL}${userInfo.value.id}/space-bg`
    : `${VITE_OSS_BASE_URL}${targetId.value}/space-bg`
)
const avatarURL = ref(
  isSelf ? _avatarURL.value : `${VITE_OSS_BASE_URL}${targetId.value}/avatar`
)
const viewerModal = overlay.create(ModalViewer)

const onSpaceBgChange = e => useUpdateOSS(e, 'bg', userInfo, toast, bgURL)
</script>
