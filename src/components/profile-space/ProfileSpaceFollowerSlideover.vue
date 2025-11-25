<template>
  <USlideover
    v-model:open="isFollowSlideoverOpen"
    :class="isMobile ? 'max-w-none' : ''"
    title="关注"
    description=" "
    :ui="{
      body: 'flex flex-col p-0 sm:p-0',
      description: 'hidden'
    }"
  >
    <template #body>
      <UTabs class="gap-0 p-4 sm:p-6" :items="tabItems" v-model="activeTab">
        <template #content></template
      ></UTabs>
      <Skeleton v-if="loading" :count="5" />
      <div class="divide-default divide-y">
        <div
          v-if="userMap[activeTab].length"
          v-for="(
            { targetId, targetProfile: { nickname, bio }, mutual, unfollow },
            index
          ) in userMap[activeTab]"
          :key="targetId"
          @click="
            !activeSpaceTargetIds.has(targetId) &&
            profileSpaceOverlay.open({
              targetId
            })
          "
          class="cursor-pointer p-4 sm:p-6"
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
                <div v-if="activeTab === 'follower'">
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
                <template v-else>
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
            </template>
          </UUser>
        </div>
        <Separator v-if="userMap[activeTab].length === 0" :label="'空空如也'" />
      </div>
      <div v-if="activeTab === 'follower' && !publicFollowers">
        <UIcon name="lucide:eye-off" class="text-dimmed size-32"></UIcon>
        <div class="text-toned text-sm">由于该用户隐私设置，粉丝列表不可见</div>
      </div>
      <div
        v-if="activeTab === 'following' && !publicFollowings"
        class="flex flex-1 flex-col items-center justify-center gap-4"
      >
        <UIcon name="lucide:eye-off" class="text-dimmed size-32"></UIcon>
        <div class="text-toned text-sm">由于该用户隐私设置，关注列表不可见</div>
      </div>
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
const loadingFollowings = ref(true)
const loadingFollowers = ref(true)
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
const userMap = ref({
  following: [],
  follower: []
})

const onRemoveFollower = async (index, targetId) => {
  try {
    await removeFollowerAPI(targetId)
    toast.add({ title: '移除成功', icon: 'lucide:smile' })
    userInfo.value.profile.followerCount--
    userMap.value[activeTab.value].splice(index, 1)
  } catch (error) {
    toast.add({ title: error.message, color: 'error', icon: 'lucide:annoyed' })
  }
}

const onFollow = async (index, targetId, mutual = false) => {
  try {
    await followAPI(targetId)
    toast.add({ title: '关注成功', icon: 'lucide:smile' })
    userInfo.value.profile.followingCount++
    userMap.value[activeTab.value][index].unfollow = false

    if (mutual) {
      userMap.value[activeTab.value][index].mutual = true
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
    userMap.value[activeTab.value][index].unfollow = true

    if (mutual) {
      userMap.value[activeTab.value][index].mutual = false
    }
  } catch (error) {
    toast.add({ title: error.message, color: 'error', icon: 'lucide:annoyed' })
  }
}

const getUsers = async () => {
  const _userMap = userMap.value
  const v = activeTab.value

  if (v === 'following' && loadingFollowings.value) {
    loading.value = true
    const { targetId } = props

    if (!isSelf) {
      const { data } = await isPublicFollowingAPI(targetId)

      if (!data) {
        publicFollowings.value = false
        loadingFollowings.value = false
        loading.value = false
        return
      }
    }

    const { data } = await getFollowingAPI(isSelf ? '' : targetId)

    if (data.length) {
      _userMap[v] = data
    }

    userInfo.value.profile.followingCount = data.length
    loadingFollowings.value = false
    loading.value = false
  } else if (v === 'follower' && loadingFollowers.value) {
    loading.value = true
    const { targetId } = props

    if (!isSelf) {
      const { data } = await isPublicFollowersAPI(targetId)

      if (!data) {
        publicFollowers.value = false
        loadingFollowers.value = false
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
      _userMap[v] = data
    }

    userInfo.value.profile.followerCount = data.length
    loadingFollowers.value = false
    loading.value = false
  }
}

watch(activeTab, () => {
  getUsers()
})
</script>
