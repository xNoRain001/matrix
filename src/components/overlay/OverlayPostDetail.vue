<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    title="详情"
    description=" "
    :ui="{
      body: 'p-0 sm:p-0 gap-4 sm:gap-6 flex flex-col',
      description: 'hidden'
    }"
  >
    <template #body>
      <div class="space-y-2 p-4 sm:p-6">
        <p class="text-highlighted break-all whitespace-pre-wrap">
          {{ postMap[targetId].activePost.content.text }}
        </p>
        <Carousel
          v-if="postMap[targetId].activePost.content.images.length"
          :items="postMap[targetId].activePost.content.images"
          :active-index="0"
        />
        <div class="flex items-center justify-between">
          <p class="text-toned text-sm">
            {{ useFormatTimeAgo(postMap[targetId].activePost.createdAt) }}
          </p>
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
          />
        </div>
      </div>
      <div
        v-if="postMap[targetId].activePost.user === userInfo.id"
        class="flex items-center justify-between px-4 sm:px-6"
      >
        <UTabs
          v-model="activeTab"
          :content="false"
          :items="tabItems"
          size="xs"
        />
        <UTabs
          v-if="activeTab === 'comment'"
          size="xs"
          v-model="sortBy"
          :content="false"
          :items="items"
          @update:model-value="onSort"
        />
      </div>
      <div v-else class="flex items-center justify-between px-4 sm:px-6">
        <div class="text-highlighted font-semibold">
          {{ `评论 ${postMap[targetId].activePost.commentCount}` }}
        </div>
        <UTabs
          size="xs"
          v-model="sortBy"
          :content="false"
          :items="items"
          @update:model-value="onSort"
        />
      </div>
      <div v-if="activeTab === 'comment'">
        <div
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
          class="border-b-accented/50 cursor-pointer space-y-2 rounded-none border-b p-4 sm:p-6"
        >
          <UUser
            size="xl"
            :ui="{
              root: 'items-start',
              wrapper: 'flex-1',
              name: 'gap-2 flex items-start',
              description: 'flex flex-col justify-between'
            }"
          >
            <template #avatar>
              <div
                @click="
                  !activeSpaceTargetIds.has(owner) &&
                  profileSpaceOverlay.open({
                    targetId: owner,
                    targetProfile: profile
                  })
                "
                class="text-muted bg-elevated flex size-10 items-center justify-center rounded-full text-xl font-medium"
              >
                <img
                  class="size-full rounded-full object-cover"
                  :src="`${VITE_OSS_BASE_URL}avatar/${owner}`"
                  :alt="profile.nickname[0]"
                  @error="onError"
                />
              </div>
            </template>
            <template #name>
              <span
                class="text-toned break-all"
                @click="
                  !activeSpaceTargetIds.has(owner) &&
                  profileSpaceOverlay.open({
                    targetId: owner,
                    targetProfile: profile
                  })
                "
                >{{ profile.nickname }}</span
              >
              <UBadge v-if="userInfo.id === owner" label="我" />
              <UBadge
                v-else-if="postMap[targetId].activePost.user === owner"
                label="作者"
              />
            </template>
            <template #description>
              <div
                class="text-highlighted text-base break-all whitespace-pre-wrap"
              >
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
                  />
                  <UButton variant="ghost" icon="lucide:heart-crack" />
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
                          owner,
                          _id,
                          index,
                          content,
                          true
                        )
                      "
                    />
                    <UDropdownMenu v-else :items="dropdownMenuItems">
                      <UButton
                        variant="ghost"
                        icon="lucide:ellipsis"
                        @click="
                          onOpenDropdownMenu(
                            owner === userInfo.id,
                            owner,
                            _id,
                            index,
                            content,
                            true
                          )
                        "
                      />
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
                  <div
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
                  >
                    <UUser
                      size="xl"
                      :ui="{
                        root: 'items-start',
                        wrapper: 'flex-1',
                        name: 'gap-2 flex items-start',
                        description: 'flex flex-col justify-between'
                      }"
                    >
                      <template #avatar>
                        <div
                          @click="
                            !activeSpaceTargetIds.has(owner) &&
                            profileSpaceOverlay.open({
                              targetId: user,
                              targetProfile: profile
                            })
                          "
                          class="text-muted bg-elevated size-5 rounded-full text-center text-xs font-medium"
                        >
                          <img
                            class="size-full rounded-full object-cover"
                            :src="`${VITE_OSS_BASE_URL}avatar/${user}`"
                            :alt="profile.nickname[0]"
                            @error="onError"
                          />
                        </div>
                      </template>
                      <template #name>
                        <span
                          class="text-toned break-all"
                          @click="
                            !activeSpaceTargetIds.has(owner) &&
                            profileSpaceOverlay.open({
                              targetId: user,
                              targetProfile: profile
                            })
                          "
                        >
                          {{
                            `${profile.nickname}${
                              replyTargetProfile?.nickname
                                ? ` ▸ ${replyTargetProfile?.nickname}`
                                : ''
                            }`
                          }}
                        </span>
                        <UBadge v-if="userInfo.id === user" label="我" />
                        <UBadge
                          v-else-if="postMap[targetId].activePost.user === user"
                          label="作者"
                        />
                      </template>
                      <template #description>
                        <div
                          class="text-highlighted text-base break-all whitespace-pre-wrap"
                        >
                          {{ content.text }}
                        </div>
                        <div
                          v-if="replyComments[replyIndex].content.images.length"
                          class="flex"
                        >
                          <img
                            crossorigin="anonymous"
                            class="size-11 rounded-lg"
                            @click="
                              viewerOverlay.open({
                                urls: replyComments[replyIndex].content.images
                              })
                            "
                            v-for="image in replyComments[replyIndex].content
                              .images"
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
                            />
                            <UButton
                              variant="ghost"
                              icon="lucide:heart-crack"
                            />
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
                                    user,
                                    replyId,
                                    replyIndex,
                                    content,
                                    _id,
                                    index,
                                    false
                                  )
                                "
                              />
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
                                      user,
                                      replyId,
                                      replyIndex,
                                      content,
                                      _id,
                                      index,
                                      false
                                    )
                                  "
                                />
                              </UDropdownMenu>
                            </template>
                          </div>
                        </div>
                      </template>
                    </UUser>
                  </div>
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
        </div>
        <USeparator class="p-4 sm:p-6" label="已经到底了" />
      </div>
      <div v-else>
        <div
          v-for="{ user, profile, createdAt } in likes"
          :key="user"
          class="bg-elevated/50 border-b-accented/50 rounded-none border-b p-4 sm:p-6"
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
        <USeparator class="p-4 sm:p-6" label="已经到底了" />
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
          <UButton label="编辑" @click="onEditComment" class="justify-center" />
          <UButton
            label="删除"
            @click="onDeleteComment"
            class="justify-center"
            color="error"
          />
          <UButton
            label="举报"
            @click="onReport"
            class="justify-center"
            color="error"
          />
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
          <UButton label="编辑" @click="onEditReply" class="justify-center" />
          <UButton
            label="删除"
            @click="onDeleteReply"
            class="justify-center"
            color="error"
          />
          <UButton
            label="举报"
            @click="onReport"
            class="justify-center"
            color="error"
          />
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
      />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { usePostStore, useRecentContactsStore, useUserStore } from '@/store'
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
import OverlayProfileSpace from './OverlayProfileSpace.vue'

