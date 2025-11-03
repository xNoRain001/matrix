<template>
  <USlideover
    :title="title"
    description=" "
    :ui="{
      body: 'space-y-4 sm:space-y-6',
      footer: 'justify-between flex-row',
      description: 'hidden'
    }"
  >
    <template #body>
      <template v-if="isReport">
        <template v-if="reportTarget === 'profile'">
          <UPageCard
            title="举报对象"
            description="选择举报对象"
            variant="naked"
            orientation="horizontal"
            class="mb-4"
          >
          </UPageCard>
          <USelect
            class="w-full"
            v-model="reportTargetType"
            :items="reportTargetTypes"
          />
        </template>
        <UPageCard
          title="违规类型"
          description="选择对方的违规类型"
          variant="naked"
          orientation="horizontal"
          class="mb-4"
        >
        </UPageCard>
        <URadioGroup
          color="primary"
          variant="table"
          v-model="reportType"
          :items="radioGroupitems"
        />
      </template>
      <UPageCard
        title="文本"
        description="输入文本内容"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      >
      </UPageCard>
      <UTextarea
        :placeholder="
          isReply ? `回复：${replyTargetNickname}` : '善语结缘，温暖常伴...'
        "
        v-model="payload.text"
        class="w-full"
        autoresize
        :rows="5"
        :maxrows="5"
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
      <UPageCard
        title="图片"
        description="选择图片，最多 9 张，每张不超过 10 MB，通过拖拽交换图片位置"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
        :ui="{
          container: 'lg:grid-cols-1'
        }"
      >
      </UPageCard>
      <UFileUpload
        ref="fileUploadRef"
        @update:model-value="onUpdateFile"
        v-model="files"
        :dropzone="false"
        icon="lucide:plus"
        accept="image/png, image/jpeg, image/gif"
        multiple
        :ui="{
          files: 'grid-cols-3'
        }"
      >
      </UFileUpload>
      <div class="text-primary text-center text-sm" @click="onTextToImage">
        没有图片？试试 AI 生成图片
      </div>
      <UChatPrompt
        v-model="prompt"
        variant="soft"
        placeholder="帮我生成一只卡通风格的猫"
        :maxrows="3"
        :loading="generating"
      >
        <UChatPromptSubmit class="rounded-full" @click="onTextToImage" />
      </UChatPrompt>
    </template>
    <template #footer>
      <div>
        <!-- <UButton variant="ghost" icon="lucide:smile"></UButton> -->
      </div>
      <div>
        <UButton
          v-if="(isPost || isFeedback) && (payload.text || files.length)"
          label="草稿箱"
          @click="onDraft"
        ></UButton>
        <UButton
          :disabled="!payload.text && !files.length"
          class="ml-2"
          :label="title"
          loading-auto
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
                        : isFeedback
                          ? onFeedback()
                          : onReport()
          "
        ></UButton>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import {
  publishCommentAPI,
  replyAPI,
  updateCommentAPI,
  updateReplyAPI
} from '@/apis/comment'
import { usePostStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onMounted, reactive, ref, useTemplateRef } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { publishPostAPI, updatePostAPI } from '@/apis/post'
import { postFeedback } from '@/apis/feedback'
import { useGetDB, useURLToBlob } from '@/hooks'
import useUploadFilesToOSS from '@/hooks/use-upload-files-to-oss'
import type { content } from '@/types'
import { reportAPI } from '@/apis/report'

