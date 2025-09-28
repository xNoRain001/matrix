<template>
  <UPageList v-if="posts.length" divide>
    <UPageCard
      v-for="(
        {
          _id,
          content: { text, media },
          createdAt,
          likes,
          commentCount,
          liked
        },
        index
      ) in posts"
      :key="_id"
      variant="soft"
      class="cursor-pointer"
      @click="
        postDetailOverlay.open({
          isMatch,
          postId: _id,
          postIndex: index
        })
      "
    >
      <p class="text-highlighted">
        {{ text }}
      </p>
      <Carousel
        v-if="media.length"
        @click.stop="useNoop"
        :items="items"
        :active-index="0"
      ></Carousel>
      <div class="flex items-center justify-between">
        <p class="text-toned text-sm">
          {{ useFormatTimeAgo(createdAt) }}
        </p>
        <div>
          <UButton
            variant="ghost"
            icon="lucide:message-circle-more"
            :label="String(commentCount || '')"
            @click.stop="onComment(_id, index)"
          ></UButton>
          <UButton
            variant="ghost"
            :color="liked ? 'secondary' : 'primary'"
            icon="lucide:heart"
            :label="String(likes || '')"
            @click.stop="onLike(_id, index)"
          ></UButton>
          <template v-if="isSelf">
            <UButton
              v-if="isMobile"
              variant="ghost"
              icon="lucide:ellipsis"
              @click.stop="onOpenEdieMenu(_id, index)"
            ></UButton>
            <UDropdownMenu v-else :items="dropdownMenuitems">
              <UButton
                variant="ghost"
                icon="lucide:ellipsis"
                @click.stop="onOpenEdieMenu(_id, index)"
              ></UButton>
            </UDropdownMenu>
          </template>
        </div>
      </div>
    </UPageCard>
  </UPageList>
  <!-- TODO: 空内容 -->
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
</template>

<script lang="ts" setup>
import { useFormatTimeAgo, useNoop } from '@/hooks'
import OverlayPostDetail from '../overlay/OverlayPostDetail.vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { deletePostAPI, getPostsAPI } from '@/apis/post'
import { storeToRefs } from 'pinia'
import { useRecentContactsStore, useUserStore } from '@/store'
import OverlayPulishPost from '../overlay/OverlayPulishPost.vue'
import { likeAPI } from '@/apis/like'

const props = defineProps<{ isMatch?: boolean }>()
const overlay = useOverlay()
const { isMobile } = storeToRefs(useUserStore())
const postDetailOverlay = overlay.create(OverlayPostDetail)
const publishPostOverlay = overlay.create(OverlayPulishPost)
const { userInfo, posts } = storeToRefs(useUserStore())
const { targetId } = storeToRefs(useRecentContactsStore())
const items = [
  'https://picsum.photos/640/640?random=1',
  'https://picsum.photos/640/320?random=2',
  'https://picsum.photos/640/640?random=3',
  'https://picsum.photos/640/320?random=4',
  'https://picsum.photos/640/640?random=5',
  'https://picsum.photos/320/640?random=6'
]
const isEditMenuDrawerOpen = ref(false)
const isSelf = !targetId.value
const dropdownMenuitems = [
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
const activePostId = ref('')
const activePostIndex = ref(0)
const toast = useToast()

const onDeletePost = async () => {
  try {
    await deletePostAPI(activePostId.value)
    posts.value.splice(activePostIndex.value, 1)

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

const onEditPost = async () => {
  const _activePostIndex = activePostIndex.value
  publishPostOverlay.open({
    post: posts.value[_activePostIndex],
    index: _activePostIndex
  })

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = false
  }
}

const onOpenEdieMenu = (postId, index) => {
  activePostId.value = postId
  activePostIndex.value = index

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = true
  }
}

const onComment = (postId, postIndex) => {
  activePostId.value = postId
  activePostIndex.value = postIndex
  postDetailOverlay.open({
    isMatch: props.isMatch,
    postId,
    postIndex
  })
}

const onLike = async (postId, index) => {
  try {
    const { data: isLike } = await likeAPI(postId, 'post')

    if (isLike) {
      posts.value[index].liked = true
      posts.value[index].likes++
    } else {
      posts.value[index].liked = false
      posts.value[index].likes--
    }
  } catch (error) {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

watch(targetId, async v => {
  if (!isMobile.value) {
    return
  }

  if (v) {
    posts.value = (await getPostsAPI(targetId.value)).data
  }
})

onMounted(async () => {
  posts.value = (
    await getPostsAPI(isSelf ? userInfo.value.id : targetId.value)
  ).data
})

onBeforeUnmount(() => (posts.value = []))
</script>
