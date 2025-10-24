<template>
  <USlideover
    title="详情"
    description=" "
    :ui="{ body: 'gap-4 md:gap-6 flex flex-col', description: 'hidden' }"
  >
    <template #body>
      <UPageCard
        variant="soft"
        class="cursor-pointer"
        :ui="{ container: 'gap-y-2' }"
      >
        <p class="text-highlighted break-words whitespace-pre-wrap">
          {{ postMap[targetId].activePost.content.text }}
        </p>
        <Carousel
          v-if="postMap[targetId].activePost.content.images.length"
          :items="postMap[targetId].activePost.content.images"
          :active-index="0"
        ></Carousel>
        <div class="flex items-center justify-between">
          <p class="text-toned text-sm">
            {{ useFormatTimeAgo(postMap[targetId].activePost.createdAt) }}
          </p>
          <div>
            <UButton
              variant="ghost"
              icon="lucide:message-circle"
              :label="String(postMap[targetId].activePost.commentCount || '')"
            ></UButton>
            <UButton
              variant="ghost"
              :color="
                postMap[targetId].activePost.liked ? 'secondary' : 'primary'
              "
              icon="lucide:heart"
              :label="String(postMap[targetId].activePost.likes || '')"
              @click="
                useLike(
                  toast,
                  postMap[targetId].activePost,
                  postMap[targetId].activePostId,
                  'post'
                )
              "
            ></UButton>
          </div>
        </div>
      </UPageCard>
      <div
        v-if="postMap[targetId].activePost.user === userInfo.id"
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
          v-if="postMap[targetId].comments?.length"
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
          ) in postMap[targetId].comments"
          :key="_id"
          variant="soft"
          class="not-last:mb-2"
          :ui="{ body: 'w-full' }"
        >
          <template #body>
            <UUser
              size="xl"
              :ui="{
                root: 'items-start',
                wrapper: 'flex-1',
                name: 'gap-2 flex text-sm text-toned items-start break-all',
                description: 'text-highlighted flex flex-col justify-between'
              }"
            >
              <template #avatar>
                <div
                  @click="
                    useOpenSpace(
                      profileSpaceOverlay,
                      userInfo,
                      activeTargetIds,
                      owner,
                      profile
                    )
                  "
                  class="text-muted bg-elevated flex size-10 items-center justify-center rounded-full text-xl font-medium"
                >
                  {{ profile.nickname[0] }}
                </div>
              </template>
              <template #name>
                <span
                  @click="
                    useOpenSpace(
                      profileSpaceOverlay,
                      userInfo,
                      activeTargetIds,
                      owner,
                      profile
                    )
                  "
                  >{{ profile.nickname }}</span
                >
                <UBadge v-if="userInfo.id === owner" label="我"></UBadge>
                <UBadge
                  v-else-if="postMap[targetId].activePost.user === owner"
                  label="作者"
                ></UBadge>
              </template>
              <template #description>
                <div class="text-base break-words whitespace-pre-wrap">
                  {{ content.text }}
                </div>
                <div
                  v-if="content.images.length"
                  @click="viewerOverlay.open({ urls: content.images })"
                  class="flex"
                >
                  <!-- 
                    设置 crossorigin="anonymous" 时，浏览器通过 JS 获取图片时请求头
                    才会携带上 Origin 字段  
                  -->
                  <img
                    crossorigin="anonymous"
                    class="size-11 rounded-lg"
                    v-for="image in content.images"
                    :src="VITE_OSS_BASE_URL + image.url"
                  />
                </div>
                <div class="flex items-center justify-between">
                  <p class="text-toned items-center">
                    <!-- · 广东 -->
                    <span>{{ useFormatTimeAgo(createdAt) }}</span>
                    <span
                      class="ml-2"
                      @click="onReply(owner, _id, index, profile.nickname)"
                      >回复</span
                    >
                  </p>
                  <div>
                    <UButton
                      variant="ghost"
                      :color="liked ? 'secondary' : 'primary'"
                      icon="lucide:heart"
                      :label="String(likes || '')"
                      @click="
                        useLike(
                          toast,
                          postMap[targetId].comments[index],
                          _id,
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
                        owner === userInfo.id ||
                        postMap[targetId].activePost.user === userInfo.id
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
                  v-model:open="
                    postMap[targetId].isCommentCollapsibleOpenMap[_id]
                  "
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
                          size="xl"
                          :ui="{
                            root: 'items-start',
                            wrapper: 'flex-1',
                            name: 'gap-2 flex text-sm text-toned items-start break-all',
                            description:
                              'text-highlighted flex flex-col justify-between'
                          }"
                        >
                          <template #avatar>
                            <div
                              @click="
                                useOpenSpace(
                                  profileSpaceOverlay,
                                  userInfo,
                                  activeTargetIds,
                                  user,
                                  profile
                                )
                              "
                              class="text-muted bg-elevated flex size-5 items-center justify-center rounded-full text-xs font-medium"
                            >
                              {{ profile.nickname[0] }}
                            </div>
                          </template>
                          <template #name>
                            <span
                              @click="
                                useOpenSpace(
                                  profileSpaceOverlay,
                                  userInfo,
                                  activeTargetIds,
                                  user,
                                  profile
                                )
                              "
                            >
                              {{
                                `${profile.nickname}${
                                  replyTargetProfile?.nickname
                                    ? ` 回复 ${replyTargetProfile?.nickname}`
                                    : ''
                                }`
                              }}
                            </span>
                            <UBadge
                              v-if="userInfo.id === user"
                              label="我"
                            ></UBadge>
                            <UBadge
                              v-else-if="
                                postMap[targetId].activePost.user === user
                              "
                              label="作者"
                            ></UBadge>
                          </template>
                          <template #description>
                            <div
                              class="text-base break-words whitespace-pre-wrap"
                            >
                              {{ content.text }}
                            </div>
                            <div
                              v-if="
                                replyComments[replyIndex].content.images.length
                              "
                              class="flex"
                            >
                              <img
                                crossorigin="anonymous"
                                class="size-11 rounded-lg"
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
                                <span>
                                  <!-- · 广东 -->
                                  {{ useFormatTimeAgo(createdAt) }}
                                </span>
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
                                      postMap[targetId].comments[index]
                                        .replyComments[replyIndex],
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
                                    postMap[targetId].activePost.user ===
                                      userInfo.id ||
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
                                        _id,
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
                                          _id,
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
                  :label="`—— 展开${postMap[targetId].isCommentCollapsibleOpenMap[_id] ? '更多' : ` ${replyCount} 条回复`}`"
                  color="neutral"
                  variant="ghost"
                  trailing-icon="i-lucide-chevron-down"
                />
                <UButton
                  v-if="postMap[targetId].isCommentCollapsibleOpenMap[_id]"
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
        <USeparator class="px-4 pt-4 sm:px-6 sm:pt-6" label="已经到底了" />
      </div>
      <div v-else>
        <div
          v-for="{ user, profile, createdAt } in likes"
          :key="user"
          class="bg-elevated/50 rounded-lg p-4 not-last:mb-2 sm:p-6"
        >
          <UUser
            :name="profile.nickname"
            :avatar="{
              src: `${VITE_OSS_BASE_URL}avatar/${user}`,
              alt: profile.nickname[0]
            }"
            size="xl"
            :ui="{
              root: 'items-start',
              wrapper: 'flex-1 min-w-0',
              name: 'truncate',
              description: 'flex justify-between'
            }"
          >
            <template #description>
              <span>点赞了你的内容</span>
              <time>{{ useFormatTimeAgo(createdAt) }}</time>
            </template>
          </UUser>
        </div>
        <USeparator class="px-4 pt-4 sm:px-6 sm:pt-6" label="已经到底了" />
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
        :ui="{
          description: 'hidden'
        }"
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
            action: 'comment',
            targetId
          })
        "
      >
      </UInput>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { usePostStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import OverlayPublisher from './OverlayPublisher.vue'
import { useFormatTimeAgo, useLike, useOpenSpace } from '@/hooks'
import { getPostLikesAPI } from '@/apis/like'
import {
  deleteCommentAPI,
  deleteReplyAPI,
  getRepliesAPI,
  getCommentsAPI
} from '@/apis/comment'
import type { userInfo } from '@/types'
import OverlayViewer from './OverlayViewer.vue'
import OverlayProfileSpace from './OverlayProfileSpace.vue'

const props = defineProps<{ targetId: string }>()
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { postMap } = storeToRefs(usePostStore())
const { activeTargetIds } = storeToRefs(useRecentContactsStore())
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const viewerOverlay = overlay.create(OverlayViewer)
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)
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
  return postMap.value[props.targetId].canEdit
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
  return postMap.value[props.targetId].canEdit
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
    action: 'updateReply',
    targetId: props.targetId
  })

  if (isMobile.value) {
    isEditReplyMenuDrawerOpen.value = false
  }
}

