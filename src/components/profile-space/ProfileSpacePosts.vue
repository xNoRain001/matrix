<template>
  <div v-if="loading" class="space-y-4 p-4 sm:p-6">
    <div v-for="i in 5" :key="i" class="flex items-center gap-4">
      <USkeleton class="h-12 w-12 rounded-full" />

      <div class="grid flex-1 gap-2">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-4/5" />
      </div>
    </div>
  </div>
  <div v-if="postMap[targetId]?.posts?.length">
    <div
      v-for="(
        {
          _id,
          content: { text, images },
          createdAt,
          likes,
          commentCount,
          liked
          // visibility
        },
        index
      ) in postMap[targetId].posts"
      :key="_id"
      class="hover:bg-accented/50 border-b-accented/50 cursor-pointer space-y-2 rounded-none border-b p-4 sm:p-6"
    >
      <p class="text-highlighted break-all whitespace-pre-wrap">
        {{ text }}
      </p>
      <Carousel
        v-if="images.length"
        @click.stop="useNoop"
        :items="images"
        :active-index="0"
      />
      <div class="flex items-center justify-between">
        <p class="text-toned text-sm">
          {{ useFormatTimeAgo(createdAt) }}
        </p>
        <div>
          <UButton
            variant="ghost"
            icon="lucide:message-circle"
            :label="String(commentCount || '')"
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
          <UButton
            variant="ghost"
            :color="liked ? 'secondary' : 'primary'"
            icon="lucide:heart"
            :label="String(likes || '')"
            @click.stop="
              useLike(toast, postMap[targetId].posts[index], _id, 'post')
            "
          />
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
      </div>
      <!-- <UBadge
       v-if="visibility === 'hidden'"
        class=" w-fit"
        label="违规内容，去申诉"
        trailing-icon="lucide:navigation"
        @click="onAppeal"
      ></UBadge> -->
    </div>
    <USeparator v-if="allPostLoaded" class="p-4 sm:p-6" label="已经到底了" />
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
  <USeparator
    v-if="postMap[targetId]?.posts?.length === 0"
    class="p-4 sm:p-6"
    label="空空如也"
  />
</template>

<script lang="ts" setup>
import {
  useFormatTimeAgo,
  useGetDB,
  useInitAutoScrollBtn,
  useLike,
  useNoop,
  useOpenPostDetailOverlay,
  useURLToBlob
} from '@/hooks'
import OverlayPostDetail from '@/components/overlay/OverlayPostDetail.vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { deletePostAPI, getPostsAPI, getSelfPostsAPI } from '@/apis/post'
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

const props = defineProps<{
  isMatch?: boolean
  targetId: string
  container?: HTMLElement
}>()
const overlay = useOverlay()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const postDetailOverlay = overlay.create(OverlayPostDetail)
const publisherOverlay = overlay.create(OverlayPublisher)
const { postMap, lastFetchedPostId } = storeToRefs(usePostStore())
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
const { VITE_OSS_BASE_URL } = import.meta.env
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
      if (isSelf) {
        // 如果是 API 获取的 post，会返回全部，不会进入到这里，因此一定是从本地数据库
        // 中加载的 post
        const posts = await getPostsFromIndexedDB()
        const { length } = posts

        if (length) {
          postMap.value[props.targetId].posts.push(...posts)
        }

        lastFetchedPostId.value = posts[posts.length - 1]?.id || 0
        allPostLoaded.value = length < 10
      } else {
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
    const db = await useGetDB(userInfo.value.id)
    const tx = db.transaction('posts', 'readwrite')
    const store = tx.objectStore('posts')
    const index = store.index('_id')
    const cursor = await index.openCursor(
      postMap.value[props.targetId].activePostId
    )
    if (cursor) {
      await store.delete(cursor.primaryKey)
    }
    await tx.done
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

const getPostsFromIndexedDB = async () => {
  const posts = []
  const db = await useGetDB(userInfo.value.id)
  const transaction = db.transaction('posts', 'readonly')
  const store = transaction.objectStore('posts')
  let cursor = await store.openCursor(
    IDBKeyRange.bound(0, lastFetchedPostId.value, false, true),
    'prev'
  )

  // 已经获取了所有
  if (!cursor) {
    return posts
  }

  let counter = 0
  while (cursor && counter < 10) {
    const { images } = cursor.value.content

    for (let i = 0, l = images.length; i < l; i++) {
      const image = images[i]

      if (image.blob) {
        image.url = URL.createObjectURL(image.blob)
      }
    }

    posts.push(cursor.value)
    counter++
    cursor = await cursor.continue()
  }

  return posts
}

const getPostsFromAPI = async () => {
  try {
    const { data } = await getSelfPostsAPI()
    const _data = JSON.parse(JSON.stringify(data))

    for (let i = 0, l = data.length; i < l; i++) {
      const { images } = data[i].content
      const { images: _images } = _data[i].content

      for (let i = 0, l = images.length; i < l; i++) {
        const image = images[i]
        const _image = _images[i]
        const blob = await useURLToBlob(VITE_OSS_BASE_URL + image.url)
        _image.ossURL = image.url
        image.url = URL.createObjectURL(blob)
        image.blob = blob
        delete _image.url
        _image.blob = blob
      }
    }

    const db = await useGetDB(userInfo.value.id)
    const tx = db.transaction('posts', 'readwrite')
    const store = tx.objectStore('posts')

    for (let i = _data.length - 1; i >= 0; i--) {
      await store.add(_data[i])
    }

    await tx.done

    localStorage.setItem(`persistentPosts-${userInfo.value.id}`, 'true')
    allPostLoaded.value = true

    return data
  } catch (error) {
    toast.add({ title: error.message, color: 'error', icon: 'lucide:annoyed' })
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
  if (isSelf) {
    if (!postMap.value[props.targetId]) {
      postMap.value[props.targetId] = {} as any
      const persistentPosts = Boolean(
        localStorage.getItem(`persistentPosts-${userInfo.value.id}`)
      )
      postMap.value[props.targetId].posts = persistentPosts
        ? await getPostsFromIndexedDB()
        : await getPostsFromAPI()

      if (persistentPosts) {
        const { length } = postMap.value[props.targetId].posts
        lastFetchedPostId.value =
          postMap.value[props.targetId].posts[length - 1]?.id || 0
        allPostLoaded.value = length < 10
      } else {
        // 从 API 获取，会一次性返回所有 post
        allPostLoaded.value = true
      }

      loading.value = false
    } else {
      // 存在缓存，判断是不是获取了全部
      const db = await useGetDB(userInfo.value.id)
      const transaction = db.transaction('posts', 'readonly')
      const store = transaction.objectStore('posts')
      const count = await store.count()

      if (postMap.value[props.targetId].posts.length === count) {
        allPostLoaded.value = true
      }
    }
  } else {
    await getPosts()
    loading.value = false
  }

  setTimeout(() => {
    props.container.addEventListener('scroll', onScroll)
  })
})

onBeforeUnmount(() => {
  props.container.removeEventListener('scroll', onScroll)
})
</script>
