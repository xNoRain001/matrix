<template>
  <USlideover
    :title="post ? '编辑' : '发布'"
    description=" "
    :ui="{
      footer: 'justify-between flex-row'
    }"
  >
    <template #body>
      <UTextarea
        placeholder="请尽情发挥吧..."
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
      <div>
        <UButton v-if="!post" label="草稿箱" @click="onDraft"></UButton>
        <UButton
          :disabled="!content.length"
          :label="post ? '更新' : '发布'"
          class="ml-2"
          @click="post ? onUpdatePost() : onPublishPost()"
        ></UButton>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { publishPostAPI, updatePostAPI } from '@/apis/post'
import { useUserStore } from '@/store'
import type { post } from '@/types'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const props = defineProps<{ post?: post; index?: number }>()
const content = ref(
  props.post ? props.post.content.text : localStorage.getItem('postDraft') || ''
)
const toast = useToast()
const emit = defineEmits<{ close: [boolean] }>()
const { posts } = storeToRefs(useUserStore())

const onDraft = () => {
  localStorage.setItem('postDraft', content.value)
  toast.add({ title: '已保存到草稿', icon: 'lucide:smile' })
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
      props.post._id,
      _content
    )
    toast.add({ title: '更新成功', icon: 'lucide:smile' })
    content.value = ''
    posts.value[props.index].content = latestContent
    posts.value[props.index].updateAt = Date.now()
    emit('close', true)
  } catch (error) {
    toast.add({ title: '更新失败', color: 'error', icon: 'lucide:annoyed' })
  }
}
</script>
