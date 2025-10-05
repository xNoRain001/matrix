<template>
  <UDashboardPanel id="playground">
    <template #header>
      <PlaygroundHeader></PlaygroundHeader>
    </template>
    <template #body>
      <UTabs
        :items="tabItems"
        v-model="activeTab"
        variant="link"
        :ui="{ root: 'gap-4 sm:gap-6' }"
      >
        <template #content>
          <UPageColumns
            v-if="postMap?.[activeTab]?.posts?.length"
            class="gap-4 space-y-4 sm:gap-6 sm:space-y-6"
            :class="
              activeTab === 'friend' ? 'column-1 md:columns-1 lg:columns-1' : ''
            "
          >
            <UPageCard
              v-for="(
                {
                  _id,
                  user,
                  profile,
                  content,
                  createdAt,
                  likes,
                  liked,
                  commentCount
                },
                index
              ) in postMap[activeTab].posts"
              :key="_id"
              variant="subtle"
              class="hover:bg-accented/50 cursor-pointer"
              :ui="{ body: 'w-full' }"
            >
              <template #header>
                <UUser
                  :avatar="{
                    alt: profile?.nickname[0]
                  }"
                  :name="profile?.nickname"
                  :description="profile?.bio"
                  size="xl"
                  @click="
                    useOpenSpace(
                      profileSpaceOverlay,
                      userInfo,
                      activeTargetIds,
                      user,
                      profile
                    )
                  "
                >
                </UUser>
              </template>
              <template #description>
                <!-- before:content-[open-quote] after:content-[close-quote] -->
                <div
                  class="text-base before:content-[open-quote] after:content-[close-quote]"
                >
                  {{ content.text }}
                </div>
                <Carousel
                  v-if="content.images.length"
                  :items="content.images"
                  :active-index="0"
                ></Carousel>

                <div class="flex items-center justify-between">
                  <p class="text-toned text-sm">
                    {{ useFormatTimeAgo(createdAt) }} · 广东
                  </p>
                  <div>
                    <UButton
                      variant="ghost"
                      icon="lucide:message-circle"
                      :label="String(commentCount || '')"
                      @click="
                        useOpenPostDetailOverlay(
                          postMap,
                          activeTab,
                          _id,
                          index,
                          postDetailOverlay
                        )
                      "
                    ></UButton>
                    <UButton
                      variant="ghost"
                      :color="liked ? 'secondary' : 'primary'"
                      icon="lucide:heart"
                      :label="String(likes || '')"
                      @click="
                        useLike(
                          toast,
                          postMap[activeTab].posts[index],
                          _id,
                          'post'
                        )
                      "
                    ></UButton>
                    <UButton
                      v-if="isMobile"
                      variant="ghost"
                      icon="lucide:ellipsis"
                    ></UButton>
                    <UDropdownMenu v-else :items="dropdownMenuItems">
                      <UButton variant="ghost" icon="lucide:ellipsis"></UButton>
                    </UDropdownMenu>
                  </div>
                </div>
              </template>
            </UPageCard>
          </UPageColumns>
        </template>
      </UTabs>
    </template>
    <template v-if="isMobile" #footer>
      <div class="h-16"></div>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { getPlaygroundPostsAPI } from '@/apis/post'
import OverlayPostDetail from '@/components/overlay/OverlayPostDetail.vue'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'
import {
  useFormatTimeAgo,
  useLike,
  useOpenPostDetailOverlay,
  useOpenSpace
} from '@/hooks'
import { usePostStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

const { isMobile, userInfo } = storeToRefs(useUserStore())
const activeTab = ref<'latest' | 'friend' | 'hot'>('latest')
const tabItems = [
  {
    label: '好友',
    value: 'friend'
  },
  // {
  //   label: '热门',
  //   value: 'hot',
  // },
  {
    label: '最新',
    value: 'latest'
  }
]
const { postMap } = storeToRefs(usePostStore())
const { activeTargetIds } = storeToRefs(useRecentContactsStore())
const dropdownMenuItems = [
  [
    {
      label: '举报',
      icon: 'lucide:info',
      color: 'error'
    }
  ]
]
const toast = useToast()
const overlay = useOverlay()
const postDetailOverlay = overlay.create(OverlayPostDetail)
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)

watch(activeTab, async v => {
  if (!postMap.value[v]) {
    postMap.value[v] = {} as any
    postMap.value[v].posts = (await getPlaygroundPostsAPI(v)).data
  }
})

onMounted(async () => {
  const _activeTab = activeTab.value
  postMap.value[_activeTab] = {} as any
  postMap.value[_activeTab].posts = (
    await getPlaygroundPostsAPI(_activeTab)
  ).data
})
</script>