let isComment = false
let reportedUserId = ''
const props = defineProps<{ targetId: string }>()
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { postMap } = storeToRefs(usePostStore())
const { activeSpaceTargetIds } = storeToRefs(useRecentContactsStore())
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
    label: `评论 ${postMap.value[props.targetId].activePost.commentCount}`,
    value: 'comment'
  },
  {
    label: `赞 ${postMap.value[props.targetId].activePost.likes}`,
    value: 'like'
  }
]
const activeTab = ref('comment')
const sortBy = ref('hot')
const items = [
  {
    label: '热度',
    value: 'hot'
  },
  {
    label: '时间',
    value: 'time'
  }
]
const isEditMenuDrawerOpen = ref(false)
const isEditReplyMenuDrawerOpen = ref(false)
const report = {
  label: '举报',
  icon: 'lucide:circle-alert',
  color: 'error',
  onSelect: () => {
    onReport()
  }
}
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
    : [[common, report]]
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
    : [[common, report]]
})

const onSort = v => {
  sortBy.value = v
}

const onReport = () => {
  publisherOverlay.open({
    action: 'report',
    reportTarget: 'comment',
    reportedUserId,
    reportedCommentId: isComment
      ? postMap.value[props.targetId].activeCommentId
      : postMap.value[props.targetId].activeReplyId
  })
}

const onError = e => {
  const { target } = e
  target.replaceWith(target.alt)
}

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
  user,
  commentId,
  commentIndex,
  commentContent,
  _isComment
) => {
  postMap.value[props.targetId].canEdit = _canEdit
  postMap.value[props.targetId].activeCommentId = commentId
  postMap.value[props.targetId].activeCommentIndex = commentIndex
  postMap.value[props.targetId].activeCommentContent = commentContent
  isComment = _isComment
  reportedUserId = user

  if (isMobile.value) {
    isEditMenuDrawerOpen.value = true
  }
}

const onOpenReplyDropdownMenu = (
  _canEdit,
  user,
  replyId,
  replyIndex,
  replyContent,
  commentId,
  commentIndex,
  _isComment
) => {
  postMap.value[props.targetId].canEdit = _canEdit
  postMap.value[props.targetId].activeReplyId = replyId
  postMap.value[props.targetId].activeReplyIndex = replyIndex
  postMap.value[props.targetId].activeReplyContent = replyContent
  postMap.value[props.targetId].activeCommentId = commentId
  postMap.value[props.targetId].activeCommentIndex = commentIndex
  isComment = _isComment
  reportedUserId = user

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
