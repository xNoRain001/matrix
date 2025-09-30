<template>
  <UDrawer
    v-if="isMobile"
    :handle="false"
    :title="title"
    description=" "
    :ui="{
      body: 'gap-4 md:gap-6 flex flex-col',
      footer: 'justify-between flex-row'
    }"
  >
    <template #body>
      <UFileUpload
        ref="fileUploadRef"
        @update:model-value="onUpdateFile"
        v-model="files"
        :dropzone="false"
        label="选择图片"
        description="每张图片的最大尺寸为 10 MB"
        icon="lucide:plus"
        accept="image/*"
        multiple
        :ui="{
          files: 'grid-cols-3'
        }"
      >
      </UFileUpload>
      <UTextarea
        autofocus
        placeholder="善语结缘，温暖常伴..."
        v-model="content"
        class="w-full"
        autoresize
        :rows="5"
        :maxrows="10"
        maxlength="2000"
        :ui="{ trailing: 'flex items-end' }"
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
      <div>
        <UButton
          v-if="isPost || isFeedback"
          label="草稿箱"
          @click="onDraft"
        ></UButton>
        <UButton
          :disabled="!content.length"
          class="ml-2"
          :label="title"
          @click="
            isPost
              ? onPublishPost()
              : isUpdatePost
                ? onUpdatePost()
                : isComment
                  ? onPublishComment()
                  : isReply
                    ? onReplyComment()
                    : isUpdateComment
                      ? onUpdateComment()
                      : isUpdateReply
                        ? onUpdateReply()
                        : onFeedback()
          "
        ></UButton>
      </div>
    </template>
  </UDrawer>
  <USlideover
    v-else
    class=""
    :title="title"
    description=" "
    :ui="{
      body: 'gap-4 md:gap-6 flex flex-col',
      footer: 'justify-between flex-row'
    }"
  >
    <template #body>
      <UFileUpload
        ref="fileUploadRef"
        @update:model-value="onUpdateFile"
        v-model="files"
        :dropzone="false"
        label="选择图片"
        description="每张图片的最大尺寸为 10 MB"
        icon="lucide:plus"
        accept="image/*"
        multiple
        :ui="{
          files: 'grid-cols-3'
        }"
      >
      </UFileUpload>
      <UTextarea
        autofocus
        placeholder="善语结缘，温暖常伴..."
        v-model="content"
        class="w-full"
        autoresize
        :rows="5"
        :maxrows="10"
        maxlength="2000"
        :ui="{ trailing: 'flex items-end' }"
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
      <div>
        <UButton
          v-if="isPost || isFeedback"
          label="草稿箱"
          @click="onDraft"
        ></UButton>
        <UButton
          :disabled="!content.length"
          class="ml-2"
          :label="title"
          @click="
            isPost
              ? onPublishPost()
              : isUpdatePost
                ? onUpdatePost()
                : isComment
                  ? onPublishComment()
                  : isReply
                    ? onReplyComment()
                    : isUpdateComment
                      ? onUpdateComment()
                      : isUpdateReply
                        ? onUpdateReply()
                        : onFeedback()
          "
        ></UButton>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { publishCommentAPI, replyAPI, updateCommentAPI } from '@/apis/comment'
import { usePostStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, useTemplateRef } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { publishPostAPI, updatePostAPI } from '@/apis/post'
import { postFeedback } from '@/apis/feedback'

let sortable = false
const props = defineProps<{
  action:
    | 'post'
    | 'updatePost'
    | 'comment'
    | 'updateComment'
    | 'reply'
    | 'updateReply'
    | 'feedback'
  owner?: string
  replyTarget?: string
  replyTargetNickname?: string
}>()
const {
  posts,
  comments,
  isCommentCollapsibleOpenMap,
  activePost,
  activeCommentContent,
  activeCommentId,
  activeCommentIndex,
  activePostId,
  activeReplyId,
  activeReplyIndex,
  activeReplyContent
} = storeToRefs(usePostStore())
const { action } = props
const isPost = action === 'post'
const isComment = action === 'comment'
const isReply = action === 'reply'
const isFeedback = action === 'feedback'
const isUpdatePost = action === 'updatePost'
const isUpdateComment = action === 'updateComment'
const isUpdateReply = action === 'updateReply'
const content = ref(
  isPost
    ? localStorage.getItem('postDraft') || ''
    : isUpdatePost
      ? activePost.value.content.text
      : isComment || isReply
        ? ''
        : isUpdateComment
          ? activeCommentContent.value.text
          : isUpdateReply
            ? activeReplyContent.value.text
            : localStorage.getItem('feedbackDraft') || ''
)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const toast = useToast()
const emit = defineEmits<{ close: [boolean] }>()
const title = isPost
  ? '发布动态'
  : isUpdatePost
    ? '更新动态'
    : isComment
      ? '发布评论'
      : isUpdateComment || isUpdateReply
        ? '编辑评论'
        : isReply
          ? '回复评论'
          : '提交反馈'
