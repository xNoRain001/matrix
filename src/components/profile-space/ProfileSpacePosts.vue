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
      :ui="{ container: 'gap-y-2' }"
      @click="onComment(_id, index)"
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
            @click.stop="useLike(toast, posts[index], _id, 'post')"
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
import { useFormatTimeAgo, useLike, useNoop } from '@/hooks'
import OverlayPostDetail from '../overlay/OverlayPostDetail.vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { deletePostAPI, getPostsAPI } from '@/apis/post'
import { storeToRefs } from 'pinia'
import { usePostStore, useRecentContactsStore, useUserStore } from '@/store'
import OverlayPublisher from '../overlay/OverlayPublisher.vue'

const props = defineProps<{ isMatch?: boolean }>()
const overlay = useOverlay()
const { isMobile } = storeToRefs(useUserStore())
const postDetailOverlay = overlay.create(OverlayPostDetail)
const publisherOverlay = overlay.create(OverlayPublisher)
const { userInfo } = storeToRefs(useUserStore())
const { targetId } = storeToRefs(useRecentContactsStore())
const { posts, activePost, activePostId, activePostIndex } =
  storeToRefs(usePostStore())
const items = [
  'https://picsum.photos/640/640?random=1',
  'https://picsum.photos/640/640?random=1',
  'https://picsum.photos/640/640?random=1',
  'https://picsum.photos/640/640?random=1',
  'https://picsum.photos/640/320?random=2',
  'https://picsum.photos/640/640?random=3',
  'https://picsum.photos/640/320?random=4',
  'https://picsum.photos/640/640?random=5',
  'https://picsum.photos/320/640?random=6'
]
const isSelf = !targetId.value
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

const onEditPost = () => {
  activePost.value = posts.value[activePostIndex.value]
  publisherOverlay.open({ action: 'updatePost' })

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = false
  }
}

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

const onOpenDropdownMenu = (postId, postIndex) => {
  activePostId.value = postId
  activePostIndex.value = postIndex

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = true
  }
}

const onComment = (postId, postIndex) => {
  activePostId.value = postId
  activePostIndex.value = postIndex
  activePost.value = posts.value[postIndex]
  postDetailOverlay.open({
    isMatch: props.isMatch
  })
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
