import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { post, comment, content } from '@/types'

const usePostStore = defineStore('postStore', () => ({
  posts: ref<post[]>([]),
  comments: ref<comment[]>([]),
  isCommentCollapsibleOpenMap: ref({}),
  canEdit: ref(false),
  activePost: ref<post>(null),
  activeCommentId: ref(''),
  activeCommentIndex: ref(0),
  activePostId: ref(''),
  activePostIndex: ref(0),
  activeReplyId: ref(''),
  activeReplyIndex: ref(0),
  activeCommentContent: ref<content>(null),
  activeReplyContent: ref<content>(null)
}))

export default usePostStore
