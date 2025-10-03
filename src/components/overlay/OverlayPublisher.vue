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
      <UTextarea
        autofocus
        placeholder="善语结缘，温暖常伴..."
        v-model="payload.text"
        class="w-full"
        autoresize
        :rows="5"
        :maxrows="10"
        maxlength="2000"
        :ui="{ trailing: 'flex items-end' }"
      >
        <template v-if="payload.text" #trailing>
          <div class="text-muted py-1.5 text-xs tabular-nums">
            {{ payload.text.length }}/2000
          </div>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="lucide:circle-x"
            @click="payload.text = ''"
          />
        </template>
      </UTextarea>
      <UFileUpload
        ref="fileUploadRef"
        @update:model-value="onUpdateFile"
        v-model="payload.images"
        :dropzone="false"
        label="选择图片"
        description="每张图片的最大尺寸为 10 MB"
        icon="lucide:plus"
        accept="image/png, image/jpeg, image/webp"
        multiple
        :ui="{
          files: 'grid-cols-3'
        }"
      >
      </UFileUpload>
    </template>
    <template #footer>
      <div>
        <UButton variant="ghost" icon="lucide:image"></UButton>
        <UButton variant="ghost" icon="lucide:smile"></UButton>
      </div>
      <div>
        <UButton
          v-if="
            (isPost || isFeedback) && (payload.text || payload.images.length)
          "
          label="草稿箱"
          @click="onDraft"
        ></UButton>
        <UButton
          :disabled="!payload.text && !payload.images.length"
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
                    ? onReply()
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
      <UTextarea
        autofocus
        placeholder="善语结缘，温暖常伴..."
        v-model="payload.text"
        class="w-full"
        autoresize
        :rows="5"
        :maxrows="10"
        maxlength="2000"
        :ui="{ trailing: 'flex items-end' }"
      >
        <template v-if="payload.text" #trailing>
          <div class="text-muted py-1.5 text-xs tabular-nums">
            {{ payload.text.length }}/2000
          </div>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="lucide:circle-x"
            @click="payload.text = ''"
          />
        </template>
      </UTextarea>
      <UFileUpload
        ref="fileUploadRef"
        @update:model-value="onUpdateFile"
        v-model="payload.images"
        :dropzone="false"
        label="选择图片"
        description="每张图片的最大尺寸为 10 MB"
        icon="lucide:plus"
        accept="image/png, image/jpeg, image/webp"
        multiple
        :ui="{
          files: 'grid-cols-3'
        }"
      >
      </UFileUpload>
    </template>
    <template #footer>
      <div>
        <!-- <UButton variant="ghost" icon="lucide:image"></UButton> -->
        <UButton variant="ghost" icon="lucide:smile"></UButton>
      </div>
      <div>
        <UButton
          v-if="
            (isPost || isFeedback) && (payload.text || payload.images.length)
          "
          label="草稿箱"
          @click="onDraft"
        ></UButton>
        <UButton
          :disabled="!payload.text && !payload.images.length"
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
                    ? onReply()
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
import { onMounted, reactive, useTemplateRef } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { publishPostAPI, updatePostAPI } from '@/apis/post'
import { postFeedback } from '@/apis/feedback'
import { useGenHash, useGetDB } from '@/hooks'

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
  targetId?: string
  owner?: string
  replyTarget?: string
  replyTargetNickname?: string
}>()
const { VITE_OSS_BASE_URL } = import.meta.env
const { postMap } = storeToRefs(usePostStore())
const { action } = props
const isPost = action === 'post'
const isComment = action === 'comment'
const isReply = action === 'reply'
const isFeedback = action === 'feedback'
const isUpdatePost = action === 'updatePost'
const isUpdateComment = action === 'updateComment'
const isUpdateReply = action === 'updateReply'
const payload = reactive({
  text: isPost
    ? localStorage.getItem('postDraft') || ''
    : isUpdatePost
      ? postMap.value[props.targetId].activePost.content.text
      : isComment || isReply
        ? ''
        : isUpdateComment
          ? postMap.value[props.targetId].activeCommentContent.text
          : isUpdateReply
            ? postMap.value[props.targetId].activeReplyContent.text
            : localStorage.getItem('feedbackDraft') || '',
  images: isUpdatePost
    ? postMap.value[props.targetId].activePost.content.images.map(
        item => item.blob
      )
    : isUpdateComment
      ? postMap.value[props.targetId].comments[
          postMap.value[props.targetId].activeCommentIndex
        ].content.images.map(item => (VITE_OSS_BASE_URL + item.url) as any)
      : isUpdateReply
        ? postMap.value[props.targetId].comments[
            postMap.value[props.targetId].activeCommentIndex
          ].replyComments[
            postMap.value[props.targetId].activeReplyIndex
          ].content.images.map(item => (VITE_OSS_BASE_URL + item.url) as any)
        : []
})
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
const fileUploadRef = useTemplateRef('fileUploadRef')

