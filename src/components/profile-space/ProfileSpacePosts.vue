<template>
  <Skeleton v-if="loading" :count="5" />
  <div v-if="postMap[targetId]?.posts?.length" class="divide-default divide-y">
    <div
      v-for="(
        {
          _id,
          content: { text, images },
          createdAt,
          likes,
          commentCount,
          like
          // visibility
        },
        index
      ) in postMap[targetId].posts"
      :key="_id"
      class="space-y-2 p-4 sm:p-6"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-toned truncate text-sm">
          {{ useFormatTimeAgo(createdAt) }}
        </span>
        <UButton
          v-if="isMobile"
          variant="ghost"
          icon="lucide:ellipsis"
          @click.stop="onOpenDropdownMenu(_id, index)"
        />
        <UDropdownMenu v-else :items="dropdownMenuItems">
          <UButton
            variant="ghost"
            icon="lucide:ellipsis"
            @click.stop="onOpenDropdownMenu(_id, index)"
          />
        </UDropdownMenu>
      </div>
      <p class="text-highlighted break-all whitespace-pre-wrap">
        {{ text }}
      </p>
      <Carousel
        v-if="images.length"
        @click.stop="useNoop"
        :set-loading="true"
        :set-crossorigin="true"
        :items="images"
        :active-index="0"
      />
      <div class="flex justify-around">
        <UButton
          variant="ghost"
          :color="like ? 'secondary' : 'primary'"
          icon="lucide:heart"
          :label="String(likes || '点赞')"
          @click.stop="
            useLike(toast, postMap[targetId].posts[index], _id, 'post')
          "
        />
        <UButton
          variant="ghost"
          icon="lucide:message-circle"
          :label="String(commentCount || '评论')"
          @click.stop="
            useOpenPostDetailOverlay(
              postMap,
              targetId,
              _id,
              index,
              postDetailOverlay
            )
          "
        />
        <UButton variant="ghost" icon="lucide:share-2" label="分享" />
      </div>
      <!-- <UBadge
       v-if="visibility === 'hidden'"
        class=" w-fit"
        label="违规内容，去申诉"
        trailing-icon="lucide:navigation"
        @click="onAppeal"
      ></UBadge> -->
    </div>
    <UDrawer
      v-model:open="isEditMenuDrawerOpen"
      :handle="false"
      title="操作"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #footer>
        <UButton label="编辑" @click="onEditPost" class="justify-center" />
        <UButton
          label="删除"
          @click="onDeletePost"
          class="justify-center"
          color="error"
        />
      </template>
    </UDrawer>
    <!-- 滚动到顶部浮动按钮 -->
    <Transition
      enter-active-class="animate-[fade-in_200ms_ease-out]"
      leave-active-class="animate-[fade-out_200ms_ease-in]"
    >
      <div
        v-if="!isFooterNavsUpdateByScroll && isAutoScrollBtnShow"
        class="fixed top-5/6 right-0 left-0"
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
  <div
    v-if="postMap[targetId]?.posts?.length === 0"
    class="flex h-96 flex-col items-center justify-center gap-4 p-4 sm:gap-6 sm:p-6"
  >
    <svg
      class="size-16"
      style="filter: drop-shadow(rgba(0, 122, 204, 0.3) 0px 8px 24px)"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512"
    >
      <path
        fill="var(--ui-primary)"
        d="M320 192l17.1 0c22.1 38.3 63.5 64 110.9 64c11 0 21.8-1.4 32-4l0 4 0 32 0 192c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-140.8L280 448l56 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-144 0c-53 0-96-43-96-96l0-223.5c0-16.1-12-29.8-28-31.8l-7.9-1c-17.5-2.2-30-18.2-27.8-35.7s18.2-30 35.7-27.8l7.9 1c48 6 84.1 46.8 84.1 95.3l0 85.3c34.4-51.7 93.2-85.8 160-85.8zm160 26.5s0 0 0 0c-10 3.5-20.8 5.5-32 5.5c-28.4 0-54-12.4-71.6-32c0 0 0 0 0 0c-3.7-4.1-7-8.5-9.9-13.2C357.3 164 352 146.6 352 128c0 0 0 0 0 0l0-96 0-20 0-1.3C352 4.8 356.7 .1 362.6 0l.2 0c3.3 0 6.4 1.6 8.4 4.2c0 0 0 0 0 .1L384 21.3l27.2 36.3L416 64l64 0 4.8-6.4L512 21.3 524.8 4.3c0 0 0 0 0-.1c2-2.6 5.1-4.2 8.4-4.2l.2 0C539.3 .1 544 4.8 544 10.7l0 1.3 0 20 0 96c0 17.3-4.6 33.6-12.6 47.6c-11.3 19.8-29.6 35.2-51.4 42.9zM432 128a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zm48 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32z"
      />
    </svg>
    <USeparator
      :ui="{ border: 'border-accented', label: 'text-xs text-muted' }"
      class="w-48"
      label="还没有发布过情绪切片"
    />
  </div>
  <div
    v-if="allPostLoaded"
    class="flex h-48 flex-col items-center justify-center p-4 sm:p-6"
  >
    <div class="text-muted">
      {{ new Date(targetProfile.createdAt).getFullYear() }}
    </div>
    <div class="text-muted text-xl">
      {{
        new Intl.DateTimeFormat('zh-CN', { month: 'long' }).format(
          new Date(targetProfile.createdAt)
        )
      }}
    </div>
    <USeparator
      :ui="{ border: 'border-accented', label: 'text-xs text-muted' }"
      class="mt-4 w-20 sm:mt-6"
      label="加入"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  useFormatTimeAgo,
  useInitAutoScrollBtn,
  useLike,
  useNoop,
  useOpenPostDetailOverlay
} from '@/hooks'
import OverlayPostDetail from '@/components/overlay/OverlayPostDetail.vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { deletePostAPI, getPostsAPI } from '@/apis/post'
import { storeToRefs } from 'pinia'
import {
  useFooterStore,
  usePostStore,
  useRecentContactsStore,
  useUserStore
} from '@/store'
import OverlayPublisher from '@/components/overlay/OverlayPublisher.vue'
import { useThrottleFn } from '@vueuse/core'
import { useRoute } from 'vue-router'
import type { userInfo } from '@/types'

