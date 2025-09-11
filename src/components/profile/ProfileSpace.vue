<template>
  <div>
    <div ref="container" class="relative h-screen overflow-y-auto">
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
          />
          <UButton v-if="isSelf" icon="lucide:plus" variant="ghost" />
          <UButton
            v-if="isSelf && isMobile"
            icon="lucide:settings"
            variant="ghost"
            @click="isOpenSettingsSlideover = true"
          />
          <MessageDropdownMenu
            v-if="!isSelf"
            :target-id="selectContactId"
          ></MessageDropdownMenu>
        </template>
      </UDashboardNavbar>
      <!-- 背景图片 -->
      <div
        @click="isSelf ? onUpdateSpaceBg() : useNoop()"
        :class="[
          isSelf ? 'cursor-pointer' : '',
          bgURL ? 'bg-cover bg-center bg-no-repeat' : 'bg-default',
          isMatch ? '' : '-mt-16'
        ]"
        :style="bgURL ? { 'background-image': `url(${bgURL})` } : {}"
        class="sticky -top-[calc(50%-4rem)] z-10 h-1/2"
      ></div>
      <!-- 个人资料卡片 -->
      <UPageCard
        class="absolute top-1/2 right-4 left-4 z-20 -translate-y-[calc(100%+1rem)] sm:right-6 sm:left-6 sm:-translate-y-[calc(100%+1.5rem)]"
        :title="nickname"
        description="Nuxt UI v3 integrates with latest Tailwind CSS v4, bringing significant improvements."
        variant="soft"
      >
        <template #title>
          <div class="flex items-center gap-2">
            {{ nickname }}
            <UButton
              v-if="!isSelf && Boolean(contactProfileMap[selectContactId])"
              icon="lucide:user-round-pen"
              label="备注"
            ></UButton>
            <UButton
              v-if="!isSelf && !inView"
              @click="onChat"
              icon="lucide:message-circle-more"
              label="聊天"
            ></UButton>
          </div>
        </template>
        <template #header>
          <UAvatar
            @click="isSelf ? onUpdateAvatar() : useNoop()"
            class="absolute top-0 -translate-y-1/2"
            :class="isSelf ? 'cursor-pointer' : ''"
            :src="avatarURL"
            :alt="nickname"
            size="3xl"
          ></UAvatar>
          <UButton
            v-if="isSelf"
            @click="onUpdateSpaceBg"
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
        @click="isOpenCardSlideover = true"
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
        @click="isOpenCardSlideover = true"
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

    <!-- 选择头像 -->
    <input
      @change="onChangeAvatar"
      ref="avatarRef"
      hidden
      type="file"
      accept="image/*"
    />
    <!-- 选择背景图片 -->
    <input
      @change="onChangeSpaceBg"
      ref="spaceBgRef"
      hidden
      type="file"
      accept="image/*"
    />
    <!-- 聊天界面 -->
    <USlideover
      v-if="!isSelf"
      v-model:open="isOpenMessageViewSlideover"
      title=" "
      description=" "
    >
      <template #content>
        <MessageView
          v-if="targetId"
          @close="isOpenMessageViewSlideover = false"
          :target-id="targetId"
        />
      </template>
    </USlideover>
    <!-- 移动端设置界面 -->
    <USlideover
      v-if="isMobile && isSelf"
      v-model:open="isOpenSettingsSlideover"
      title="设置"
      description=" "
    >
      <template #body>
        <div>
          <UPageCard
            v-for="items in cards"
            variant="subtle"
            class="mb-4"
            :ui="{ container: 'gap-y-0 py-0 sm:py-0' }"
          >
            <div
              v-for="{ label, icon, onSelect } in items"
              @click="onSelect"
              class="flex h-12 items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <UIcon :name="icon" class="size-5" />
                <div>{{ label }}</div>
              </div>
              <UIcon name="lucide:chevron-right" class="size-5"></UIcon>
            </div>
          </UPageCard>

          <MProfileUserInfo
            v-model="isOpenUserInfoSlideover"
          ></MProfileUserInfo>
          <MProfileUpdatePassword
            v-model="isOpenUpdatePasswordSlideover"
          ></MProfileUpdatePassword>
          <MProfileNotifications
            v-model="isOpenNotificationsSlideover"
          ></MProfileNotifications>
          <MPorfileFixer v-model="isOpenFixerSlideover"></MPorfileFixer>
        </div>
      </template>
    </USlideover>
    <!-- 空间动态详情 -->
    <USlideover
      :dismissible="!isMobile && isMatch ? false : true"
      :overlay="!isMobile && isMatch ? false : true"
      :side="!isMobile && isMatch ? 'left' : 'right'"
      v-model:open="isOpenCardSlideover"
      :class="!isMobile && isMatch ? 'max-w-2/5' : ''"
      title="详情"
      description=" "
    >
      <template #body>
        <UPageCard @click="isOpenCardSlideover = true" variant="soft">
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
import { useGenHash, useGetDB, useNoop } from '@/hooks'
import { updateAvatar, updateSpaceBg } from '@/apis/oss'