const onEditComment = () => {
  publisherOverlay.open({
    action: 'updateComment',
    targetId: props.targetId
  })

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = false
  }
}

const onDeleteReply = async () => {
  try {
    await deleteReplyAPI(postMap.value[props.targetId].activeReplyId)
    postMap.value[props.targetId].activePost.commentCount--
    const comment =
      postMap.value[props.targetId].comments[
        postMap.value[props.targetId].activeCommentIndex
      ]
    comment.replyCount--
    comment.visibleReplyCount--
    comment.replyComments.splice(
      postMap.value[props.targetId].activeReplyIndex,
      1
    )

    if (comment.replyCount === 0) {
      postMap.value[props.targetId].isCommentCollapsibleOpenMap[comment._id] =
        false
    }

    if (isMobile.value) {
      isEditReplyMenuDrawerOpen.value = false
    }

    toast.add({ title: '删除成功', icon: 'lucide:smile' })
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onDeleteComment = async () => {
  try {
    await deleteCommentAPI(postMap.value[props.targetId].activeCommentId)
    const _comments = postMap.value[props.targetId].comments
    const _activeCommentIndex = postMap.value[props.targetId].activeCommentIndex
    postMap.value[props.targetId].activePost.commentCount -=
      _comments[_activeCommentIndex].replyCount + 1
    _comments.splice(_activeCommentIndex, 1)

    if (isMobile.value) {
      isEditMenuDrawerOpen.value = false
    }

    toast.add({ title: '删除成功', icon: 'lucide:smile' })
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onReply = (owner, commentId, commentIndex, replyTargetNickname) => {
  postMap.value[props.targetId].activeCommentId = commentId
  postMap.value[props.targetId].activeCommentIndex = commentIndex
  publisherOverlay.open({
    action: 'reply',
    targetId: props.targetId,
    owner,
    replyTargetNickname
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
  postMap.value[props.targetId].activeCommentId = commentId
  postMap.value[props.targetId].activeCommentIndex = commentIndex
  postMap.value[props.targetId].activeReplyId = replyId
  postMap.value[props.targetId].activeReplyIndex = replyIndex
  postMap.value[props.targetId].activeReplyContent = replyContent
  publisherOverlay.open({
    action: 'reply',
    targetId: props.targetId,
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
  postMap.value[props.targetId].canEdit = _canEdit
  postMap.value[props.targetId].activeCommentId = commentId
  postMap.value[props.targetId].activeCommentIndex = commentIndex
  postMap.value[props.targetId].activeCommentContent = commentContent

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = true
  }
}

const onOpenReplyDropdownMenu = (
  _canEdit,
  replyId,
  replyIndex,
  replyContent,
  commentId,
  commentIndex
) => {
  postMap.value[props.targetId].canEdit = _canEdit
  postMap.value[props.targetId].activeReplyId = replyId
  postMap.value[props.targetId].activeReplyIndex = replyIndex
  postMap.value[props.targetId].activeReplyContent = replyContent
  postMap.value[props.targetId].activeCommentId = commentId
  postMap.value[props.targetId].activeCommentIndex = commentIndex

  if (isMobile.value) {
    isEditReplyMenuDrawerOpen.value = true
  }
}

const onCollipse = (commentId, index) => {
  postMap.value[props.targetId].isCommentCollapsibleOpenMap[commentId] = false
  postMap.value[props.targetId].comments[index].visibleReplyCount = 0
}

const onLoadReplies = async (commentId, index, visibleReplyCount) => {
  const comment = postMap.value[props.targetId].comments[index]
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

  postMap.value[props.targetId].isCommentCollapsibleOpenMap[commentId] = true
}

const initComments = async () => {
  const { data } = await getCommentsAPI(
    postMap.value[props.targetId].activePostId
  )

  postMap.value[props.targetId].isCommentCollapsibleOpenMap = {}

  for (let i = 0, l = data.length; i < l; i++) {
    const item = data[i]
    postMap.value[props.targetId].isCommentCollapsibleOpenMap[item._id] = false
    item.page = 0
    item.visibleReplyCount = 0
    item.replyComments = []
  }

  postMap.value[props.targetId].comments = data
}

const unwatch = watch(activeTab, async v => {
  if (v === 'like') {
    likes.value = (
      await getPostLikesAPI(postMap.value[props.targetId].activePostId)
    ).data
    unwatch()
  }
})

onMounted(async () => {
  await initComments()
})

onBeforeUnmount(() => {
  postMap.value[props.targetId].comments = []
  postMap.value[props.targetId].isCommentCollapsibleOpenMap = {}
})
</script>