const props = defineProps<{
  isMatch?: boolean
  targetId: string
  targetProfile: userInfo['profile']
  container?: HTMLElement
}>()
const overlay = useOverlay()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const postDetailOverlay = overlay.create(OverlayPostDetail)
const publisherOverlay = overlay.create(OverlayPublisher)
const { postMap } = storeToRefs(usePostStore())
const { footerNavs } = storeToRefs(useFooterStore())
const { activeSpaceTargetIds } = storeToRefs(useRecentContactsStore())
const route = useRoute()
const isFooterNavsUpdateByScroll =
  route.path === '/profile' && activeSpaceTargetIds.value.size === 1
const isSelf = props.targetId === userInfo.value.id
const allPostLoaded = ref(false)
const toast = useToast()
const isEditMenuDrawerOpen = ref(false)
const dropdownMenuItems = isSelf
  ? [
      [
        {
          label: '编辑',
          icon: 'lucide:pen',
          onSelect: () => onEditPost()
        },
        {
          label: '删除',
          icon: 'lucide:trash',
          color: 'error',
          onSelect: () => onDeletePost()
        }
      ]
    ]
  : [
      [
        {
          label: '举报',
          icon: 'lucide:info',
          color: 'error',
          onSelect: () => onReport()
        }
      ]
    ]
const loading = ref(!postMap.value[props.targetId])
const isAutoScrollBtnShow = ref(false)

// @ts-ignore
const onAppeal = () => {
  publisherOverlay.open({
    action: 'appeal',
    appealTarget: 'post',
    appealPostId: postMap.value[props.targetId].activePostId
  })
}

const onReport = () => {
  publisherOverlay.open({
    action: 'report',
    reportTarget: 'post',
    reportedUserId: props.targetId,
    reportPostId: postMap.value[props.targetId].activePostId
  })
}

const onScrollToTop = () => {
  props.container.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const onScroll = useThrottleFn(
  async () => {
    const { scrollTop, scrollHeight, clientHeight } = props.container

    useInitAutoScrollBtn(
      scrollTop,
      isFooterNavsUpdateByScroll,
      footerNavs,
      'profile',
      isAutoScrollBtnShow
    )

    if (allPostLoaded.value) {
      return
    }

    if (scrollHeight - (scrollTop + clientHeight) < 64) {
      const lastId =
        postMap.value[props.targetId].posts[
          postMap.value[props.targetId].posts.length - 1
        ]._id
      const { data } = await getPostsAPI(props.targetId, lastId)
      const { length } = data

      if (length) {
        postMap.value[props.targetId].posts.push(...data)
      }

      // 等于 10 时会多发送一次请求，不做处理
      allPostLoaded.value = data.length < 10
    }
  },
  200,
  true,
  false
)

const onEditPost = () => {
  postMap.value[props.targetId].activePost =
    postMap.value[props.targetId].posts[
      postMap.value[props.targetId].activePostIndex
    ]
  publisherOverlay.open({ action: 'updatePost', targetId: props.targetId })

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = false
  }
}

const onDeletePost = async () => {
  try {
    await deletePostAPI(postMap.value[props.targetId].activePostId)
    postMap.value[props.targetId].posts.splice(
      postMap.value[props.targetId].activePostIndex,
      1
    )

    if (isMobile.value) {
      isEditMenuDrawerOpen.value = false
    }

    toast.add({ title: '删除成功', icon: 'lucide:smile' })
  } catch {
    toast.add({ title: '删除失败', color: 'error', icon: 'lucide:annoyed' })

    if (isMobile.value) {
      isEditMenuDrawerOpen.value = false
    }
  }
}

const onOpenDropdownMenu = (postId, postIndex) => {
  postMap.value[props.targetId].activePostId = postId
  postMap.value[props.targetId].activePostIndex = postIndex

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = true
  }
}

const getPosts = async () => {
  postMap.value[props.targetId] = {} as any
  const { data: posts } = await getPostsAPI(props.targetId)
  postMap.value[props.targetId].posts = posts
  allPostLoaded.value = posts.length < 10
}

watch(
  () => props.targetId,
  async v => {
    if (isMobile.value) {
      return
    }

    // 处理 PC 端无缝切换好友空间
    if (v) {
      loading.value = true
      await getPosts()
      loading.value = false
    }
  }
)

onMounted(async () => {
  // 缓存自己发布的帖子
  if (!(isSelf && postMap.value[props.targetId])) {
    try {
      await getPosts()
      loading.value = false
    } catch (error) {
      toast.add({
        title: error.message,
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }
  }

  setTimeout(() => {
    props.container.addEventListener('scroll', onScroll)
  })
})

onBeforeUnmount(() => {
  props.container.removeEventListener('scroll', onScroll)
})
</script>
