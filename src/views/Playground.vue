<template>
  <UDashboardPanel id="playground" :ui="{ body: 'p-0 sm:p-0 ' }">
    <template #header>
      <PlaygroundHeader v-model="activeTab" />
    </template>
    <template #body>
      <Skeleton v-if="loading" :count="10" />
      <template v-if="activeTab === 'latest'">
        <!-- 存在 length 属性，说明已经成功从服务器获取了数据 -->
        <div v-if="postMap[activeTab]?.posts?.length >= 0">
          <div
            v-for="(
              {
                _id,
                user,
                profile: { nickname, college },
                content,
                createdAt,
                likes,
                like,
                commentCount
              },
              index
            ) in postMap[activeTab].posts"
            :key="_id"
            class="bg-elevated/50 space-y-2 p-4 not-first:mt-2 sm:p-6"
          >
            <div
              @click="
                !activeSpaceTargetIds.has(user) &&
                profileSpaceOverlay.open({
                  targetId: user
                })
              "
              class="flex items-center gap-2"
            >
              <UAvatar
                size="xl"
                :src="`${VITE_OSS_BASE_URL}avatar/${user}`"
                :alt="nickname[0]"
              />
              <div class="flex flex-1 items-center justify-between">
                <div>
                  <div class="font-medium">
                    {{ nickname }}
                  </div>
                  <div class="text-muted text-sm">
                    发布于 {{ useFormatTimeAgo(createdAt) }} · {{ college }}
                  </div>
                </div>
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
            <div v-if="content.text" class="break-all whitespace-pre-wrap">
              {{ content.text }}
            </div>
            <!-- 需要开启 crossorigin，否则切换到个人空间时会报跨域错误 -->
            <Carousel
              v-if="content.images.length"
              :set-loading="true"
              :set-crossorigin="true"
              :items="content.images"
              :active-index="0"
            />
            <div class="flex justify-between">
              <UButton
                variant="ghost"
                :color="like ? 'secondary' : 'primary'"
                icon="lucide:heart"
                :label="String(likes || '点赞')"
                @click="
                  useLike(toast, postMap[activeTab].posts[index], _id, 'post')
                "
              />
              <UButton
                variant="ghost"
                icon="lucide:message-circle"
                :label="String(commentCount || '回复')"
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
              <UButton variant="ghost" icon="lucide:share-2" label="分享" />
            </div>
          </div>
          <Separator
            v-if="postMap[activeTab].posts.length === 0"
            :label="'空空如也'"
          />
          <Separator v-else-if="allPostLoaded" label="已经到底了" />
        </div>
      </template>
      <template v-if="activeTab === 'myCollege'">
        <!-- 存在 length 属性，说明已经成功从服务器获取了数据 -->
        <div v-if="postMap[activeTab]?.posts?.length >= 0">
          <div
            v-for="(
              {
                _id,
                user,
                profile: { nickname },
                content,
                createdAt,
                likes,
                like,
                commentCount
              },
              index
            ) in postMap[activeTab].posts"
            :key="_id"
            class="bg-elevated/50 space-y-2 p-4 not-first:mt-2 sm:p-6"
          >
            <div
              @click="
                !activeSpaceTargetIds.has(user) &&
                profileSpaceOverlay.open({
                  targetId: user
                })
              "
              class="flex items-center gap-2"
            >
              <UAvatar
                size="xl"
                :src="`${VITE_OSS_BASE_URL}avatar/${user}`"
                :alt="nickname[0]"
              />
              <div class="flex flex-1 items-center justify-between">
                <div>
                  <div class="font-medium">
                    {{ nickname }}
                  </div>
                  <div class="text-muted text-sm">
                    <!-- 发布于 {{ useFormatTimeAgo(createdAt) }} · 广东 -->
                    发布于 {{ useFormatTimeAgo(createdAt) }}
                  </div>
                </div>
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
            <div v-if="content.text" class="break-all whitespace-pre-wrap">
              {{ content.text }}
            </div>
            <!-- 需要开启 crossorigin，否则切换到个人空间时会报跨域错误 -->
            <Carousel
              v-if="content.images.length"
              :set-loading="true"
              :set-crossorigin="true"
              :items="content.images"
              :active-index="0"
            />
            <div class="flex justify-between">
              <UButton
                variant="ghost"
                :color="like ? 'secondary' : 'primary'"
                icon="lucide:heart"
                :label="String(likes || '点赞')"
                @click="
                  useLike(toast, postMap[activeTab].posts[index], _id, 'post')
                "
              />
              <UButton
                variant="ghost"
                icon="lucide:message-circle"
                :label="String(commentCount || '回复')"
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
              <UButton variant="ghost" icon="lucide:share-2" label="分享" />
            </div>
          </div>
          <Separator
            v-if="postMap[activeTab].posts.length === 0"
            :label="'空空如也'"
          />
          <Separator v-else-if="allPostByCollegeLoaded" label="已经到底了" />
        </div>
      </template>
      <template v-if="activeTab === 'market'">
        <div v-if="postMap[activeTab]?.products?.length >= 0">
          <div
            v-for="{
              _id,
              user,
              profile: { nickname },
              content: { text, images },
              createdAt,
              commentCount,
              price,
              expressDelivery
              // visibility
            } in postMap[activeTab].products"
            :key="_id"
            class="bg-elevated/50 space-y-2 p-4 not-first:mt-2 sm:p-6"
          >
            <div
              @click="
                !activeSpaceTargetIds.has(user) &&
                profileSpaceOverlay.open({
                  targetId: user
                })
              "
              class="flex items-center gap-2"
            >
              <UAvatar
                size="xl"
                :src="`${VITE_OSS_BASE_URL}avatar/${user}`"
                :alt="nickname[0]"
              />
              <div class="flex flex-1 items-center justify-between">
                <div>
                  <div class="font-medium">
                    {{ nickname }}
                  </div>
                  <div class="text-muted text-sm">
                    <!-- 发布于 {{ useFormatTimeAgo(createdAt) }} · 广东 -->
                    发布于 {{ useFormatTimeAgo(createdAt) }}
                  </div>
                </div>
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
            <div class="break-all whitespace-pre-wrap">
              <span class="text-primary mr-2 font-semibold">{{
                expressDelivery
              }}</span>
              <span>{{ text }}</span>
            </div>
            <!-- 需要开启 crossorigin，否则切换到个人空间时会报跨域错误 -->
            <Carousel
              v-if="images.length"
              :set-loading="true"
              :set-crossorigin="true"
              :items="images"
              :active-index="0"
            />
            <div>
              <span class="text-error text-xs font-semibold">￥</span>
              <span class="text-error font-semibold">{{ price }}</span>
              <span v-if="commentCount" class="ml-2 text-xs">
                {{ commentCount }} 人评论
              </span>
            </div>
          </div>
          <Separator
            v-if="postMap[activeTab].products.length === 0"
            :label="'空空如也'"
          />
          <Separator v-else-if="allProductLoaded" label="已经到底了" />
        </div>
      </template>
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
        v-for="{ label, color, onSelect } in dropdownMenuItems[0]"
        :label="label"
        :color="color"
        @click="onSelect"
        class="justify-center"
      />
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import {
  getPlaygroundPostsAPI,
  getPlaygroundProductsAPI
} from '@/apis/playground'
import OverlayPostDetail from '@/components/overlay/OverlayPostDetail.vue'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'
import OverlayPublishContent from '@/components/overlay/OverlayPublishContent.vue'
import {
  useFormatTimeAgo,
  useInitAutoScrollBtn,
  useLike,
  useOpenPostDetailOverlay,
  useRefreshPlayground
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
import PullToRefresh from 'pulltorefreshjs'

let reportedUserId = null
let reportPostId = null
let reportProductId = null
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile, userInfo } = storeToRefs(useUserStore())
const activeTab = ref<'myCollege' | 'latest' | 'friend' | 'market' | 'partner'>(
  'latest'
)
const { postMap } = storeToRefs(usePostStore())
const { activeSpaceTargetIds } = storeToRefs(useRecentContactsStore())
const { footerNavs } = storeToRefs(useFooterStore())
const dropdownMenuItems = [
  [
    {
      label: '举报',
      icon: 'lucide:circle-alert',
      color: 'error' as const,
      onSelect: () => onReport()
    }
  ]
]
const toast = useToast()
const overlay = useOverlay()
const postDetailOverlay = overlay.create(OverlayPostDetail)
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)
const publishContentOverlay = overlay.create(OverlayPublishContent)
const allPostLoaded = ref((postMap.value.latest?.posts?.length || 0) >= 100)
const allProductLoaded = ref(
  (postMap.value.market?.products?.length || 0) >= 100
)
const allPostByCollegeLoaded = ref(
  (postMap.value.myCollege?.posts?.length || 0) >= 100
)
const loading = ref(postMap.value[activeTab.value] === undefined)
const isDrawerOpen = ref(false)
const isAutoScrollBtnShow = ref(false)

