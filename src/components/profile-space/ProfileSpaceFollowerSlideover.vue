<template>
  <USlideover
    v-model:open="isFollowSlideoverOpen"
    :class="isMobile ? 'max-w-none' : ''"
    title="关注"
    description=" "
    :ui="{
      body: 'space-y-4 sm:space-y-6',
      description: 'hidden'
    }"
  >
    <template #body>
      <UTabs :items="tabItems" v-model="activeTab">
        <template #content></template
      ></UTabs>
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4">
          <USkeleton class="h-12 w-12 rounded-full" />
          <div class="grid flex-1 gap-2">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-4/5" />
          </div>
        </div>
      </div>
      <div
        v-if="userMap[activeTab].length"
        v-for="{ following, followingProfile: { nickname, bio } } in userMap[
          activeTab
        ]"
        :key="following"
        @click="
          !activeSpaceTargetIds.has(following) &&
          profileSpaceOverlay.open({
            targetId: following
          })
        "
      >
        <UUser
          :avatar="{
            src: `${VITE_OSS_BASE_URL}avatar/${following}`,
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
                v-if="activeTab === 'follower'"
                label="移除粉丝"
                size="xs"
              />
              <UButton
                v-else
                @click.stop="onUnfollow(following)"
                label="取消关注"
                size="xs"
              />
            </template>
          </template>
        </UUser>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { getFollowersAPI, getFollowingAPI, unfollowAPI } from '@/apis/follow'
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

const onUnfollow = async id => {
  try {
    await unfollowAPI(id)
    toast.add({ title: '取消关注成功', icon: 'lucide:smile' })
  } catch (error) {
    toast.add({ title: '取消关注失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const getUsers = async () => {
  const _userMap = userMap.value
  const v = activeTab.value

  if (v === 'following' && loadingFollowings.value) {
    loading.value = true
    const { data } = await getFollowingAPI(isSelf ? '' : props.targetId)

    if (data.length) {
      _userMap[v] = data
    }

    loadingFollowings.value = false
    loading.value = false
  } else if (v === 'follower' && loadingFollowers.value) {
    loading.value = true
    const { data } = await getFollowersAPI(isSelf ? '' : props.targetId)

    if (data.length) {
      data.map(item => {
        item.following = item.follower
        item.followingProfile = item.followerProfile
      })
      _userMap[v] = data
    }

    loadingFollowers.value = false
    loading.value = false
  }
}

watch(activeTab, () => {
  getUsers()
})
</script>
