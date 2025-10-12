import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { post, comment, content } from '@/types'

const usePostStore = defineStore('postStore', () => ({
  lastFetchedPostId: ref(Number.MAX_SAFE_INTEGER),
  postMap: reactive<
    Record<
      string,
      {
        posts: post[]
        comments: comment[]
        isCommentCollapsibleOpenMap: { [x: string]: boolean }
        canEdit: boolean
        activePost: post
        activeCommentId: string
        activeCommentIndex: number
        activePostId: string
        activePostIndex: number
        activeReplyId: string
        activeReplyIndex: number
        activeCommentContent: content
        activeReplyContent: content
      }
    >
  >({})
}))

export default usePostStore
