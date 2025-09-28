<template>
  <UDrawer
    v-if="isMobile"
    :handle="false"
    :title="title"
    description=" "
    :ui="{
      footer: 'justify-between flex-row'
    }"
  >
    <template #body>
      <UTextarea
        placeholder="善语结缘，温暖常伴..."
        v-model="content"
        class="w-full"
        autoresize
        variant="none"
        :rows="5"
        :maxrows="10"
        maxlength="2000"
        :ui="{ base: 'p-0', trailing: 'flex items-end' }"
      >
        <template v-if="content" #trailing>
          <div class="text-muted py-1.5 text-xs tabular-nums">
            {{ content.length }}/2000
          </div>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="lucide:circle-x"
            @click="content = ''"
          />
        </template>
      </UTextarea>
    </template>
    <template #footer>
      <div>
        <UButton variant="ghost" icon="lucide:image"></UButton>
        <UButton variant="ghost" icon="lucide:smile"></UButton>
      </div>
      <UButton
        :label="title.slice(0, 2)"
        @click="
          props.action === 'comment'
            ? onPublishComment()
            : props.action === 'reply'
              ? onReplyComment()
              : props.action === 'updateComment'
                ? onUpdateComment()
                : onUpdateReply()
        "
      ></UButton>
    </template>
  </UDrawer>
  <USlideover
    v-else
    class=""
    :title="title"
    description=" "
    :ui="{
      footer: 'justify-between flex-row'
    }"
  >
    <template #body>
      <UTextarea
        placeholder="善语结缘，温暖常伴..."
        v-model="content"
        class="w-full"
        autoresize
        variant="none"
        :rows="5"
        :maxrows="10"
        maxlength="2000"
        :ui="{ base: 'p-0', trailing: 'flex items-end' }"
      >
        <template v-if="content" #trailing>
          <div class="text-muted py-1.5 text-xs tabular-nums">
            {{ content.length }}/2000
          </div>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="lucide:circle-x"
            @click="content = ''"
          />
        </template>
      </UTextarea>
    </template>
    <template #footer>
      <div>
        <UButton variant="ghost" icon="lucide:image"></UButton>
        <UButton variant="ghost" icon="lucide:smile"></UButton>
      </div>
      <UButton
        :label="title.slice(0, 2)"
        @click="
          props.action === 'comment'
            ? onPublishComment()
            : props.action === 'reply'
              ? onReplyComment()
              : props.action === 'updateComment'
                ? onUpdateComment()
                : onUpdateReply()
        "
      ></UButton> </template
  ></USlideover>
</template>

<script lang="ts" setup>
import { publishCommentAPI, replyAPI, updateCommentAPI } from '@/apis/comment'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const props = defineProps<{
  action: 'comment' | 'updateComment' | 'reply' | 'updateReply'
  owner?: string
  replyTarget?: string
  replyTargetNickname?: string
  replyId?: string
  replyIndex?: number
  replyContent?: any
  commentId?: string
  commentIndex?: number
  commentContent?: any
  postId?: string
  postIndex?: number
}>()
const content = ref(
  props.action === 'comment' || props.action === 'reply'
    ? ''
    : props.action === 'updateComment'
      ? props.commentContent.text
      : props.replyContent.text
)
const { isMobile, userInfo, posts, comments, isCommentCollapsibleOpenMap } =
  storeToRefs(useUserStore())
const toast = useToast()
const emit = defineEmits<{ close: [boolean] }>()
const title =
  props.action === 'comment'
    ? '发布评论'
    : props.action === 'updateComment' || props.action === 'updateReply'
      ? '编辑评论'
      : '回复评论'

const onUpdateReply = async () => {
  try {
    const newContent = (await updateCommentAPI(props.replyId, content.value))
      .data
    content.value = ''
    comments.value[props.commentIndex].replyComments[props.replyIndex].content =
      newContent
    emit('close', true)
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onReplyComment = async () => {
  try {
    const newComment = (
      await replyAPI(
        props.owner,
        props.postId,
        props.commentId,
        props.replyTarget || '',
        props.replyId || '',
        content.value
      )
    ).data
    content.value = ''
    newComment.profile = userInfo.value.profile
    posts.value[props.postIndex].commentCount++
    comments.value[props.commentIndex].replyCount++
    if (props.replyTarget) {
      newComment.replyTargetProfile = { nickname: props.replyTargetNickname }
    }

    comments.value[props.commentIndex].replyComments.unshift(newComment)

    // 如果当前展开了回复，可见数量需要自增，因为当前可能展开了所有评论，而新增评论
    // 后如果不自增，会出现展开更多按钮
    if (isCommentCollapsibleOpenMap.value[props.commentId]) {
      comments.value[props.commentIndex].visibleReplyCount++
    }

    emit('close', true)
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onUpdateComment = async () => {
  try {
    const newComment = (await updateCommentAPI(props.commentId, content.value))
      .data
    content.value = ''
    newComment.profile = userInfo.value.profile
    comments.value[props.commentIndex].content = newComment
    comments.value[props.commentIndex].updateAt = Date.now()
    emit('close', true)
  } catch (error) {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onPublishComment = async () => {
  try {
    const newComment = (await publishCommentAPI(props.postId, content.value))
      .data
    content.value = ''
    posts.value[props.postIndex].commentCount++
    newComment.page = 0
    newComment.visibleReplyCount = 0
    newComment.replyComments = []
    newComment.profile = userInfo.value.profile
    isCommentCollapsibleOpenMap.value[newComment._id] = false
    comments.value.unshift(newComment)
    emit('close', true)
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}
</script>
