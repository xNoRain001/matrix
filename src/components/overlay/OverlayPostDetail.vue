<template>
  <USlideover
    :dismissible="!isMobile && isMatch ? false : true"
    :overlay="!isMobile && isMatch ? false : true"
    :side="!isMobile && isMatch ? 'left' : 'right'"
    :class="!isMobile && isMatch ? 'max-w-2/5' : ''"
    title="详情"
    description=" "
  >
    <template #body>
      <UPageCard variant="soft" class="cursor-pointer">
        <p class="text-highlighted">
          {{ posts[postIndex].content.text }}
        </p>
        <Carousel
          v-if="posts[postIndex].content.media.length"
          @click.stop="useNoop"
          :items="[]"
          :active-index="0"
        ></Carousel>
        <div class="flex items-center justify-between">
          <p class="text-toned text-sm">
            {{ useFormatTimeAgo(posts[postIndex].createdAt) }}
          </p>
          <div>
            <UButton
              variant="ghost"
              icon="lucide:message-circle-more"
              :label="String(posts[postIndex].commentCount || '')"
            ></UButton>
            <UButton
              variant="ghost"
              :color="posts[postIndex].liked ? 'secondary' : 'primary'"
              icon="lucide:heart"
              :label="String(posts[postIndex].likes || '')"
            ></UButton>
          </div>
        </div>
      </UPageCard>

      <UPageCard
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
        variant="naked"
        class="mt-4 not-last:pb-4 sm:mt-6"
        :ui="{ body: 'w-full' }"
      >
        <template #body>
          <UUser
            :avatar="{
              alt: profile.nickname[0]
            }"
            size="xl"
            :ui="{
              root: 'items-start',
              wrapper: 'flex-1',
              name: 'text-toned text-xs',
              description: 'text-highlighted'
            }"
          >
            <template #name>
              <span>{{ profile.nickname }}</span>
              <UBadge
                v-if="posts[postIndex].user === owner"
                label="作者"
                class="ml-2"
                size="xs"
              ></UBadge>
            </template>
            <template #description>
              <div>{{ content.text }}</div>
              <div class="flex items-center justify-between">
                <p class="text-toned text-xs">
                  <span>{{ useFormatTimeAgo(createdAt) }} · 广东</span>
                  <span
                    class="ml-2 font-semibold"
                    @click="
                      publishCommentOverlay.open({
                        action: 'reply',
                        owner,
                        commentId: _id,
                        commentIndex: index,
                        commentContent: content,
                        postId,
                        postIndex
                      })
                    "
                    >回复</span
                  >
                  <span
                    v-if="owner === userInfo.id"
                    @click="
                      publishCommentOverlay.open({
                        action: 'updateComment',
                        commentId: _id,
                        commentIndex: index,
                        commentContent: content,
                        postId,
                        postIndex
                      })
                    "
                    class="ml-2 font-semibold"
                    >编辑</span
                  >
                  <span
                    @click="onDeleteComment(_id, index)"
                    v-if="
                      owner === userInfo.id ||
                      posts[postIndex].user === userInfo.id
                    "
                    class="text-error ml-2 font-semibold"
                    >删除</span
                  >
                </p>
                <div>
                  <UButton
                    size="xs"
                    variant="ghost"
                    :color="liked ? 'secondary' : 'primary'"
                    icon="lucide:heart"
                    :label="String(likes || '')"
                    @click="onLikeComment(_id, index)"
                  ></UButton>
                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="lucide:heart-crack"
                  ></UButton>
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
                    class="not-last:pb-2 first:pt-2"
                    variant="naked"
                    :ui="{ body: 'w-full' }"
                  >
                    <template #body>
                      <UUser
                        :avatar="{
                          alt: profile.nickname[0]
                        }"
                        :ui="{
                          root: 'items-start',
                          wrapper: 'flex-1',
                          name: 'text-toned text-xs',
                          description: 'text-highlighted',
                          avatar: 'size-5 text-xs'
                        }"
                      >
                        <template #name>
                          <span>{{ profile.nickname }}</span>
                          <UBadge
                            v-if="posts[postIndex].user === user"
                            label="作者"
                            class="ml-2"
                            size="xs"
                          ></UBadge>
                          <template v-if="replyTargetProfile">
                            <UIcon
                              name="lucide:chevrons-right"
                              class="text-toned mx-2 inline"
                            ></UIcon>
                            <span>{{ replyTargetProfile.nickname }}</span>
                          </template>
                        </template>
                        <template #description>
                          <div>{{ content.text }}</div>
                          <div class="flex items-center justify-between">
                            <p class="text-toned text-xs">
                              <span
                                >{{ useFormatTimeAgo(createdAt) }} · 广东</span
                              >
                              <span
                                class="ml-2 font-semibold"
                                @click="
                                  publishCommentOverlay.open({
                                    action: 'reply',
                                    owner,
                                    replyId,
                                    replyTarget: user,
                                    replyTargetNickname: profile.nickname,
                                    commentId: _id,
                                    replyIndex,
                                    replyContent: content,
                                    commentIndex: index,
                                    postId,
                                    postIndex
                                  })
                                "
                                >回复</span
                              >
                              <span
                                v-if="user === userInfo.id"
                                @click="
                                  publishCommentOverlay.open({
                                    action: 'updateReply',
                                    replyId,
                                    replyIndex,
                                    replyContent: content,
                                    commentIndex: index
                                  })
                                "
                                class="ml-2 font-semibold"
                                >编辑</span
                              >
                              <span
                                v-if="
                                  user === userInfo.id ||
                                  posts[postIndex].user === userInfo.id ||
                                  replyOwner === userInfo.id
                                "
                                class="text-error ml-2 font-semibold"
                                @click="
                                  onDeleteReply(replyId, index, replyIndex)
                                "
                                >删除</span
                              >
                            </p>
                            <div>
                              <UButton
                                size="xs"
                                variant="ghost"
                                icon="lucide:heart"
                                :color="liked ? 'secondary' : 'primary'"
                                :label="String(likes || '')"
                                @click="onLikeReply(replyId, index, replyIndex)"
                              ></UButton>
                              <UButton
                                size="xs"
                                variant="ghost"
                                icon="lucide:heart-crack"
                              ></UButton>
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
                @click="
                  onLoadReplies(_id, index, replyCount, visibleReplyCount)
                "
                class="text-toned text-xs font-semibold"
                :label="`—— 展开${isCommentCollapsibleOpenMap[_id] ? '更多' : ` ${replyCount} 条回复`}`"
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-chevron-down"
              />
              <UButton
                v-if="isCommentCollapsibleOpenMap[_id]"
                @click="onCollipse(_id, index)"
                class="text-toned text-xs font-semibold"
                label="收起"
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-chevron-up"
              />
            </template>
          </UUser>
        </template>
      </UPageCard>
    </template>
    <template #footer>
      <UInput
        placeholder="善语结缘，温暖常伴..."
        class="relative w-full"
        autoresize
        @click="
          publishCommentOverlay.open({
            action: 'comment',
            postId,
            postIndex
          })
        "
      >
      </UInput>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted } from 'vue'
