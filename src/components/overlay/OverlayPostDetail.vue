<template>
  <USlideover
    :dismissible="!isMobile && isMatch ? false : true"
    :overlay="!isMobile && isMatch ? false : true"
    :side="!isMobile && isMatch ? 'left' : 'right'"
    :class="!isMobile && isMatch ? 'max-w-2/5' : ''"
    title="详情"
    description=" "
    :ui="{ body: 'gap-4 md:gap-6 flex flex-col' }"
  >
    <template #body>
      <UPageCard
        variant="soft"
        class="cursor-pointer"
        :ui="{ container: 'gap-y-2' }"
      >
        <p class="text-highlighted">
          {{ activePost.content.text }}
        </p>
        <Carousel
          v-if="activePost.content.images.length"
          :items="activePost.content.images"
          :active-index="0"
        ></Carousel>
        <div class="flex items-center justify-between">
          <p class="text-toned text-sm">
            {{ useFormatTimeAgo(activePost.createdAt) }}
          </p>
          <div>
            <UButton
              variant="ghost"
              icon="lucide:message-circle-more"
              :label="String(activePost.commentCount || '')"
            ></UButton>
            <UButton
              variant="ghost"
              :color="activePost.liked ? 'secondary' : 'primary'"
              icon="lucide:heart"
              :label="String(activePost.likes || '')"
              @click="useLike(toast, activePost, activePostId, 'post')"
            ></UButton>
          </div>
        </div>
      </UPageCard>
      <div
        v-if="activePost.user === userInfo.id"
        class="flex items-center justify-between"
      >
        <UTabs
          v-model="activeTab"
          variant="link"
          :content="false"
          :items="tabItems"
        />
        <UTabs
          v-if="activeTab === 'comment'"
          v-model="activeRightTab"
          size="xs"
          :content="false"
          :items="items"
        />
      </div>
      <div v-else class="flex items-center justify-between">
        <div class="text-highlighted font-semibold">评论</div>
        <UTabs
          size="xs"
          v-model="activeRightTab"
          :content="false"
          :items="items"
        />
      </div>
      <div v-if="activeTab === 'comment'">
        <UPageCard
          v-if="comments.length"
          v-for="(
            {
              _id,
              user: owner,
              profile,
              content,
              createdAt,
              likes,
              replyCount,
              liked,
              replyComments,
              visibleReplyCount
            },
            index
          ) in comments"
          :key="_id"
          variant="soft"
          class="not-last:mb-2"
          :ui="{ body: 'w-full' }"
        >
          <template #body>
            <UUser
              :avatar="{ alt: profile.nickname[0] }"
              size="xl"
              :ui="{
                root: 'items-start',
                wrapper: 'flex-1',
                name: 'gap-2 flex text-sm text-toned items-center',
                description: 'text-highlighted flex flex-col justify-between'
              }"
            >
              <template #name>
                <span>{{ profile.nickname }}</span>
                <UBadge v-if="activePost.user === owner" label="作者"></UBadge>
              </template>
              <template #description>
                <div class="text-base">{{ content.text }}</div>
                <div
                  v-if="content.images.length"
                  @click="viewerOverlay.open({ urls: content.images })"
                >
                  <img
                    class="size-11"
                    v-for="image in content.images"
                    :src="VITE_OSS_BASE_URL + image.url"
                  />
                </div>
                <div class="flex items-center justify-between">
                  <p class="text-toned items-center">
                    <span>{{ useFormatTimeAgo(createdAt) }} · 广东</span>
                    <span class="ml-2" @click="onReply(owner, _id, index)"
                      >回复</span
                    >
                  </p>
                  <div>
                    <UButton
                      variant="ghost"
                      :color="liked ? 'secondary' : 'primary'"
                      icon="lucide:heart"
                      :label="String(likes || '')"
                      @click="useLike(toast, comments[index], _id, 'comment')"
                    ></UButton>
                    <UButton
                      variant="ghost"
                      icon="lucide:heart-crack"
                    ></UButton>
                    <template
                      v-if="
                        owner === userInfo.id || activePost.user === userInfo.id
                      "
                    >
                      <UButton
                        v-if="isMobile"
                        variant="ghost"
                        icon="lucide:ellipsis"
                        @click="
                          onOpenDropdownMenu(
                            owner === userInfo.id,
                            _id,
                            index,
                            content
                          )
                        "
                      ></UButton>
                      <UDropdownMenu v-else :items="dropdownMenuItems">
                        <UButton
                          variant="ghost"
                          icon="lucide:ellipsis"
                          @click="
                            onOpenDropdownMenu(
                              owner === userInfo.id,
                              _id,
                              index,
                              content
                            )
                          "
                        ></UButton>
                      </UDropdownMenu>
                    </template>
                  </div>
                </div>
                <UCollapsible
                  v-if="replyCount"
                  v-model:open="isCommentCollapsibleOpenMap[_id]"
                >
                  <template #content>
                    <UPageCard
                      v-for="(
                        {
                          owner: replyOwner,
                          _id: replyId,
                          profile,
                          content,
                          createdAt,
                          user,
                          liked,
                          likes,
                          replyTargetProfile
                        },
                        replyIndex
                      ) in replyComments"
                      :key="replyId"
                      class="pb-2 first:pt-2"
                      variant="naked"
                      :ui="{ body: 'w-full' }"
                    >
                      <template #body>
                        <UUser
                          :avatar="{ alt: profile.nickname[0] }"
                          size="xl"
                          :ui="{
                            root: 'items-start',
                            wrapper: 'flex-1',
                            name: 'gap-2 flex text-sm text-toned items-center ',
                            description:
                              'text-highlighted flex flex-col justify-between',
                            avatar: 'size-5 text-xs'
                          }"
                        >
                          <template #name>
                            <span>{{ profile.nickname }}</span>
                            <UBadge
                              v-if="activePost.user === user"
                              label="作者"
                            ></UBadge>
                            <template v-if="replyTargetProfile">
                              <UIcon name="lucide:chevrons-right"></UIcon>
                              <span>{{ replyTargetProfile?.nickname }}</span>
                            </template>
                          </template>
                          <template #description>
                            <div class="text-base">{{ content.text }}</div>
                            <div
                              v-if="
                                replyComments[replyIndex].content.images.length
                              "
                            >
                              <img
                                class="size-11"
                                @click="
                                  viewerOverlay.open({
                                    urls: replyComments[replyIndex].content
                                      .images
                                  })
                                "
                                v-for="image in replyComments[replyIndex]
                                  .content.images"
                                :src="VITE_OSS_BASE_URL + image.url"
                              />
                            </div>
                            <div class="flex items-center justify-between">
                              <p class="text-toned">
                                <span
                                  >{{ useFormatTimeAgo(createdAt) }} ·
                                  广东</span
                                >
                                <span
                                  class="ml-2"
                                  @click="
                                    onReplyTarget(
                                      owner,
                                      user,
                                      profile.nickname,
                                      _id,
                                      index,
                                      replyId,
                                      replyIndex,
                                      content
                                    )
                                  "
                                  >回复</span
                                >
                              </p>
                              <div>
                                <UButton
                                  variant="ghost"
                                  icon="lucide:heart"
                                  :color="liked ? 'secondary' : 'primary'"
                                  :label="String(likes || '')"
                                  @click="
                                    useLike(
                                      toast,
                                      comments[index].replyComments[replyIndex],
                                      replyId,
                                      'comment'
                                    )
                                  "
                                ></UButton>
                                <UButton
                                  variant="ghost"
                                  icon="lucide:heart-crack"
                                ></UButton>
                                <template
                                  v-if="
                                    user === userInfo.id ||
                                    activePost.user === userInfo.id ||
                                    replyOwner === userInfo.id
                                  "
                                >
                                  <UButton
                                    v-if="isMobile"
                                    variant="ghost"
                                    icon="lucide:ellipsis"
                                    @click="
                                      onOpenReplyDropdownMenu(
                                        user === userInfo.id,
                                        replyId,
                                        replyIndex,
                                        content,
                                        index
                                      )
                                    "
                                  ></UButton>
                                  <UDropdownMenu
                                    v-else
                                    :items="replydropdownMenuItems"
                                  >
                                    <UButton
                                      variant="ghost"
                                      icon="lucide:ellipsis"
                                      @click="
                                        onOpenReplyDropdownMenu(
                                          user === userInfo.id,
                                          replyId,
                                          replyIndex,
                                          content,
                                          index
                                        )
                                      "
                                    ></UButton>
                                  </UDropdownMenu>
                                </template>
                              </div>
                            </div>
                          </template>
                        </UUser>
                      </template>
                    </UPageCard>
                  </template>
                </UCollapsible>
                <UButton
                  v-if="replyCount && visibleReplyCount < replyCount"
                  @click="onLoadReplies(_id, index, visibleReplyCount)"
                  :label="`—— 展开${isCommentCollapsibleOpenMap[_id] ? '更多' : ` ${replyCount} 条回复`}`"
                  color="neutral"
                  variant="ghost"
                  trailing-icon="i-lucide-chevron-down"
                />
                <UButton
                  v-if="isCommentCollapsibleOpenMap[_id]"
                  @click="onCollipse(_id, index)"
                  label="收起"
                  color="neutral"
                  variant="ghost"
                  trailing-icon="i-lucide-chevron-up"
                />
              </template>
            </UUser>
          </template>
        </UPageCard>
      </div>
      <div v-else>
        <UPageCard
          v-for="{ user, profile, createdAt } in likes"
          :key="user"
          variant="soft"
          class="not-last:mb-2"
          :ui="{ body: 'w-full' }"
        >
          <template #body>
            <UUser
              :name="profile.nickname"
              :avatar="{ alt: profile.nickname[0] }"
              size="xl"
              :ui="{
                root: 'items-start',
                wrapper: 'flex-1',
                description: 'flex justify-between'
              }"
            >
              <template #description>
                <span>点赞了你的内容</span>
                <time>{{ useFormatTimeAgo(createdAt) }}</time>
              </template>
            </UUser>
          </template>
        </UPageCard>
      </div>
      <UDrawer
        v-model:open="isEditMenuDrawerOpen"
        :handle="false"
        title="操作"
        description=" "
      >
        <template #footer>
          <UButton
            label="编辑"
            @click="onEditComment"
            class="justify-center"
          ></UButton>
          <UButton
            label="删除"
            @click="onDeleteComment"
            class="justify-center"
            color="error"
          ></UButton>
        </template>
      </UDrawer>
      <UDrawer
        v-model:open="isEditReplyMenuDrawerOpen"
        :handle="false"
        title="操作"
        description=" "
      >
        <template #footer>
          <UButton
            label="编辑"
            @click="onEditReply"
            class="justify-center"
          ></UButton>
          <UButton
            label="删除"
            @click="onDeleteReply"
            class="justify-center"
            color="error"
          ></UButton>
        </template>
      </UDrawer>
    </template>
    <template #footer>
      <UInput
        placeholder="善语结缘，温暖常伴..."
        class="relative w-full"
        autoresize
        @click="
          publisherOverlay.open({
            action: 'comment'
          })
        "
      >
      </UInput>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { usePostStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import OverlayPublisher from './OverlayPublisher.vue'
import { useFormatTimeAgo, useLike } from '@/hooks'
import { getPostLikesAPI } from '@/apis/like'
import {
  deleteCommentAPI,
  deleteReplyAPI,
  getRepliesAPI,
  getCommentsAPI
} from '@/apis/comment'
import type { userInfo } from '@/types'
import OverlayViewer from './OverlayViewer.vue'

defineProps<{ isMatch: boolean }>()
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile, userInfo } = storeToRefs(useUserStore())
const {
  comments,
  isCommentCollapsibleOpenMap,
  canEdit,
  activePost,
  activeCommentContent,
  activeCommentId,
  activeCommentIndex,
  activePostId,
  activeReplyId,
  activeReplyIndex,
  activeReplyContent
} = storeToRefs(usePostStore())
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const viewerOverlay = overlay.create(OverlayViewer)
const likes = ref<
  { createdAt: number; user: string; profile: userInfo['profile'] }[]
