<template>
  <UDashboardPanel id="playground" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <PlaygroundHeader v-model="allPostLoaded" />
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
      <div v-if="postMap[activeTab]?.posts?.length">
        <div
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
          class="hover:bg-accented/50 border-b-accented/50 cursor-pointer space-y-2 rounded-none border-b p-4 sm:p-6"
        >
          <!-- :description="`${useFormatTimeAgo(createdAt)} · 广东`" -->
          <UUser
            :avatar="{
              src: `${VITE_OSS_BASE_URL}avatar/${user}`,
              alt: profile.nickname[0]
            }"
            :name="profile.nickname"
            :description="useFormatTimeAgo(createdAt)"
            size="xl"
            @click="
              !activeSpaceTargetIds.has(user) &&
              profileSpaceOverlay.open({
                targetId: user,
                targetProfile: profile
              })
            "
            :ui="{
              avatar: 'group-hover/user:scale-100',
              name: 'break-all'
            }"
          />
          <div v-if="content.text" class="break-all whitespace-pre-wrap">
            {{ content.text }}
          </div>
          <Carousel
            v-if="content.images.length"
            :items="content.images"
            :active-index="0"
          />
          <div class="flex justify-end gap-2">
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
            />
            <UButton
              variant="ghost"
              :color="liked ? 'secondary' : 'primary'"
              icon="lucide:heart"
              :label="String(likes || '')"
              @click="
                useLike(toast, postMap[activeTab].posts[index], _id, 'post')
              "
            />
            <UButton
              v-if="isMobile"
              variant="ghost"
              icon="lucide:ellipsis"
              @click.stop="onOpenDropdownMenu(user, _id)"
            />
            <UDropdownMenu v-else :items="dropdownMenuItems">
              <UButton
                variant="ghost"
                icon="lucide:ellipsis"
                @click.stop="onOpenDropdownMenu(user, _id)"
              />
            </UDropdownMenu>
          </div>
        </div>
        <USeparator
          v-if="allPostLoaded"
          class="p-4 sm:p-6"
          label="已经到底了"
        />
        <Transition
          enter-active-class="animate-[fade-in_200ms_ease-out]"
          leave-active-class="animate-[fade-out_200ms_ease-in]"
        >
          <div
            v-if="!isMobile && isAutoScrollBtnShow"
            class="absolute top-5/6 w-full"
          >
            <UButton
              @click="onScrollToTop"
              class="absolute right-4 rounded-full sm:right-6"
              variant="outline"
              color="neutral"
              icon="lucide:arrow-up"
            />
          </div>
        </Transition>
      </div>
      <USeparator
        v-if="postMap[activeTab]?.posts?.length === 0"
        class="p-4 sm:p-6"
        label="空空如也"
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
      />
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
  useInitAutoScrollBtn,
  useLike,
  useOpenPostDetailOverlay
} from '@/hooks'
import {
  useFooterStore,
  usePostStore,
  useRecentContactsStore,
  useUserStore
} from '@/store'
import { useThrottleFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

let reportedUserId = null
let reportPostId = null
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile } = storeToRefs(useUserStore())
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
//     icon: 'lucide:refresh-cw'
//   }
// ]
const { postMap } = storeToRefs(usePostStore())
const { activeSpaceTargetIds } = storeToRefs(useRecentContactsStore())
const { footerNavs } = storeToRefs(useFooterStore())
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
const isAutoScrollBtnShow = ref(false)

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

const onScrollToTop = () => {
  document
    .querySelector('#dashboard-panel-playground')
    .children[1].scrollTo({ top: 0, behavior: 'smooth' })
}

const onReport = () => {
  publisherOverlay.open({
    action: 'report',
    reportTarget: 'post',
    reportedUserId,
    reportPostId
  })
}

const onOpenDropdownMenu = (user, postId) => {
  reportedUserId = user
  reportPostId = postId

  if (isMobile.value) {
    isDrawerOpen.value = true
  }
}

const onScroll = useThrottleFn(
  async e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target

    useInitAutoScrollBtn(
      scrollTop,
      isMobile.value,
      footerNavs,
      'playground',
      isAutoScrollBtnShow
    )

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