const initDraggable = () => {
  if (!sortable) {
    sortable = true

    // 选择图片，视图更新后的 children[0] 才是图片容器
    setTimeout(() => {
      useSortable(
        fileUploadRef.value.dropzoneRef.children[0] as HTMLElement,
        [],
        {
          animation: 150,
          onUpdate: ({ oldIndex, newIndex }) => {
            const item = payload.images.splice(oldIndex, 1)[0]
            payload.images.splice(newIndex, 0, item)
          }
        }
      )
    })
  }
}

const onUpdateFile = files => {
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
    if (files[i].size > 10 * 1024 * 1024) {
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

  if (files.length) {
    initDraggable()
  } else {
    // 数量为 0 时会销毁容器，下次发生变化时需要重新绑定
    sortable = false
  }
}

const onDraft = () => {
  if (payload.text || payload.images.length) {
    localStorage.setItem(
      isPost ? 'postDraft' : 'feedbackDraft',
      JSON.stringify(payload)
    )
    toast.add({ title: '已保存到草稿', icon: 'lucide:smile' })
  }

  emit('close', true)
}

const getImageSize = () => {
  const { images } = payload
  const { length } = images

  return new Promise(resolve => {
    if (length) {
      const metadata = []

      for (let i = 0; i < length; i++) {
        const image = images[i]
        const img = new Image()
        img.onload = () => {
          const { width, height } = img
          metadata.push({ width, height })

          if (i === length - 1) {
            resolve(metadata)
          }
        }
        img.src = URL.createObjectURL(image)
      }
    } else {
      resolve(null)
    }
  })
}

const transformPayloadToFormdata = async () => {
  const { text, images } = payload
  const { length } = images
  const formdata = new FormData()

  if (text) {
    formdata.append('text', text)
  }

  if (length) {
    const metadata = await getImageSize()

    for (let i = 0; i < length; i++) {
      const image = images[i]
      metadata[i].hash = await useGenHash(image)
      formdata.append(String(i), image)
    }

    formdata.append('metadata', JSON.stringify(metadata))
  }

  return formdata
}

const onPublishPost = async () => {
  try {
    const formdata = await transformPayloadToFormdata()
    const { data: post } = await publishPostAPI(formdata)
    const _post = JSON.parse(JSON.stringify(post))
    toast.add({ title: '发布成功', icon: 'lucide:smile' })
    localStorage.removeItem('postDraft')
    const { images } = post.content
    const { images: _images } = _post.content
    const { images: __images } = payload
    for (let i = 0, l = images.length; i < l; i++) {
      const image = images[i]
      const _image = _images[i]
      const file = __images[i]
      image.url = URL.createObjectURL(file)
      image.blob = file
      delete _image.url
      _image.blob = file
    }
    postMap.value[props.targetId].posts.unshift(post)
    delete _post.commentCount
    delete _post.likes
    const db = await useGetDB(userInfo.value.id)
    await db.add('posts', _post)
    payload.text = ''
    payload.images = []
    emit('close', true)
  } catch {
    toast.add({ title: '发布失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onUpdatePost = async () => {
  try {
    const formdata = await transformPayloadToFormdata()
    formdata.append('postId', postMap.value[props.targetId].activePostId)
    const { data: latestContent } = await updatePostAPI(formdata)
    const _latestContent = JSON.parse(JSON.stringify(latestContent))
    toast.add({ title: '更新成功', icon: 'lucide:smile' })
    const { images } = latestContent
    const { images: _images } = _latestContent
    const { images: __images } = payload
    const _activePost = postMap.value[props.targetId].activePost
    for (let i = 0, l = images.length; i < l; i++) {
      const image = images[i]
      const _image = _images[i]
      const file = __images[i]
      image.url = URL.createObjectURL(file)
      image.blob = file
      delete _image.url
      _image.blob = file
    }
    _activePost.updateAt = Date.now()
    const post = JSON.parse(JSON.stringify(_activePost))
    _activePost.content = latestContent
    post.content = _latestContent
    const db = await useGetDB(userInfo.value.id)
    await db.put('posts', post)
    payload.text = ''
    payload.images = []
    emit('close', true)
  } catch {
    toast.add({ title: '更新失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onUpdateReply = async () => {
  try {
    const formdata = await transformPayloadToFormdata()
    formdata.append('commentId', postMap.value[props.targetId].activeReplyId)
    const newContent = (await updateCommentAPI(formdata)).data
    payload.text = ''
    payload.images = []
    postMap.value[props.targetId].comments[
      postMap.value[props.targetId].activeCommentIndex
    ].replyComments[postMap.value[props.targetId].activeReplyIndex].content =
      newContent
    emit('close', true)
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onReply = async () => {
  try {
    const formdata = await transformPayloadToFormdata()
    const _activeCommentId = postMap.value[props.targetId].activeCommentId
    formdata.append('owner', props.owner)
    formdata.append('postId', postMap.value[props.targetId].activePostId)
    formdata.append('commentId', _activeCommentId)
    formdata.append('replyTarget', props.replyTarget || '')
    formdata.append(
      'replyId',
      postMap.value[props.targetId].activeReplyId || ''
    )
    const newComment = (await replyAPI(formdata)).data
    payload.text = ''
    payload.images = []
    newComment.profile = userInfo.value.profile
    postMap.value[props.targetId].activePost.commentCount++
    const comment =
      postMap.value[props.targetId].comments[
        postMap.value[props.targetId].activeCommentIndex
      ]
    comment.replyCount++

    if (props.replyTarget) {
      newComment.replyTargetProfile = { nickname: props.replyTargetNickname }
    }

    comment.replyComments.unshift(newComment)

    // 如果当前展开了回复，可见数量需要自增，因为当前可能展开了所有评论，而新增评论
    // 后如果不自增，会出现展开更多按钮
    if (
      postMap.value[props.targetId].isCommentCollapsibleOpenMap[
        _activeCommentId
      ]
    ) {
      comment.visibleReplyCount++
    }

    emit('close', true)
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onUpdateComment = async () => {
  try {
    const formdata = await transformPayloadToFormdata()
    formdata.append('commentId', postMap.value[props.targetId].activeCommentId)
    const newComment = (await updateCommentAPI(formdata)).data
    payload.text = ''
    payload.images = []
    newComment.profile = userInfo.value.profile
    const comment =
      postMap.value[props.targetId].comments[
        postMap.value[props.targetId].activeCommentIndex
      ]
    comment.content = newComment
    comment.updateAt = Date.now()
    emit('close', true)
  } catch (error) {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onPublishComment = async () => {
  try {
    const formdata = await transformPayloadToFormdata()
    formdata.append('postId', postMap.value[props.targetId].activePostId)
    const newComment = (await publishCommentAPI(formdata)).data
    payload.text = ''
    payload.images = []
    postMap.value[props.targetId].activePost.commentCount++
    newComment.page = 0
    newComment.visibleReplyCount = 0
    newComment.replyComments = []
    newComment.profile = userInfo.value.profile
    postMap.value[props.targetId].isCommentCollapsibleOpenMap[newComment._id] =
      false
    postMap.value[props.targetId].comments.unshift(newComment)
    emit('close', true)
  } catch {
    toast.add({ title: '操作失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

const onFeedback = async () => {
  try {
    const formdata = await transformPayloadToFormdata()
    await postFeedback(formdata)
    payload.text = ''
    payload.images = []
    toast.add({ title: '提交成功', icon: 'lucide:smile' })
    localStorage.removeItem('feedbackDraft')
    emit('close', true)
  } catch (error) {
    toast.add({ title: '提交失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

onMounted(() => {
  setTimeout(() => {
    initDraggable()
  })
})
</script>