import OverlayPublishComment from './OverlayPublishComment.vue'
import { useFormatTimeAgo, useNoop } from '@/hooks'
import { likeAPI } from '@/apis/like'
import {
  deleteCommentAPI,
  deleteReplyAPI,
  getRepliesAPI,
  getCommentsAPI
} from '@/apis/comment'

const props = defineProps<{
  isMatch: boolean
  postId: string
  postIndex: number
}>()
const { isMobile, posts, comments, userInfo, isCommentCollapsibleOpenMap } =
  storeToRefs(useUserStore())
const overlay = useOverlay()
const publishCommentOverlay = overlay.create(OverlayPublishComment)
const toast = useToast()

const onDeleteReply = async (commentId, commentIndex, replyIndex) => {
  try {
    await deleteReplyAPI(commentId)
    posts.value[props.postIndex].commentCount--
    comments.value[commentIndex].replyCount--
    comments.value[commentIndex].visibleReplyCount--
    comments.value[commentIndex].replyComments.splice(replyIndex, 1)
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onDeleteComment = async (commentId, index) => {
  try {
    await deleteCommentAPI(commentId)
    posts.value[props.postIndex].commentCount -=
      comments.value[index].replyCount + 1
    comments.value.splice(index, 1)
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onLikeReply = async (replyId, commentIndex, replyIndex) => {
  try {
    const { data: isLike } = await likeAPI(replyId, 'comment')

    if (isLike) {
      comments.value[commentIndex].replyComments[replyIndex].liked = true
      comments.value[commentIndex].replyComments[replyIndex].likes++
    } else {
      comments.value[commentIndex].replyComments[replyIndex].liked = false
      comments.value[commentIndex].replyComments[replyIndex].likes--
    }
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onLikeComment = async (commentId, index) => {
  try {
    const { data: isLike } = await likeAPI(commentId, 'comment')

    if (isLike) {
      comments.value[index].liked = true
      comments.value[index].likes++
    } else {
      comments.value[index].liked = false
      comments.value[index].likes--
    }
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onCollipse = (commentId, index) => {
  isCommentCollapsibleOpenMap.value[commentId] = false
  comments.value[index].visibleReplyCount = 0
}

const onLoadReplies = async (
  commentId,
  index,
  replyCount,
  visibleReplyCount
) => {
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

onMounted(async () => {
  const { data } = await getCommentsAPI(props.postId)

  for (let i = 0, l = data.length; i < l; i++) {
    const item = data[i]
    isCommentCollapsibleOpenMap.value[item._id] = false
    item.page = 0
    item.visibleReplyCount = 0
    item.replyComments = []
  }

  comments.value = data
})

onBeforeUnmount(() => {
  comments.value = []
  isCommentCollapsibleOpenMap.value = {}
})
</script>