const overlay = useOverlay()
const props = withDefaults(
  defineProps<{ selectContactId?: string; isMatch?: boolean }>(),
  {
    isMatch: false
  }
)
const emits = defineEmits(['close'])
const container = ref(null)
const isOpenMessageViewSlideover = ref(false)
const isOpenSettingsSlideover = ref(false)
const logoutDrawer = overlay.create(DrawerLogout)
const isOpenUserInfoSlideover = ref(false)
const isOpenUpdatePasswordSlideover = ref(false)
const isOpenNotificationsSlideover = ref(false)
const isOpenFixerSlideover = ref(false)
const isOpenCardSlideover = ref(false)
const spaceBgRef = ref(null)
const avatarRef = ref(null)
const toast = useToast()
const { matchRes } = storeToRefs(useMatchStore())
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { targetId, contactProfileMap, lastMsgMap } = storeToRefs(
  useRecentContactsStore()
)
const cards = [
  [
    {
      icon: 'lucide:user-round',
      label: '个人资料',
      onSelect: () => (isOpenUserInfoSlideover.value = true)
    },
    {
      icon: 'lucide:bell',
      label: '通知',
      onSelect: () => (isOpenNotificationsSlideover.value = true)
    }
  ],
  [
    {
      icon: 'lucide:palette',
      label: '主题',
      onSelect: () => {}
    },
    {
      icon: 'lucide:sun-moon',
      label: '外观',
      onSelect: () => {}
    }
  ],
  [
    {
      icon: 'lucide:wrench',
      label: '修复',
      onSelect: () => (isOpenFixerSlideover.value = true)
    },
    {
      icon: 'lucide:shield',
      label: '修改密码',
      onSelect: () => (isOpenUpdatePasswordSlideover.value = true)
    },
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
const isSelf = !props.selectContactId
const inView = computed(() => targetId.value === props.selectContactId)
const nickname = computed(() =>
  isSelf
    ? userInfo.value.nickname
    : contactProfileMap.value[props.selectContactId]?.profile?.nickname ||
      lastMsgMap.value[props.selectContactId]?.profile?.nickname ||
      matchRes.value.nickname
)
const bgBlob = isSelf
  ? (await (await useGetDB()).get('bg', userInfo.value.id))?.blob
  : null
const avatarBlob = isSelf
  ? (await (await useGetDB()).get('avatar', userInfo.value.id))?.blob
  : null
const { VITE_OSS_BASE_URL } = import.meta.env
const bgURL = ref(
  isSelf
    ? bgBlob
      ? URL.createObjectURL(bgBlob)
      : // 本地数据库中删除了但 OSS 中还存在，TODO: 重新保存到本地数据库
        `${VITE_OSS_BASE_URL}${userInfo.value.id}/space-bg`
    : `${VITE_OSS_BASE_URL}${props.selectContactId}/space-bg`
)
const avatarURL = ref(
  isSelf
    ? avatarBlob
      ? URL.createObjectURL(avatarBlob)
      : `${VITE_OSS_BASE_URL}${userInfo.value.id}/avatar`
    : `${VITE_OSS_BASE_URL}${props.selectContactId}/avatar`
)
const onChat = () => {
  isOpenMessageViewSlideover.value = true
  targetId.value = props.selectContactId
}

const onUpdateSpaceBg = () => spaceBgRef.value.click()

const onUpdateAvatar = () => avatarRef.value.click()

const onChangeAvatar = async e => {
  const input = e.target
  const avatar = input.files[0]

  try {
    const hash = await useGenHash(avatar)
    await updateAvatar(avatar, hash)
    const db = await useGetDB()
    await db.put('avatar', { id: userInfo.value.id, blob: avatar })
    avatarURL.value = URL.createObjectURL(avatar)
    toast.add({ title: '更新头像成功', icon: 'lucide:smile' })
  } catch (error) {
    toast.add({ title: '更新头像失败', color: 'error', icon: 'lucide:annoyed' })
  } finally {
    input.value = ''
  }
}

const onChangeSpaceBg = async e => {
  const input = e.target
  const bg = input.files[0]

  try {
    const hash = await useGenHash(bg)
    await updateSpaceBg(bg, hash)
    const db = await useGetDB()
    await db.put('bg', { id: userInfo.value.id, blob: bg })
    bgURL.value = URL.createObjectURL(bg)
    toast.add({ title: '更新背景成功', icon: 'lucide:smile' })
  } catch (error) {
    toast.add({ title: '更新背景失败', color: 'error', icon: 'lucide:annoyed' })
  } finally {
    input.value = ''
  }
}
</script>