const onScrollToTop = () =>
  document
    .querySelector('#dashboard-panel-playground')
    .children[2].scrollTo({ top: 0, behavior: 'smooth' })

const onReport = () => {
  isDrawerOpen.value = false
  const _activeTab = activeTab.value

  if (_activeTab === 'latest' || _activeTab === 'myCollege') {
    publishContentOverlay.open({
      action: 'report',
      reportTarget: 'post',
      reportedUserId,
      reportPostId
    })
  } else if (_activeTab === 'market') {
    publishContentOverlay.open({
      action: 'report',
      reportTarget: 'product',
      reportedUserId,
      reportProductId
    })
  }
}

const onOpenDropdownMenu = (user, postIdOrProductId) => {
  reportedUserId = user
  const _activeTab = activeTab.value

  if (_activeTab === 'latest' || _activeTab === 'myCollege') {
    reportPostId = postIdOrProductId
  } else if (_activeTab === 'market') {
    reportProductId = postIdOrProductId
  }

  if (isMobile.value) {
    isDrawerOpen.value = true
  }
}

const onScroll = useThrottleFn(
  async e => {
    if (loading.value) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = e.target

    useInitAutoScrollBtn(
      scrollTop,
      isMobile.value,
      footerNavs,
      'playground',
      isAutoScrollBtnShow
    )

    const _activeTab = activeTab.value
    const isPost = _activeTab === 'latest'
    const isMarket = _activeTab === 'market'
    const isMyCollege = _activeTab === 'myCollege'

    if (isPost && allPostLoaded.value) {
      return
    }

    if (isMyCollege && allPostByCollegeLoaded.value) {
      return
    }

    if (isMarket && allProductLoaded.value) {
      return
    }

    if (scrollHeight - (scrollTop + clientHeight) < 64) {
      const item = isPost
        ? postMap.value[_activeTab].posts
        : postMap.value[_activeTab].products
      const lastId = item[item.length - 1]._id
      const { data } = await (isPost
        ? getPlaygroundPostsAPI(lastId)
        : isMyCollege
          ? getPlaygroundPostsAPI(lastId, '', userInfo.value.profile.college)
          : getPlaygroundProductsAPI(userInfo.value.profile.college, lastId))
      const { length } = data

      if (length) {
        item.push(...data)
      }

      if (isPost) {
        allPostLoaded.value = length < 10 || item.length > 100
      } else if (isMyCollege) {
        allPostByCollegeLoaded.value = length < 10 || item.length > 100
      } else if (isMarket) {
        allProductLoaded.value = length < 10 || item.length > 100
      }
    }
  },
  200,
  true,
  false
)

