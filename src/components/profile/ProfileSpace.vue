<template>
  <div class="h-screen w-full">
    <div ref="containerRef" class="relative h-full overflow-y-auto">
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
            v-if="isSelf"
            icon="lucide:pencil-line"
            variant="ghost"
            @click="publisherOverlay.open({ action: 'post', targetId })"
          />
          <UButton
            v-if="isSelf && isMobile"
            icon="lucide:settings"
            variant="ghost"
            @click="isSettingSlideoverOpen = true"
          />
          <ContactDropdownMenu
            v-if="!isSelf && isContacts"
            :target-id="targetId"
          ></ContactDropdownMenu>
        </template>
      </UDashboardNavbar>
      <!-- 背景图片，由于移动端有 pb-16，所有高度全部使用 50vh，而不是 50% -->
      <div
        @click="viewerOverlay.open({ urls: [{ url: bgURL }] })"
        :class="[
          isSelf ? 'cursor-pointer' : '',
          bgURL ? 'bg-cover bg-center bg-no-repeat' : 'bg-default',
          isMatch ? '' : '-mt-16'
        ]"
        :style="
          bgURL
            ? {
                'background-image': `url(${bgURL.startsWith('blob:') ? bgURL : VITE_OSS_BASE_URL + bgURL})`
              }
            : {}
        "
        class="sticky -top-[calc(50vh-4rem)] z-10 h-[50vh] cursor-pointer"
      ></div>
      <!-- 个人资料卡片 -->
      <UPageCard
        class="absolute top-[50vh] right-4 left-4 z-20 -translate-y-[calc(100%+1rem)] sm:right-6 sm:left-6 sm:-translate-y-[calc(100%+1.5rem)]"
        variant="soft"
      >
        <template #title>
          <div class="flex items-center gap-2">
            <span>{{ targetProfile.nickname }}</span>
            <!-- <UButton
              v-if="isSelf"
              icon="lucide:user-round-pen"
              size="xs"
            ></UButton> -->
            <UButton
              v-if="!isSelf && Boolean(contactProfileMap[targetId])"
              icon="lucide:user-round-pen"
              label="备注"
              size="xs"
            ></UButton>
            <UButton
              v-if="!isSelf && !inView"
              @click="messageViewOverlay.open({ targetId, targetProfile })"
              icon="lucide:message-circle-more"
              label="聊天"
              size="xs"
            ></UButton>
            <UBadge
              icon="lucide:calendar"
              :label="`${computeDays(targetProfile.createdAt)} 天`"
            ></UBadge>
            <UButton
              v-if="isSelf"
              @click="spaceBgRef.click()"
              icon="lucide:camera"
              label="背景"
              size="xs"
            ></UButton>
          </div>
        </template>
        <template #description>
          <div class="flex items-center gap-2">
            <span>{{ targetProfile.bio }}</span>
            <!-- <UButton
              v-if="isSelf"
              icon="lucide:user-round-pen"
              size="xs"
            ></UButton> -->
          </div>
          <div class="mt-2 space-y-2 space-x-2">
            <ProfileSpaceTags
              :target-profile="targetProfile"
            ></ProfileSpaceTags>
            <UBadge
              v-if="isSelf"
              icon="lucide:circle-plus"
              label="标签"
              @click="onOpenTagSlideover"
            ></UBadge>
          </div>
        </template>
        <template #header>
          <UAvatar
            @click="viewerOverlay.open({ urls: [{ url: avatarURL }] })"
            class="absolute top-0 -translate-y-1/2 cursor-pointer"
            :class="isSelf ? 'cursor-pointer' : ''"
            :src="
              avatarURL.startsWith('blob:')
                ? avatarURL
                : VITE_OSS_BASE_URL + avatarURL
            "
            :alt="targetProfile.nickname"
            size="3xl"
          ></UAvatar>
        </template>
      </UPageCard>
      <!-- 动态 -->
      <ProfileSpacePosts
        :is-match="isMatch"
        :target-id="targetId"
        :container="containerRef"
      ></ProfileSpacePosts>
    </div>

    <!-- 选择背景图片 -->
    <input
      @change="onSpaceBgChange"
      ref="spaceBgRef"
      hidden
      type="file"
      accept="image/png, image/jpeg, image/webp"
    />
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
      <UserInfo v-model="isUserInfoSlideoverOpen"></UserInfo>
      <UpdatePassword v-model="isUpdatePasswordSlideoverOpen"></UpdatePassword>
      <Notifications v-model="isNotificationSlideoverOpen"></Notifications>
      <DataManager v-model="isDataManagerSlideoverOpen"></DataManager>
      <Logoff v-model="isLogoffSlideoverOpen"></Logoff>
      <Theme v-model="isThemeSlideoverOpen"></Theme>
    </template>
    <!-- 标签 -->
    <USlideover
      v-if="isSelf"
      v-model:open="isTagSlideoverOpen"
      title="标签"
      description=" "
      :ui="{ body: 'space-y-4 sm:space-y-6' }"
    >
      <template #body>
        <UPageCard
          title="新标签"
          description="创建你的新标签"
          variant="naked"
          orientation="horizontal"
          :class="isMobile ? '' : 'mb-4'"
        >
        </UPageCard>
        <UInput
          :maxlength="12"
          placeholder="输入标签"
          v-model="tag"
          class="w-full"
          enterkeyhint="done"
          @keydown.enter="onAddTag"
          :ui="{ base: 'bg-elevated/50', trailing: 'pe-1' }"
        >
          <template v-if="tag.length" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ tag.length }}/12
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="tag = ''"
            />
            <UButton size="xs" label="确认" @click="onAddTag" />
          </template>
        </UInput>
        <UPageCard
          title="MBTI"
          description="选择你的 MBTI"
          variant="naked"
          orientation="horizontal"
          :class="isMobile ? '' : 'mb-4'"
        ></UPageCard>
        <USelect
          v-model="mbti"
          :items="mbtiItems"
          class="bg-elevated/50 w-full"
          placeholder="选择你的 MBTI"
        ></USelect>
        <UPageCard
          title="我的标签"
          description="通过拖拽修改标签位置"
          variant="naked"
          orientation="horizontal"
          :class="isMobile ? '' : 'mb-4'"
        ></UPageCard>
        <UPageCard variant="subtle">
          <div ref="tagRef" class="flex flex-wrap gap-2">
            <UBadge
              trailing-icon="lucide:x"
              v-for="(tag, index) in tags"
              :label="tag"
              :key="tag"
              @click="onDeleteTag(index)"
            ></UBadge>
          </div>
        </UPageCard>
        <UButton
          class="w-full justify-center"
          label="确认"
          @click="onUpdateTag"
        ></UButton>
      </template>
    </USlideover>
  </div>
