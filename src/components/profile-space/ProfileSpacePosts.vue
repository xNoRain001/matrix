<template>
  <UPageList v-if="postMap[targetId]?.posts?.length">
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
      class="cursor-pointer"
      :ui="{ container: 'gap-y-2' }"
      @click="onComment(_id, index)"
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
            @click.stop="onComment(_id, index)"
          ></UButton>
          <UButton
            variant="ghost"
            :color="liked ? 'secondary' : 'primary'"
            icon="lucide:heart"
            :label="String(likes || '')"
            @click.stop="useLike(toast, postMap[targetId][index], _id, 'post')"
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
  <div v-else class="mt-4 flex justify-center sm:mt-6">
    <UButton
      variant="ghost"
      class="flex flex-col"
      icon="lucide:coffee"
      label="空空如也..."
    ></UButton>
  </div>
</template>

<script lang="ts" setup>
import {
  useFormatTimeAgo,
  useGetDB,
  useLike,
  useNoop,
  useURLToBlob
} from '@/hooks'
import OverlayPostDetail from '../overlay/OverlayPostDetail.vue'
import { onMounted, ref, watch } from 'vue'
import { deletePostAPI, getPostsAPI } from '@/apis/post'
import { storeToRefs } from 'pinia'
import { usePostStore, useUserStore } from '@/store'
import OverlayPublisher from '../overlay/OverlayPublisher.vue'

const props = defineProps<{ isMatch?: boolean; targetId: string }>()
const overlay = useOverlay()
const { isMobile } = storeToRefs(useUserStore())
const postDetailOverlay = overlay.create(OverlayPostDetail)
const publisherOverlay = overlay.create(OverlayPublisher)
const { userInfo } = storeToRefs(useUserStore())
const { postMap } = storeToRefs(usePostStore())
const isSelf = props.targetId === userInfo.value.id
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
    // TODO: 更新数据库

    if (isMobile.value) {
      isEditMenuDrawerOpen.value = false
    }
  } catch (error) {
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

const onComment = (postId, postIndex) => {
  postMap.value[props.targetId].activePostId = postId
  postMap.value[props.targetId].activePostIndex = postIndex
  postMap.value[props.targetId].activePost =
    postMap.value[props.targetId].posts[postIndex]
  postDetailOverlay.open({
    targetId: props.targetId
  })
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

const getLocalPosts = async () => {
  const posts = []
  const db = await useGetDB(userInfo.value.id)
  const transaction = db.transaction('posts', 'readonly')
  const store = transaction.objectStore('posts')
  let cursor = await store.openCursor(
    IDBKeyRange.bound(0, Number.MAX_SAFE_INTEGER, false, true)
    // 'prev'
  )

  // 已经获取了所有
  if (!cursor) {
    return posts
  }

  let counter = 0
  while (cursor && counter < 20) {
    const { images } = cursor.value.content

    for (let i = 0, l = images.length; i < l; i++) {
      const image = images[i]
      image.url = URL.createObjectURL(image.blob)
    }

    posts.push(cursor.value)
    counter++
    cursor = await cursor.continue()
  }

  return posts
}

const initPosts = async () => {
  const { data } = await getPostsAPI(userInfo.value.id)
  const _data = JSON.parse(JSON.stringify(data))

  for (let i = 0, l = data.length; i < l; i++) {
    const { images } = data[i].content
    const { images: _images } = _data[i].content

    for (let i = 0, l = images.length; i < l; i++) {
      const image = images[i]
      const _image = _images[i]
      const blob = await useURLToBlob(VITE_OSS_BASE_URL + image.url)
      image.url = URL.createObjectURL(blob)
      image.blob = blob
      delete _image.url
      _image.blob = blob
    }

    delete _data[i].commentCount
    delete _data[i].likes
  }

  const db = await useGetDB(userInfo.value.id)
  const tx = db.transaction('posts', 'readwrite')
  const store = tx.objectStore('posts')

  for (let i = 0, l = _data.length; i < l; i++) {
    await store.add(_data[i])
  }

  await tx.done

  return data
}

onMounted(async () => {
  postMap.value[props.targetId] = {} as any
  postMap.value[props.targetId].posts =
    postMap.value[props.targetId]?.posts || []

  if (isSelf) {
    const localPosts = await getLocalPosts()

    if (localPosts.length) {
      postMap.value[props.targetId].posts = localPosts
    } else {
      postMap.value[props.targetId].posts = await initPosts()
    }
  } else {
    postMap.value[props.targetId].posts = (
      await getPostsAPI(props.targetId)
    ).data
  }
})
</script>