const getPlaygroundPosts = async () => {
  const _activeTab = activeTab.value
  loading.value = true
  postMap.value[_activeTab] = {} as any
  const posts = (await getPlaygroundPostsAPI()).data
  postMap.value[_activeTab].posts = posts
  allPostLoaded.value = posts.length < 10
  loading.value = false
}

const getPlaygroundProducts = async () => {
  const _activeTab = activeTab.value
  loading.value = true
  postMap.value[_activeTab] = {} as any
  const products = (
    await getPlaygroundProductsAPI(userInfo.value.profile.college)
  ).data
  postMap.value[_activeTab].products = products
  allProductLoaded.value = products.length < 10
  loading.value = false
}

const getPlaygroundPostsByCollege = async () => {
  const _activeTab = activeTab.value
  loading.value = true
  postMap.value[_activeTab] = {} as any
  const posts = (
    await getPlaygroundPostsAPI('', '', userInfo.value.profile.college)
  ).data
  postMap.value[_activeTab].posts = posts
  allPostByCollegeLoaded.value = posts.length < 10
  loading.value = false
}

watch(activeTab, v => {
  if (v === 'latest') {
    return
  }

  if (!userInfo.value.profile.college) {
    return toast.add({
      title: '请完善个人资料中的大学信息',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }

  if (v === 'market' && !postMap.value[v]) {
    getPlaygroundProducts()
  } else if (v === 'myCollege' && !postMap.value[v]) {
    getPlaygroundPostsByCollege()
  }
})

const initContainer = () => {
  const container = document.querySelector('#dashboard-panel-playground')
    .children[2]

  container.addEventListener('scroll', onScroll)

  if (isMobile.value) {
    PullToRefresh.init({
      mainElement: container,
      triggerElement: container,
      distReload: 80,
      shouldPullToRefresh: () => !container.scrollTop,
      instructionsPullToRefresh: '下拉刷新',
      instructionsReleaseToRefresh: '释放刷新',
      instructionsRefreshing: '刷新中',
      iconRefreshing: '',
      getStyles: () => `
        .__PREFIX__ptr {
          pointer-events: none;
          height: 0;
          transition: height 0.3s, min-height 0.3s;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
        }

        .__PREFIX__box {
          text-align: center;
          padding: 1rem;
          flex: 1;
        }

        .__PREFIX__pull {
          transition: none;
        }

        .__PREFIX__content {
          font-weight: bold;
          color: var(--ui-primary);
        }

        .__PREFIX__text {
          margin-top: 0.25rem;
        }

        .__PREFIX__icon {
          transition: transform .3s;
        }

        /*
          When at the top of the page, disable vertical overscroll so passive touch
          listeners can take over.
        */
        .__PREFIX__top {
          touch-action: pan-x pan-down pinch-zoom;
        }

        .__PREFIX__release .__PREFIX__icon {
          transform: rotate(180deg);
        }
      `,
      onRefresh: () => useRefreshPlayground(activeTab, postMap, userInfo, toast)
    })
  }
}

onMounted(async () => {
  await getPlaygroundPosts()
  initContainer()
})
</script>