</template>

<script lang="ts" setup>
import { usePostStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  useTemplateRef,
  watch
} from 'vue'
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
import OverlayMessageView from '@/components/overlay/OverlayMessageView.vue'
import type { userInfo } from '@/types'
import { useSortable } from '@vueuse/integrations/useSortable'
import { updateProfile } from '@/apis/profile'

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
const {
  isMobile,
  userInfo,
  avatarURL: _avatarURL
} = storeToRefs(useUserStore())
const {
  activeTargetIds,
  contactProfileMap,
  activeTargetId,
  activeTargetProfile
} = storeToRefs(useRecentContactsStore())
const { postMap } = storeToRefs(usePostStore())
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
    },
    {
      icon: 'lucide:palette',
      label: '主题',
      onSelect: () => (isThemeSlideoverOpen.value = true)
    }
  ],
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
      label: '关于',
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
const isContacts = computed(() => route.path === '/contacts')
// 在聊天界面中打开对方空间或匹配到对方显示的空间不需要显示聊天按钮
const inView = computed(() => {
  const { path } = route
  return path === '/message' || path === '/chat' || path === '/voice-chat'
})
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
        `space-bg/${userInfo.value.id}`
    : `space-bg/${props.targetId}`
)
const avatarURL = ref(isSelf ? _avatarURL.value : `avatar/${props.targetId}`)
const viewerOverlay = overlay.create(OverlayViewer)
const logoutOverlay = overlay.create(OverlayLogout)
const publisherOverlay = overlay.create(OverlayPublisher)
const helpAndSupportOverlay = overlay.create(OverlayHelpAndSupport)
const aboutOverlay = overlay.create(OverlayAbout)
const messageViewOverlay = overlay.create(OverlayMessageView)
const prevRoute = route.path
const isTagSlideoverOpen = ref(false)
const tag = ref('')
const tags = ref(JSON.parse(JSON.stringify(props.targetProfile.tags)))
const mbti = ref(props.targetProfile.mbti)
const mbtiItems = [
  'ISTJ',
  'ISFJ',
  'INFJ',
  'INTJ',
  'ISTP',
  'ISFP',
  'INFP',
  'INTP',
  'ESTP',
  'ESFP',
  'ENFP',
  'ENTP',
  'ESTJ',
  'ESFJ',
  'ENFJ',
  'ENTJ'
]
const tagRef = useTemplateRef('tagRef')