const files = ref<File[]>([])
const fileUploadRef = useTemplateRef('fileUploadRef')

const onUpdateFile = files => {
  if (!sortable) {
    sortable = true

    // 选择图片，视图更新后的 children[0] 才是图片容器
    setTimeout(() => {
      useSortable(
        fileUploadRef.value.dropzoneRef.children[0] as HTMLElement,
        files,
        {
          animation: 150,
          onUpdate: ({ oldIndex, newIndex }) => {
            const item = files.splice(oldIndex, 1)[0]
            files.splice(newIndex, 0, item)
          }
        }
      )
    })
  }

  let t = false
  const { length } = files

  if (length > 9) {
    for (let i = 0, l = length - 9; i < l; i++) {
      files.pop()
      t = true
    }
  }

  if (t) {
    toast.add({
      title: '图片数量达到上限',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }

  t = false

  for (let i = 0; i < files.length; i++) {
    if (files[i].size > 10 * 1024) {
      t = true
      files.splice(i, 1)
      i--
    }
  }

  if (t) {
    toast.add({
      title: '已移除尺寸过大的图片',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onDraft = () => {
  const _content = content.value

  if (_content) {
    if (isPost) {
      localStorage.setItem('postDraft', _content)
    } else if (isFeedback) {
      localStorage.setItem('feedbackDraft', _content)
    }
    toast.add({ title: '已保存到草稿', icon: 'lucide:smile' })
  }

  emit('close', true)
}

const onPublishPost = async () => {
  try {
    const { data: post } = await publishPostAPI(content.value)
    toast.add({ title: '发布成功', icon: 'lucide:smile' })
    localStorage.removeItem('postDraft')
    content.value = ''
    posts.value.unshift(post)
    emit('close', true)
  } catch (error) {
    toast.add({ title: '发布失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onUpdatePost = async () => {
  try {
    const _content = content.value
    const { data: latestContent } = await updatePostAPI(
      activePostId.value,
      _content
    )
    toast.add({ title: '更新成功', icon: 'lucide:smile' })
    content.value = ''
    const _activePost = activePost.value
    _activePost.content = latestContent
    _activePost.updateAt = Date.now()
    emit('close', true)
  } catch (error) {
    toast.add({ title: '更新失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onUpdateReply = async () => {
  try {
    const newContent = (
      await updateCommentAPI(activeReplyId.value, content.value)
    ).data
    content.value = ''
    comments.value[activeCommentIndex.value].replyComments[
      activeReplyIndex.value
    ].content = newContent
    emit('close', true)
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onReplyComment = async () => {
  try {
    const _activeCommentId = activeCommentId.value
    const newComment = (
      await replyAPI(
        props.owner,
        activePostId.value,
        _activeCommentId,
        props.replyTarget || '',
        activeReplyId.value || '',
        content.value
      )
    ).data
    content.value = ''
    newComment.profile = userInfo.value.profile
    activePost.value.commentCount++
    const comment = comments.value[activeCommentIndex.value]
    comment.replyCount++

    if (props.replyTarget) {
      newComment.replyTargetProfile = { nickname: props.replyTargetNickname }
    }

    comment.replyComments.unshift(newComment)

    // 如果当前展开了回复，可见数量需要自增，因为当前可能展开了所有评论，而新增评论
    // 后如果不自增，会出现展开更多按钮
    if (isCommentCollapsibleOpenMap.value[_activeCommentId]) {
      comment.visibleReplyCount++
    }

    emit('close', true)
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onUpdateComment = async () => {
  try {
    const newComment = (
      await updateCommentAPI(activeCommentId.value, content.value)
    ).data
    content.value = ''
    newComment.profile = userInfo.value.profile
    const comment = comments.value[activeCommentIndex.value]
    comment.content = newComment
    comment.updateAt = Date.now()
    emit('close', true)
  } catch (error) {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onPublishComment = async () => {
  try {
    const newComment = (
      await publishCommentAPI(activePostId.value, content.value)
    ).data
    content.value = ''
    activePost.value.commentCount++
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

const onFeedback = async () => {
  const _content = content.value

  if (_content.length === 0) {
    toast.add({ title: '无效内容', color: 'error', icon: 'lucide:annoyed' })
    return
  }

  try {
    await postFeedback(_content)
    toast.add({ title: '提交成功', icon: 'lucide:smile' })
    localStorage.removeItem('feedbackDraft')
    emit('close', true)
  } catch (error) {
    toast.add({ title: '提交失败', color: 'error', icon: 'lucide:annoyed' })
  }
}
</script>
