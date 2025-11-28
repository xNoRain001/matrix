<template>
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
    class="sticky -top-[calc(50vh-4rem)] z-10 mx-auto h-[50vh] cursor-pointer object-cover"
    @error="isPlaceholderShow = true"
  />
  <!-- 个人资料卡片 -->
  <div
    class="bg-elevated/50 absolute top-[50vh] right-4 left-4 z-20 -translate-y-[calc(100%+1rem)] rounded-lg p-4 sm:right-6 sm:left-6 sm:-translate-y-[calc(100%+1.5rem)] sm:p-6"
  >
    <div class="mt-4 flex items-start justify-between gap-2">
      <span class="text-highlighted break-all">{{
        targetProfile.nickname
      }}</span>
      <!-- <UButton
        v-if="!isSelf && Boolean(contactProfileMap[targetId])"
        icon="lucide:user-round-pen"
        label="备注"
        size="xs"
      ></UButton> -->
      <div class="flex gap-2">
        <UButton
          v-if="!isSelf && !targetProfile.isFollower"
          @click="onFollow"
          icon="lucide:plus"
          label="关注"
          size="xs"
        />
        <UButton
          v-if="!isSelf && targetProfile.isFollower"
          @click="onUnfollow"
          icon="lucide:check"
          label="已关注"
          size="xs"
        />
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
          @click="
            chatOverlay.open({
              targetId,
              targetNickname: targetProfile.nickname
            })
          "
          icon="lucide:message-circle"
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
    </div>
    <div class="text-toned text-xs">
      ID：{{ String(targetProfile.registerIndex).padStart(5, '0') }} / IP：{{
        targetProfile.ipInfo.province || '未知'
      }}
    </div>
    <div v-if="targetProfile.bio" class="text-highlighted mt-2 text-sm">
      {{ targetProfile.bio }}
    </div>
    <div
      v-if="isSelf || targetProfile.ocTags.length"
      class="mt-2 flex flex-wrap gap-2"
    >
      <ProfileSpaceTags :target-profile="targetProfile" />
      <UBadge
        v-if="isSelf"
        icon="lucide:circle-plus"
        label="标签"
        @click="isTagSlideoverOpen = true"
      />
    </div>
    <div class="text-highlighted mt-2 flex gap-4 text-xs">
      <div @click="onOpenFollowerSlideover('following')">
        关注：{{ targetProfile.followingCount }}
      </div>
      <div @click="onOpenFollowerSlideover('follower')">
        粉丝：{{ targetProfile.followerCount }}
      </div>
    </div>
    <UAvatar
      @click="
        viewerOverlay.open({
          urls: [
            {
              url: isSelf ? avatarURL : `${VITE_OSS_BASE_URL}avatar/${targetId}`
            }
          ]
        })
      "
      class="ring-accented absolute top-0 -translate-y-1/2 cursor-pointer ring-2"
      :src="isSelf ? avatarURL : `${VITE_OSS_BASE_URL}avatar/${targetId}`"
      :alt="targetProfile.nickname[0]"
      size="3xl"
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
  <!-- 修改标签 -->
  <ProfileSpaceTagsSlideover
    v-if="isSelf"
    v-model="isTagSlideoverOpen"
    :target-id="targetId"
    :target-profile="targetProfile"
  />
  <ProfileSpaceFollowerSlideover
    v-model="isFollowSlideoverOpen"
    v-model:active-tab="activeTab"
    :target-id="targetId"
  />
</template>

<script lang="ts" setup>
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, useTemplateRef, watch } from 'vue'
import { useUpdateStaticNameFile } from '@/hooks'
import { useRoute } from 'vue-router'
import OverlayViewer from '@/components/overlay/OverlayViewer.vue'
import OverlayChat from '@/components/overlay/OverlayChat.vue'
import type { userInfo } from '@/types'
import {
  followAPI,
  isPublicFollowersAPI,
  isPublicFollowingAPI,
  unfollowAPI
} from '@/apis/follower'
import ProfileSpaceFollowerSlideover from './ProfileSpaceFollowerSlideover.vue'

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
const spaceBgRef = useTemplateRef('spaceBgRef')
const toast = useToast()
const { isMobile, userInfo, avatarURL, globalSocket } =
  storeToRefs(useUserStore())
const { activeTargetIds } = storeToRefs(useRecentContactsStore())
const isSelf = props.targetId === userInfo.value.id
const route = useRoute()
const { VITE_OSS_BASE_URL } = import.meta.env
const bgURL = ref(`${VITE_OSS_BASE_URL}spaceBg/${props.targetId}`)
const viewerOverlay = overlay.create(OverlayViewer)
const chatOverlay = overlay.create(OverlayChat)
const isTagSlideoverOpen = ref(false)
const isPlaceholderShow = ref(false)
const isFollowSlideoverOpen = ref(false)
const { path } = route
const isChatBtnShow = path === '/messages' && activeTargetIds.value.size === 1
const isContacts = path === '/contacts'
const activeTab = ref<'' | 'following' | 'follower'>('')

const onOpenFollowerSlideover = async v => {
  if (!isSelf) {
    const { targetId } = props
    const isFollowing = v === 'following'
    const api = isFollowing ? isPublicFollowingAPI : isPublicFollowersAPI
    const { data } = await api(targetId)

    if (!data) {
      return toast.add({
        title: `由于该用户隐私设置，${isFollowing ? '关注' : '粉丝'}列表不可见`,
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }
  }

  activeTab.value = v
  isFollowSlideoverOpen.value = true
}

const onFollow = async () => {
  try {
    const { targetId } = props
    await followAPI(targetId)
    props.targetProfile.isFollower = true
    props.targetProfile.followerCount++
    userInfo.value.profile.followingCount++
    globalSocket.value.emit('follow', targetId)
    toast.add({
      title: '关注成功',
      icon: 'lucide:smile'
    })
  } catch (error) {
    toast.add({
      title: '关注失败',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onUnfollow = async () => {
  try {
    const { targetId } = props
    await unfollowAPI(targetId)
    props.targetProfile.isFollower = false
    props.targetProfile.followerCount--
    userInfo.value.profile.followingCount--
    toast.add({
      title: '取消关注成功',
      icon: 'lucide:smile'
    })
  } catch (error) {
    toast.add({
      title: '取消关注失败',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

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
</script>
