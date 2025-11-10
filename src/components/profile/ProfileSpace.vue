<template>
  <!-- 
    浮动按钮需要相对于容器进行定位，正常情况下不添加 translate-z-0" 也是正常的，
    由于 PC 端可以直接点击好友，显示空间，此时容器需要添加 translate-z-0
  -->
  <div class="h-screen w-full translate-z-0">
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
            <span>{{ targetProfile.bio }} </span>
          </div>
          <div class="mt-2 space-y-2 space-x-2">
            <ProfileSpaceTags :target-profile="targetProfile" />
            <UBadge
              v-if="isSelf"
              icon="lucide:circle-plus"
              label="标签"
              @click="onOpenTagSlideover"
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
    <USlideover
      v-if="isSelf"
      :class="isMobile ? 'max-w-none' : ''"
      v-model:open="isTagSlideoverOpen"
      title="标签"
      description=" "
      :ui="{ body: 'space-y-4 sm:space-y-6', description: 'hidden' }"
    >
      <template #body>
        <UPageCard
          title="新标签"
          description="创建你的新标签"
          variant="naked"
          orientation="horizontal"
          :class="isMobile ? '' : 'mb-4'"
        />
        <UInput
          :maxlength="12"
          placeholder="输入标签"
          v-model="tag"
          class="w-full"
          enterkeyhint="done"
          @keydown.enter="onAddTag"
          :ui="{ trailing: 'pe-1' }"
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
        />
        <USelect
          v-model="mbti"
          :items="mbtiItems"
          class="w-full"
          placeholder="选择你的 MBTI"
        />
        <UPageCard
          :title="`我的标签（${tags.length} / 10）`"
          description="通过拖拽修改标签位置"
          variant="naked"
          orientation="horizontal"
          :class="isMobile ? '' : 'mb-4'"
        />
        <UPageCard>
          <div ref="tagRef" class="flex flex-wrap gap-2">
            <UBadge
              trailing-icon="lucide:circle-x"
              v-for="(tag, index) in tags"
              :label="tag"
              :key="tag"
              @click="onDeleteTag(index)"
            />
          </div>
        </UPageCard>
        <UButton
          class="w-full justify-center"
          label="确认"
          @click="onUpdateTag"
        />
      </template>
    </USlideover>
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
const { isMobile, userInfo, avatarURL, globalSocket } =
  storeToRefs(useUserStore())
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
const isPlaceholderShow = ref(false)
const t = activeTargetIds.value.size === 1
const { path } = route
const isChatBtnShow = path === '/messages' && t
const isSetting = path === '/profile' && t
const isContacts = path === '/contacts'

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
    globalSocket.value.emit('refresh-profile', token)
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

  if (_tags.length >= 10) {
    toast.add({
      title: '标签数量达到上限',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

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