>([])
const toast = useToast()
const tabItems = [
  {
    label: '评论',
    value: 'comment'
  },
  {
    label: '赞',
    value: 'like'
  }
]
const activeTab = ref('comment')
const activeRightTab = ref('recommend')
const items = [
  {
    label: '推荐',
    value: 'recommend'
  },
  {
    label: '最新',
    value: 'latest'
  }
]
const isEditMenuDrawerOpen = ref(false)
const isEditReplyMenuDrawerOpen = ref(false)
const dropdownMenuItems = computed(() => {
  const common = {
    label: '删除',
    icon: 'lucide:trash',
    color: 'error',
    onSelect: () => onDeleteComment()
  }
  return canEdit.value
    ? [
        [
          {
            label: '编辑',
            icon: 'lucide:pen',
            onSelect: () => onEditComment()
          },
          common
        ]
      ]
    : [[common]]
})
const replydropdownMenuItems = computed(() => {
  const common = {
    label: '删除',
    icon: 'lucide:trash',
    color: 'error',
    onSelect: () => onDeleteReply()
  }
  return canEdit.value
    ? [
        [
          {
            label: '编辑',
            icon: 'lucide:pen',
            onSelect: () => onEditReply()
          },
          common
        ]
      ]
    : [[common]]
})

const onEditReply = () => {
  publisherOverlay.open({
    action: 'updateReply'
  })

  if (isMobile.value) {
    isEditReplyMenuDrawerOpen.value = false
  }
}

