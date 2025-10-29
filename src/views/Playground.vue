<template>
  <UDashboardPanel id="playground">
    <template #header>
      <PlaygroundHeader v-model="allPostLoaded"></PlaygroundHeader>
    </template>
    <template #body>
      <!-- <UTabs ref="tabsRef" :items="tabItems" v-model="activeTab">
        <template #content> -->
      <template v-if="loading">
        <div v-for="i in 10" :key="i" class="flex items-center gap-4">
          <USkeleton class="h-12 w-12 rounded-full" />

          <div class="grid flex-1 gap-2">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-4/5" />
          </div>
        </div>
      </template>
      <UPageList
        v-if="postMap[activeTab]?.posts?.length"
        class="space-y-4 sm:space-y-6"
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
          :ui="{ header: 'mb-2', body: 'w-full' }"
        >
          <template #header>
            <UUser
              :avatar="{
                src: `${VITE_OSS_BASE_URL}avatar/${user}`,
                alt: profile.nickname[0]
              }"
              :name="profile.nickname"
              :description="profile.bio"
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
              :ui="{
                name: 'break-all'
              }"
            >
            </UUser>
          </template>
          <template #description>
            <!-- before:content-[open-quote] after:content-[close-quote] -->
            <div
              v-if="content.text"
              class="text-base break-words whitespace-pre-wrap"
            >
              {{ content.text }}
            </div>
            <Carousel
              v-if="content.images.length"
              :class="content.text ? 'mt-2' : ''"
              :items="content.images"
              :active-index="0"
            ></Carousel>
            <div
              :class="content.text && !content.images.length ? '' : 'mt-2'"
              class="flex items-center justify-between"
            >
              <p class="text-toned text-sm">
                <!-- · 广东 -->
                {{ useFormatTimeAgo(createdAt) }}
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
                    useLike(toast, postMap[activeTab].posts[index], _id, 'post')
                  "
                ></UButton>
                <UButton
                  v-if="isMobile"
                  variant="ghost"
                  icon="lucide:ellipsis"
                  @click.stop="onOpenDropdownMenu(user, _id)"
                ></UButton>
                <UDropdownMenu v-else :items="dropdownMenuItems">
                  <UButton
                    variant="ghost"
                    icon="lucide:ellipsis"
                    @click.stop="onOpenDropdownMenu(user, _id)"
                  ></UButton>
                </UDropdownMenu>
              </div>
            </div>
          </template>
        </UPageCard>
      </UPageList>
      <USeparator
        v-if="allPostLoaded"
        class="px-4 sm:px-6"
        label="已经到底了"
      />
      <!-- </template>
      </UTabs> -->
    </template>
    <template v-if="isMobile" #footer>
      <div class="h-16"></div>
    </template>
  </UDashboardPanel>

  <UDrawer
    v-if="isMobile"
    v-model:open="isDrawerOpen"
    :handle="false"
    title="操作"
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #footer>
      <UButton
        label="举报"
        class="justify-center"
        color="error"
        @click="onReport"
      ></UButton>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import { getPlaygroundPostsAPI } from '@/apis/playground'
import OverlayPostDetail from '@/components/overlay/OverlayPostDetail.vue'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'
import OverlayPublisher from '@/components/overlay/OverlayPublisher.vue'
import {
  useFormatTimeAgo,
  useLike,
  useOpenPostDetailOverlay,
  useOpenSpace
} from '@/hooks'
import { usePostStore, useRecentContactsStore, useUserStore } from '@/store'
import { useThrottleFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

let reportUserId = null
let reportPostId = null
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile, userInfo } = storeToRefs(useUserStore())
const activeTab = ref<'latest' | 'friend' | 'hot'>('latest')
// const tabItems = [
//   {
//     label: '好友',
//     value: 'friend'
//   },
//   {
//     label: '热门',
//     value: 'hot'
//   },
//   {
//     label: '最新',
//     value: 'latest',
//     icon: 'lucide:refresh-ccw'
//   }
// ]
const { postMap } = storeToRefs(usePostStore())
const { activeTargetIds } = storeToRefs(useRecentContactsStore())
const dropdownMenuItems = [
  [
    {
      label: '举报',
      icon: 'lucide:circle-alert',
      color: 'error',
      onSelect: () => onReport()
    }
  ]
]
const toast = useToast()
const overlay = useOverlay()
const postDetailOverlay = overlay.create(OverlayPostDetail)
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)
const publisherOverlay = overlay.create(OverlayPublisher)
// const tabsRef = useTemplateRef('tabsRef')
const allPostLoaded = ref(
  (postMap.value[activeTab.value]?.posts?.length || 0) >= 100
)
const loading = ref(postMap.value[activeTab.value]?.posts === undefined)
const isDrawerOpen = ref(false)

// const getLatestData = async () => {
//   const _activeTab = activeTab.value

//   if (_activeTab === 'latest') {
//     const posts = (
//       await getPlaygroundPostsAPI(
//         _activeTab,
//         '',
//         postMap.value[_activeTab].posts[0]._id
//       )
//     ).data
//     const { length } = posts

//     if (length) {
//       if (length < 10) {
//         postMap.value[_activeTab].posts.unshift(...posts)
//       } else {
//         postMap.value[_activeTab].posts = posts
//         allPostLoaded.value = false
//       }
//     } else {
//       toast.add({
//         title: '暂时没有新内容',
//         color: 'error',
//         icon: 'lucide:annoyed'
//       })
//     }
//   }
// }

const onReport = () => {
  publisherOverlay.open({
    action: 'report',
    reportTarget: 'post',
    reportUserId,
    reportPostId
  })
}

const onOpenDropdownMenu = (user, postId) => {
  reportUserId = user
  reportPostId = postId

  if (isMobile.value) {
    isDrawerOpen.value = true
  }
}

const onScroll = useThrottleFn(
  async e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target

    // if (!isMobile.value) {
    //   isFloatingBtnShow.value = scrollTop > 400
    // }

    if (allPostLoaded.value) {
      return
    }

    if (scrollHeight - (scrollTop + clientHeight) < 64) {
      const lastId =
        postMap.value[activeTab.value].posts[
          postMap.value[activeTab.value].posts.length - 1
        ]._id
      const { data } = await getPlaygroundPostsAPI(activeTab.value, lastId)
      const { length } = data

      if (length) {
        postMap.value[activeTab.value].posts.push(...data)
      }

      allPostLoaded.value =
        length < 10 || postMap.value[activeTab.value].posts.length > 100
    }
  },
  200,
  true,
  false
)

const getPosts = async () => {
  const _activeTab = activeTab.value

  if (!postMap.value[_activeTab]) {
    postMap.value[_activeTab] = {} as any
    const posts = (await getPlaygroundPostsAPI(_activeTab)).data
    postMap.value[_activeTab].posts = posts
    allPostLoaded.value = posts.length < 10
    loading.value = false
  }
}

watch(activeTab, getPosts)

onMounted(async () => {
  await getPosts()

  // tabsRef.value.triggersRef[0].$el.addEventListener('click', getLatestData)
  document
    .querySelector('#dashboard-panel-playground')
    .children[1].addEventListener('scroll', onScroll)
})
</script>
