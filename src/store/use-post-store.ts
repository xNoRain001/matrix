import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { post, comment, content } from '@/types'

const usePostStore = defineStore('postStore', () => ({
  activeTab: ref<'myCollege' | 'latest' | 'friend' | 'market' | 'partner'>(
    'latest'
  ),
  allPostLoaded: ref(false),
  allProductLoaded: ref(false),
  allPostByCollegeLoaded: ref(false),
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