const onEditComment = () => {
  publisherOverlay.open({
    action: 'updateComment'
  })

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = false
  }
}

const onDeleteReply = async () => {
  try {
    await deleteReplyAPI(activeReplyId.value)
    activePost.value.commentCount--
    const comment = comments.value[activeCommentIndex.value]
    comment.replyCount--
    comment.visibleReplyCount--
    comment.replyComments.splice(activeReplyIndex.value, 1)

    if (comment.replyCount === 0) {
      isCommentCollapsibleOpenMap.value[comment._id] = false
    }

    if (isMobile.value) {
      isEditReplyMenuDrawerOpen.value = false
    }
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onDeleteComment = async () => {
  try {
    await deleteCommentAPI(activeCommentId.value)
    const _comments = comments.value
    const _activeCommentIndex = activeCommentIndex.value
    activePost.value.commentCount -=
      _comments[_activeCommentIndex].replyCount + 1
    _comments.splice(_activeCommentIndex, 1)

    if (isMobile.value) {
      isEditMenuDrawerOpen.value = false
    }
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onReply = (owner, commentId, commentIndex) => {
  activeCommentId.value = commentId
  activeCommentIndex.value = commentIndex
  publisherOverlay.open({
    action: 'reply',
    owner
  })
}

const onReplyTarget = (
  owner,
  replyTarget,
  replyTargetNickname,
  commentId,
  commentIndex,
  replyId,
  replyIndex,
  replyContent
) => {
  activeCommentId.value = commentId
  activeCommentIndex.value = commentIndex
  activeReplyId.value = replyId
  activeReplyIndex.value = replyIndex
  activeReplyContent.value = replyContent
  publisherOverlay.open({
    action: 'reply',
    owner,
    replyTarget,
    replyTargetNickname
  })
}

const onOpenDropdownMenu = (
  _canEdit,
  commentId,
  commentIndex,
  commentContent
) => {
  canEdit.value = _canEdit
  activeCommentId.value = commentId
  activeCommentIndex.value = commentIndex
  activeCommentContent.value = commentContent

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = true
  }
}

const onOpenReplyDropdownMenu = (
  _canEdit,
  replyId,
  replyIndex,
  replyContent,
  commentIndex
) => {
  canEdit.value = _canEdit
  activeReplyId.value = replyId
  activeReplyIndex.value = replyIndex
  activeReplyContent.value = replyContent
  activeCommentIndex.value = commentIndex

  if (isMobile.value) {
    isEditReplyMenuDrawerOpen.value = true
  }
}

const onCollipse = (commentId, index) => {
  isCommentCollapsibleOpenMap.value[commentId] = false
  comments.value[index].visibleReplyCount = 0
}

const onLoadReplies = async (commentId, index, visibleReplyCount) => {
  const comment = comments.value[index]
  const { replyComments } = comment
  const replyCommentsLength = replyComments.length

  if (replyCommentsLength && !visibleReplyCount) {
    // 加载过评论后折叠了评论，点击展示时直接显示之前加载过的所有评论
    comment.visibleReplyCount = replyCommentsLength
  } else {
    const { data } = await getRepliesAPI(
      commentId,
      ++comment.page,
      replyCommentsLength ? replyComments[replyCommentsLength - 1]._id : ''
    )
    replyComments.push(...data)
    comment.visibleReplyCount += data.length
  }

  isCommentCollapsibleOpenMap.value[commentId] = true
}

const initComments = async () => {
  const { data } = await getCommentsAPI(activePostId.value)

  for (let i = 0, l = data.length; i < l; i++) {
    const item = data[i]
    isCommentCollapsibleOpenMap.value[item._id] = false
    item.page = 0
    item.visibleReplyCount = 0
    item.replyComments = []
  }

  comments.value = data
}

const unwatch = watch(activeTab, async v => {
  if (v === 'like') {
    likes.value = (await getPostLikesAPI(activePostId.value)).data
    unwatch()
  }
})

onMounted(async () => {
  await initComments()
})

onBeforeUnmount(() => {
  comments.value = []
  isCommentCollapsibleOpenMap.value = {}
})
</script>
