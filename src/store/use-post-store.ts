import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { post, comment, content } from '@/types'

const usePostStore = defineStore('postStore', () => ({
  postMap: reactive<
    Record<
      string,
      {
        products: any[]
        posts: post[]
        comments?: comment[]
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
        activeProduct: any
        activeProductId: string
        activeProductIndex: number
      }
    >
  >({})
}))

export default usePostStore
