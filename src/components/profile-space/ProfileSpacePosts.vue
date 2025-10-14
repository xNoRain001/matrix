<template>
  <UPageList v-if="postMap[targetId]?.posts?.length" divide>
    <UPageCard
      v-for="(
        {
          _id,
          content: { text, images },
          createdAt,
          likes,
          commentCount,
          liked
        },
        index
      ) in postMap[targetId].posts"
      :key="_id"
      variant="soft"
      class="cursor-pointer rounded-none"
      :ui="{ container: 'gap-y-2' }"
      @click="
        useOpenPostDetailOverlay(
          postMap,
          targetId,
          _id,
          index,
          postDetailOverlay
        )
      "
    >
      <p class="text-highlighted">
        {{ text }}
      </p>
      <Carousel
        v-if="images.length"
        @click.stop="useNoop"
        :items="images"
        :active-index="0"
      ></Carousel>
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
          ></UButton>
          <UButton
            variant="ghost"
            :color="liked ? 'secondary' : 'primary'"
            icon="lucide:heart"
            :label="String(likes || '')"
            @click.stop="
              useLike(toast, postMap[targetId].posts[index], _id, 'post')
            "
          ></UButton>
          <template v-if="isSelf">
            <UButton
              v-if="isMobile"
              variant="ghost"
              icon="lucide:ellipsis"
              @click.stop="onOpenDropdownMenu(_id, index)"
            ></UButton>
            <UDropdownMenu v-else :items="dropdownMenuItems">
              <UButton
                variant="ghost"
                icon="lucide:ellipsis"
                @click.stop="onOpenDropdownMenu(_id, index)"
              ></UButton>
            </UDropdownMenu>
          </template>
        </div>
      </div>
    </UPageCard>
    <USeparator v-if="allPostLoaded" class="p-4 sm:p-6" label="已经到底了" />
    <UDrawer
      v-model:open="isEditMenuDrawerOpen"
      :handle="false"
      title="操作"
      description=" "
    >
      <template #footer>
        <UButton
          label="编辑"
          @click="onEditPost"
          class="justify-center"
        ></UButton>
        <UButton
          label="删除"
          @click="onDeletePost"
          class="justify-center"
          color="error"
        ></UButton>
      </template>
    </UDrawer>
  </UPageList>
  <USeparator v-else class="p-4 sm:p-6" label="空空如也" />
  <!-- 滚动到顶部浮动按钮 -->
  <UButton
    v-if="!isMobile && isFloatingBtnShow"
    @click="onScrollToTop"
    class="fixed right-4 bottom-20 sm:right-6 sm:bottom-22"
    icon="lucide:rocket"
    size="xl"
  />
</template>

<script lang="ts" setup>
import {
  useFormatTimeAgo,
  useGetDB,
  useLike,
  useNoop,
  useOpenPostDetailOverlay,
  useURLToBlob
} from '@/hooks'
import OverlayPostDetail from '../overlay/OverlayPostDetail.vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { deletePostAPI, getPostsAPI, getSelfPostsAPI } from '@/apis/post'
import { storeToRefs } from 'pinia'
import { usePostStore, useUserStore } from '@/store'
import OverlayPublisher from '../overlay/OverlayPublisher.vue'
import { useThrottleFn } from '@vueuse/core'

const props = defineProps<{
  isMatch?: boolean
  targetId: string
  container?: HTMLElement
}>()
const overlay = useOverlay()
const { isMobile } = storeToRefs(useUserStore())
const postDetailOverlay = overlay.create(OverlayPostDetail)
const publisherOverlay = overlay.create(OverlayPublisher)
const { userInfo } = storeToRefs(useUserStore())
const { postMap, lastFetchedPostId } = storeToRefs(usePostStore())
const isSelf = props.targetId === userInfo.value.id
const allPostLoaded = ref(false)
const toast = useToast()
const isEditMenuDrawerOpen = ref(false)
const dropdownMenuItems = [
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
const { VITE_OSS_BASE_URL } = import.meta.env
const isFloatingBtnShow = ref(false)

const onScrollToTop = () => {
  props.container.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
  isFloatingBtnShow.value = false
}

const onScroll = useThrottleFn(
  async () => {
    const { scrollTop, scrollHeight, clientHeight } = props.container

    if (!isMobile.value) {
      isFloatingBtnShow.value = scrollTop > 400
    }

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

        if (length < 10) {
          allPostLoaded.value = true
        }
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
        if (data.length < 10) {
          allPostLoaded.value = true
        }
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

watch(
  () => props.targetId,
  async v => {
    if (!isMobile.value) {
      return
    }

    if (v) {
      postMap.value[props.targetId].posts = (await getPostsAPI(v)).data
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

        if (length < 10) {
          allPostLoaded.value = true
        }
      } else {
        // 从 API 获取，会一次性返回所有 post
        allPostLoaded.value = true
      }
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
    postMap.value[props.targetId] = {} as any
    const { data: posts } = await getPostsAPI(props.targetId)
    postMap.value[props.targetId].posts = posts

    if (posts.length < 10) {
      allPostLoaded.value = true
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
