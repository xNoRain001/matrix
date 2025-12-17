<template>
  <USlideover
    v-model:open="isFollowSlideoverOpen"
    :class="isMobile ? 'max-w-none' : ''"
    title="关注"
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #body>
      <UTabs :content="false" :items="tabItems" v-model="activeTab" />
      <Skeleton v-if="loading" :count="5" />
      <template v-if="activeTab === 'follower'">
        <div v-if="followerList?.length >= 0" class="divide-default divide-y">
          <div
            v-for="(
              { targetId, targetProfile: { nickname, bio }, mutual }, index
            ) in followerList"
            :key="targetId"
            @click="
              !activeSpaceTargetIds.has(targetId) &&
              profileSpaceOverlay.open({
                targetId
              })
            "
            class="cursor-pointer py-4 sm:py-6"
          >
            <UUser
              :avatar="{
                src: `${VITE_OSS_BASE_URL}avatar/${targetId}`,
                alt: nickname[0]
              }"
              :description="bio"
              size="xl"
              :ui="{
                wrapper: 'flex-1 min-w-0',
                name: 'flex justify-between items-center gap-2',
                description: 'truncate'
              }"
            >
              <template #name>
                <span class="truncate">{{ nickname }}</span>
                <template v-if="isSelf">
                  <div class="flex gap-2">
                    <UButton
                      v-if="mutual"
                      @click.stop="onUnfollow(index, targetId, true)"
                      label="互相关注"
                      size="xs"
                    />
                    <UButton
                      v-else
                      @click.stop="onFollow(index, targetId, true)"
                      label="回关"
                      size="xs"
                    />
                    <UButton
                      @click.stop="onRemoveFollower(index, targetId)"
                      label="移除"
                      size="xs"
                    />
                  </div>
                </template>
              </template>
            </UUser>
          </div>
          <Separator v-if="followerList.length === 0" label="空空如也" />
        </div>
        <Separator
          v-else-if="!publicFollowers"
          label="由于该用户隐私设置，粉丝列表不可见"
        />
      </template>
      <template v-if="activeTab === 'following'">
        <div v-if="followingList?.length >= 0" class="divide-default divide-y">
          <div
            v-for="(
              { targetId, targetProfile: { nickname, bio }, mutual, unfollow },
              index
            ) in followingList"
            :key="targetId"
            @click="
              !activeSpaceTargetIds.has(targetId) &&
              profileSpaceOverlay.open({
                targetId
              })
            "
            class="cursor-pointer py-4 sm:py-6"
          >
            <UUser
              :avatar="{
                src: `${VITE_OSS_BASE_URL}avatar/${targetId}`,
                alt: nickname[0]
              }"
              :description="bio"
              size="xl"
              :ui="{
                wrapper: 'flex-1 min-w-0',
                name: 'flex justify-between items-center gap-2',
                description: 'truncate'
              }"
            >
              <template #name>
                <span class="truncate">{{ nickname }}</span>
                <template v-if="isSelf">
                  <UButton
                    v-if="unfollow"
                    @click.stop="onFollow(index, targetId)"
                    label="关注"
                    size="xs"
                  />
                  <UButton
                    v-else
                    @click.stop="onUnfollow(index, targetId)"
                    :label="mutual ? '互相关注' : '已关注'"
                    size="xs"
                  />
                </template>
              </template>
            </UUser>
          </div>
          <Separator v-if="followingList.length === 0" :label="'空空如也'" />
        </div>
        <Separator
          v-else-if="!publicFollowings"
          label="由于该用户隐私设置，关注列表不可见"
        />
      </template>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import {
  followAPI,
  getFollowersAPI,
  getFollowingAPI,
  isPublicFollowersAPI,
  isPublicFollowingAPI,
  removeFollowerAPI,
  unfollowAPI
} from '@/apis/follower'
import OverlayProfileSpace from '../overlay/OverlayProfileSpace.vue'

const props = defineProps<{
  targetId: string
}>()
const isFollowSlideoverOpen = defineModel<boolean>()
const activeTab = defineModel<'' | 'following' | 'follower'>('active-tab')
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { activeSpaceTargetIds } = storeToRefs(useRecentContactsStore())
const isSelf = props.targetId === userInfo.value.id
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)
const loading = ref(true)
// const allFollowingsLoaded = ref(false)
// const allFollowersLoaded = ref(false)
const publicFollowings = ref(true)
const publicFollowers = ref(true)
const toast = useToast()
const { VITE_OSS_BASE_URL } = import.meta.env
const tabItems = [
  {
    label: '关注',
    value: 'following'
  },
  {
    label: '粉丝',
    value: 'follower'
  }
]
const followerList = ref(null)
const followingList = ref(null)

const onRemoveFollower = async (index, targetId) => {
  try {
    await removeFollowerAPI(targetId)
    toast.add({ title: '移除成功', icon: 'lucide:smile' })
    userInfo.value.profile.followerCount--
    followerList.value.splice(index, 1)
  } catch (error) {
    toast.add({ title: error.message, color: 'error', icon: 'lucide:annoyed' })
  }
}

const onFollow = async (index, targetId, mutual = false) => {
  try {
    await followAPI(targetId)
    toast.add({ title: '关注成功', icon: 'lucide:smile' })
    userInfo.value.profile.followingCount++
    followingList.value[index].unfollow = false

    if (mutual) {
      followingList.value[index].mutual = true
    }
  } catch (error) {
    toast.add({ title: error.message, color: 'error', icon: 'lucide:annoyed' })
  }
}

const onUnfollow = async (index, targetId, mutual = false) => {
  try {
    await unfollowAPI(targetId)
    toast.add({ title: '取消关注成功', icon: 'lucide:smile' })
    userInfo.value.profile.followingCount--
    followingList.value[index].unfollow = true

    if (mutual) {
      followingList.value[index].mutual = false
    }
  } catch (error) {
    toast.add({ title: error.message, color: 'error', icon: 'lucide:annoyed' })
  }
}

const getUsers = async () => {
  const v = activeTab.value

  if (v === 'following' && publicFollowings.value && !followingList.value) {
    loading.value = true
    const { targetId } = props

    if (!isSelf) {
      const { data } = await isPublicFollowingAPI(targetId)

      if (!data) {
        publicFollowings.value = false
        loading.value = false
        return
      }
    }

    const { data } = await getFollowingAPI(isSelf ? '' : targetId)
    followingList.value = data

    if (isSelf) {
      userInfo.value.profile.followingCount = data.length
    }

    loading.value = false
  } else if (v === 'follower' && publicFollowers.value && !followerList.value) {
    loading.value = true
    const { targetId } = props

    if (!isSelf) {
      const { data } = await isPublicFollowersAPI(targetId)

      if (!data) {
        publicFollowers.value = false
        loading.value = false
        return
      }
    }

    const { data } = await getFollowersAPI(isSelf ? '' : targetId)

    if (data.length) {
      data.map(item => {
        item.targetId = item.user
        item.targetProfile = item.profile
      })
    }

    followerList.value = data

    if (isSelf) {
      userInfo.value.profile.followerCount = data.length
    }
    loading.value = false
  }
}

watch(activeTab, () => {
  getUsers()
})
</script>