let sortable = false
let startTime = 0
const props = defineProps<{
  action:
    | 'post'
    | 'updatePost'
    | 'comment'
    | 'updateComment'
    | 'reply'
    | 'updateReply'
    | 'feedback'
    | 'report'
    | 'appeal'
  targetId?: string
  owner?: string
  replyTarget?: string
  replyTargetNickname?: string
  reportTarget?: 'profile' | 'post' | 'comment' | 'messageRecord'
  reportedUserId?: string
  reportPostId?: string
  reportedCommentId?: string
  appealTarget?: 'post'
  appealPostId?: string
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
const isReport = action === 'report'
const initFiles = async () => {
  const initCommentFiles = async images => {
    const files = []
    for (let i = 0, l = images.length; i < l; i++) {
      const { width, height, url } = images[i]
      const blob = await useURLToBlob(VITE_OSS_BASE_URL + url)
      ;(blob as any).ossURL = url
      ;(blob as any).width = width
      ;(blob as any).height = height
      files.push(blob)
    }

    return files
  }

  return isUpdatePost
    ? postMap.value[props.targetId].activePost.content.images.map(
        ({ blob, width, height, ossURL }) => {
          ;(blob as any).ossURL = ossURL
          ;(blob as any).width = width
          ;(blob as any).height = height

          return blob
        }
      )
    : isUpdateComment
      ? await initCommentFiles(
          postMap.value[props.targetId].comments[
            postMap.value[props.targetId].activeCommentIndex
          ].content.images
        )
      : isUpdateReply
        ? await initCommentFiles(
            postMap.value[props.targetId].comments[
              postMap.value[props.targetId].activeCommentIndex
            ].replyComments[postMap.value[props.targetId].activeReplyIndex]
              .content.images
          )
        : []
}
const files = ref(await initFiles())
const oldFilesOrder = files.value.map(item => item.ossURL)
const oldFileLength = files.value.length
const payload: content = reactive({
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
  images: []
})
const oldText = payload.text
const { userInfo } = storeToRefs(useUserStore())
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
          : isFeedback
            ? '提交反馈'
            : '举报'
const fileUploadRef = useTemplateRef('fileUploadRef')
const reportType = ref('a')
const radioGroupitems = [
  {
    label: '我不喜欢',
    value: 'a',
    description: ''
  },
  {
    label: '侵犯权益',
    value: 'b',
    description: '搬运抄袭，或侵犯肖像、隐私、名誉、商标、专利权'
  },
  {
    label: '搬运、抄袭作品',
    value: 'c',
    description: '原创作品的全部内容或部分内容被盗用'
  },
  {
    label: '色情低俗',
    value: 'd',
    description:
      '作品中可能含有展示或隐晦表达淫秽色情、诱惑诱导性交友、渲染低级趣味的内容'
  },
  {
    label: '违法犯罪',
    value: 'e',
    description:
      '作品中可能含有管制枪械、刀具、毒品，等违禁品，或涉嫌诈骗、赌博、侵害野生动植物的相关内容'
  },
  {
    label: '政治敏感',
    value: 'f',
    description:
      '作品中可能含有非权威媒体发布有关政治的争议。有关国防、外交政策等方面的重大分歧等相关内容'
  },
  {
    label: '违规营销',
    value: 'g',
    description:
      '作品中可能含有虚假营销、夸张宣传、售卖假冒商品等有关售卖及违规广告的内容'
  },
  {
    label: '不实信息',
    value: 'h',
    description:
      '作品中可能含有虚假信息，包括但不限于对社会新闻事件或专业领域知识的不实阐述、错误解读'
  },
  {
    label: '网络暴力',
    value: 'i',
    description:
      '作品中可能含有侮辱谩骂、造谣诽谤、煽动仇恨、威逼胁迫、侵犯隐私，以及影响身心健康的指责嘲讽、贬低歧视等内容'
  },
  {
    label: '危害人身安全',
    value: 'j',
    description:
      '作品中可能含有宣扬展示自杀/自残场景、教唆他人自杀或其他容易造成人身伤害危险行为'
  },
  {
    label: '未成年相关',
    value: 'k',
    description:
      '对话中可能含有未成年抽烟、喝酒等不文明行为，侵害未成年身心健康以及未成年低俗相关内容'
  },
  {
    label: 'AI 生成内容问题',
    value: 'l',
    description:
      '作品应用 AI 生成类工具，未添加 AI 标识、传播违规信息，或不实信息'
  },
  {
    label: '以上没有我想举报的类型',
    value: 'm',
    description:
      '作品中可能含有血腥、恐怖、暴力等内容，或者其他未提及的违规类型'
  }
]
const reportTargetType = ref('')
const reportTargetTypes = [
  {
    label: '头像',
    value: 'avatar'
  },
  {
    label: '背景',
    value: 'spaceBg'
  },
  {
    label: '昵称',
    value: 'nickname'
  },
  {
    label: '签名',
    value: 'bio'
  },
  {
    label: '标签',
    value: 'tag'
  }
]
const prompt = ref('')
const generating = ref(false)

const onTextToImage = async () => {
  if (generating.value) {
    return
  }

  generating.value = true
  startTime = Date.now()

  try {
    const response = await fetch(
      `https://text-to-image.mtrix.cyou?prompt=${prompt.value}`
    )

    if (!response.ok) {
      throw new Error()
    }

    const blob = await response.blob()
    const file = new File([blob], `text-to-image-${Date.now()}.jpeg`, {
      type: 'image/jpeg'
    })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    files.value.push(file)
    prompt.value = ''
    toast.add({
      title: `生成成功，用时 ${((Date.now() - startTime) / 1000).toFixed(2)} 秒`
    })
  } catch {
    toast.add({ title: '生成失败', color: 'error', icon: 'lucide:annoyed' })
  } finally {
    generating.value = false
  }
}

const onReport = async () => {
  if (props.reportTarget === 'profile' && reportTargetType.value === '') {
    toast.add({
      title: '未选择举报对象',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  try {
    const imageMetadata = await useUploadFilesToOSS(
      userInfo,
      'image',
      files.value
    )
    payload.images = imageMetadata
    const formData = new FormData()

    if (props.reportTarget === 'post') {
      formData.append('reportPostId', props.reportPostId)
    } else if (props.reportTarget === 'comment') {
      formData.append('reportedCommentId', props.reportedCommentId)
    }

    formData.append('type', 'report')
    formData.append('reportType', reportType.value)
    formData.append(
      'reportTarget',
      props.reportTarget === 'profile'
        ? reportTargetType.value
        : props.reportTarget
    )
    formData.append('reportedUserId', props.reportedUserId)
    formData.append('content', JSON.stringify(payload))
    await reportAPI(formData)
    toast.add({ title: '提交成功', icon: 'lucide:smile' })
    emit('close', true)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const initDraggable = () => {
  if (!sortable) {
    sortable = true

    // 选择图片，视图更新后的 children[0] 才是图片容器
    setTimeout(() => {
      useSortable(
        fileUploadRef.value.dropzoneRef.children[0] as HTMLElement,
        files,
        { animation: 150 }
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
  localStorage.setItem(isPost ? 'postDraft' : 'feedbackDraft', payload.text)
  toast.add({ title: '已保存到草稿', icon: 'lucide:smile' })
  emit('close', true)
}

const onPublishPost = async () => {
  try {
    const imageMetadata = await useUploadFilesToOSS(
      userInfo,
      'image',
      files.value
    )
    payload.images = imageMetadata
    const formData = new FormData()
    formData.append('type', 'publishPost')
    formData.append('content', JSON.stringify(payload))
    const { data: post } = await publishPostAPI(formData)
    const _post = JSON.parse(JSON.stringify(post))
    const images = post.content.images
    const _images = _post.content.images
    toast.add({ title: '发布成功', icon: 'lucide:smile' })
    localStorage.removeItem('postDraft')
    for (let i = 0, l = imageMetadata.length; i < l; i++) {
      const file = files.value[i]
      const image = images[i]
      const _image = _images[i]
      // 先保存 ossURL
      _image.ossURL = image.url
      // 内存中也需要保存，这样立马进行更新时能判断出不是新图片
      image.ossURL = image.url
      image.url = URL.createObjectURL(file)
      image.blob = file
      _image.blob = file
      delete _image.url
    }
    const db = await useGetDB(userInfo.value.id)
    // 需要保存 id，否则没有重新从本地数据库读取的情况下进行修改时无法更新本地数据库
    post.id = await db.add('posts', _post)

    // 在广场直接发布 post，如果之前没有打开过个人空间，postMap 中是没有值的
    if (postMap.value[props.targetId]) {
      postMap.value[props.targetId].posts.unshift(post)
    }

    emit('close', true)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const isChanged = () => {
  let res = true

  // 判断是否更新了图片顺序
  for (let i = 0, l = oldFilesOrder.length; i < l; i++) {
    // 可能删除了所有图片，此时 files 为空数组
    if (oldFilesOrder[i] !== files.value[i]?.ossURL) {
      res = false
      break
    }
  }

  // 图片顺序没更新，但是有可能在最后新增了图片
  if (res) {
    res = files.value.length === oldFileLength
  }

  // 没发生任何改变
  if (payload.text === oldText && res) {
    toast.add({ title: '更新成功', icon: 'lucide:smile' })
    return false
  }

  // 发生了改变，需要判断是否将文字和图片都清空了
  if (!payload.text && !files.value.length) {
    toast.add({ title: '内容不能为空', color: 'error', icon: 'lucide:annoyed' })
    return false
  }

  return true
}

const onUpdatePost = async () => {
  if (!isChanged()) {
    return
  }

  try {
    const imageMetadata = await useUploadFilesToOSS(
      userInfo,
      'image',
      files.value
    )
    payload.images = imageMetadata
    const formData = new FormData()
    const activePostId = postMap.value[props.targetId].activePostId
    formData.append('type', 'updatePost')
    formData.append('postId', activePostId)
    const stringifyPayload = JSON.stringify(payload)
    formData.append('content', stringifyPayload)
    await updatePostAPI(formData)
    const _latestContent = JSON.parse(stringifyPayload)
    const { images } = payload
    const { images: _images } = _latestContent
    toast.add({ title: '更新成功', icon: 'lucide:smile' })
    const _activePost = postMap.value[props.targetId].activePost
    for (let i = 0, l = imageMetadata.length; i < l; i++) {
      const file = files.value[i]
      const image = images[i]
      const _image = _images[i]
      // 如果不是新增的图片，url 已经在数据库中保存了
      const ossURL = image.url.startsWith('tmp/')
        ? `posts/${activePostId}/${image.url.split('/')[2]}`
        : image.url
      _image.ossURL = ossURL
      image.ossURL = ossURL
      image.url = URL.createObjectURL(file)
      image.blob = file
      _image.blob = file
      delete _image.url
    }
    _activePost.updateAt = Date.now()
    const post = JSON.parse(JSON.stringify(_activePost))
    _activePost.content = payload
    post.content = _latestContent
    const db = await useGetDB(userInfo.value.id)
    const tx = db.transaction('posts', 'readwrite')
    const store = tx.objectStore('posts')
    const index = store.index('_id')
    const cursor = await index.openCursor(
      postMap.value[props.targetId].activePostId
    )
    if (cursor) {
      // 由于是从本地数据库中读取的，post 中有 id 字段，所以不需要传 id
      await store.put(post)
    }
    emit('close', true)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onUpdateReply = async () => {
  if (!isChanged()) {
    return
  }

  try {
    const imageMetadata = await useUploadFilesToOSS(
      userInfo,
      'image',
      files.value
    )
    payload.images = imageMetadata
    const formData = new FormData()
    const activePostId = postMap.value[props.targetId].activePostId
    formData.append('type', 'updateReply')
    formData.append('content', JSON.stringify(payload))
    formData.append('postId', activePostId)
    formData.append('commentId', postMap.value[props.targetId].activeCommentId)
    formData.append('replyId', postMap.value[props.targetId].activeReplyId)
    await updateReplyAPI(formData)
    toast.add({ title: '更新成功', icon: 'lucide:smile' })
    const images = payload.images
    for (let i = 0, l = images.length; i < l; i++) {
      const image = images[i]
      const { url } = image
      image.url = url.startsWith('tmp/')
        ? `posts/${activePostId}/${postMap.value[props.targetId].activeCommentId}/${postMap.value[props.targetId].activeReplyId}/${url.split('/')[4]}`
        : url
    }
    const reply =
      postMap.value[props.targetId].comments[
        postMap.value[props.targetId].activeCommentIndex
      ].replyComments[postMap.value[props.targetId].activeReplyIndex]
    reply.content = payload
    reply.updateAt = Date.now()
    emit('close', true)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onReply = async () => {
  try {
    const imageMetadata = await useUploadFilesToOSS(
      userInfo,
      'image',
      files.value
    )
    payload.images = imageMetadata
    const formData = new FormData()
    formData.append('type', 'reply')
    formData.append('content', JSON.stringify(payload))
    formData.append('postId', postMap.value[props.targetId].activePostId)
    const _activeCommentId = postMap.value[props.targetId].activeCommentId
    formData.append('commentId', _activeCommentId)
    formData.append('owner', props.owner)
    formData.append('replyTarget', props.replyTarget || '')
    formData.append(
      'replyId',
      postMap.value[props.targetId].activeReplyId || ''
    )
    const newComment = (await replyAPI(formData)).data
    toast.add({ title: '评论成功', icon: 'lucide:smile' })
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
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onUpdateComment = async () => {
  if (!isChanged()) {
    return
  }

  try {
    const imageMetadata = await useUploadFilesToOSS(
      userInfo,
      'image',
      files.value
    )
    payload.images = imageMetadata
    const formData = new FormData()
    const activePostId = postMap.value[props.targetId].activePostId
    formData.append('type', 'updateComment')
    formData.append('content', JSON.stringify(payload))
    formData.append('postId', activePostId)
    formData.append('commentId', postMap.value[props.targetId].activeCommentId)
    await updateCommentAPI(formData)
    toast.add({ title: '更新成功', icon: 'lucide:smile' })
    const images = payload.images
    for (let i = 0, l = images.length; i < l; i++) {
      const image = images[i]
      const { url } = image
      image.url = url.startsWith('tmp/')
        ? `posts/${activePostId}/${postMap.value[props.targetId].activeCommentId}/${url.split('/')[3]}`
        : url
    }
    const comment =
      postMap.value[props.targetId].comments[
        postMap.value[props.targetId].activeCommentIndex
      ]
    comment.content = payload
    comment.updateAt = Date.now()
    emit('close', true)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onPublishComment = async () => {
  try {
    const imageMetadata = await useUploadFilesToOSS(
      userInfo,
      'image',
      files.value
    )
    payload.images = imageMetadata
    const formData = new FormData()
    formData.append('type', 'publishComment')
    formData.append('content', JSON.stringify(payload))
    formData.append('postId', postMap.value[props.targetId].activePostId)
    const newComment = (await publishCommentAPI(formData)).data
    toast.add({ title: '评论成功', icon: 'lucide:smile' })
    postMap.value[props.targetId].activePost.commentCount++
    newComment.page = 0
    newComment.visibleReplyCount = 0
    newComment.replyComments = []
    newComment.profile = userInfo.value.profile
    postMap.value[props.targetId].isCommentCollapsibleOpenMap[newComment._id] =
      false
    postMap.value[props.targetId].comments.unshift(newComment)
    emit('close', true)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onFeedback = async () => {
  try {
    const imageMetadata = await useUploadFilesToOSS(
      userInfo,
      'image',
      files.value
    )
    payload.images = imageMetadata
    const formData = new FormData()
    formData.append('type', 'feedback')
    formData.append('content', JSON.stringify(payload))
    await postFeedback(formData)
    toast.add({ title: '提交成功', icon: 'lucide:smile' })
    localStorage.removeItem('feedbackDraft')
    emit('close', true)
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

onMounted(() => {
  setTimeout(() => {
    if (files.value.length) {
      initDraggable()
    }
  })
})
</script>