const computeDays = timestamp =>
  Math.ceil((Date.now() - timestamp) / (1000 * 60 * 60 * 24))

const onUpdateTag = async () => {
  const _mbti = mbti.value
  const _tags = JSON.parse(JSON.stringify(tags.value))
  const stringifyTags = _tags.join('__separator__')
  const { profile } = userInfo.value
  const { mbti: __mbti, tags: __tags } = profile
  const sameMBTI = _mbti === __mbti
  const sameTags = stringifyTags === __tags.join('__separator__')

  if (sameMBTI && sameTags) {
    toast.add({
      title: '修改资料成功',
      icon: 'lucide:smile'
    })
    isTagSlideoverOpen.value = false
    return
  }

  const payload = {
    ...(!sameMBTI && { mbti: _mbti }),
    // 值为 __separator__ 表示清空所有标签
    ...(!sameTags && { tags: stringifyTags || '__separator__' })
  }

  try {
    const { data: token } = await updateProfile(payload)
    localStorage.setItem('token', token)
    profile.mbti = _mbti
    profile.tags = _tags
    toast.add({
      title: '修改资料成功',
      icon: 'lucide:smile'
    })
    isTagSlideoverOpen.value = false
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onDeleteTag = index => tags.value.splice(index, 1)

const onAddTag = () => {
  const _tags = tags.value
  const _tag = tag.value

  if (_tags.includes(_tag)) {
    toast.add({ title: '标签已经存在', color: 'error', icon: 'lucide:annoyed' })
    return
  }

  tags.value.unshift(_tag)
  tag.value = ''
}

const onOpenTagSlideover = () => {
  isTagSlideoverOpen.value = true
  setTimeout(() => {
    useSortable(tagRef.value, tags, { animation: 150 })
  })
}

const onSpaceBgChange = e =>
  useUpdateStaticNameFile(e, 'spaceBg', userInfo, toast, bgURL)

watch(
  () => props.targetId,
  v => {
    // PC 端 contact 页面允许无缝切换空间操作，需要更新头像和背景
    if (v && isContacts.value && !isMobile.value) {
      bgURL.value = `space-bg/${v}`
      avatarURL.value = `avatar/${v}`
    }
  }
)

onBeforeMount(() => {
  activeTargetIds.value.add(props.targetId)
})

onBeforeUnmount(() => {
  if (
    !activeTargetIds.value.size ||
    // 页面只打开了一个空间时，关闭空间时不需要重置数据，否则会将聊天界面也关闭
    (activeTargetIds.value.size === 1 &&
      (prevRoute === '/message' ||
        // PC 端聊天匹配可以在这里处理，但语音匹配不可以，同时移动端聊天和语音都不可以，
        // 虽然不会关闭聊天界面，但是需要的数据被重置了，因此在匹配页面销毁时
        // 进行处理
        prevRoute === '/chat' ||
        prevRoute === '/voice-chat'))
  ) {
    return
  }

  // 匹配时离开页面会同时触发空间和聊天视图的销毁行为，选择在这里更新，因为语音匹配
  // 没有聊天视图

  activeTargetIds.value.delete(props.targetId)

  if (!isSelf) {
    delete postMap.value[props.targetId]
  }

  if (activeTargetIds.value.size === 0) {
    // PC 端可能直接从好友界面切换到其他页面，此时 activeTargetIds 的数量可能为 0，也
    // 可能为 1，取决于当前有没有打开空间，contact 销毁前触发这里，此时
    // activeTargetIds 的数量一定为 0，如果销毁前打开了空间，再回来时由于
    // activeTargetId 并没有重置，会有异常，需要重置 activeContactId，可以在
    // contact 的 onBeforeUnmount 中重置，但由于相关操作都在这里，因此在这里重置

    // 手动关闭空间，PC 端直接在 close 事件中重置了 activeContactId，移动端需要
    // 手动修改，同时要考虑 PC 端切换到其他页面，因此不需要 isMobile 条件
    activeTargetId.value = ''
    activeTargetProfile.value = null
  }
})
</script>
