import HTTP from './http'

const prefix = '/comment'

export const getCommentsAPI = async postId =>
  HTTP.request(`${prefix}?postId=${postId}`)

export const publishCommentAPI = async (postId, content) =>
  HTTP.request(`${prefix}`, {
    method: 'POST',
    data: { postId, content }
  })

export const updateCommentAPI = async (commentId, content) =>
  HTTP.request(`${prefix}/`, {
    method: 'PATCH',
    data: { commentId, content }
  })

export const deleteCommentAPI = async commentId =>
  HTTP.request(`${prefix}?commentId=${commentId}`, {
    method: 'DELETE'
  })

export const replyAPI = async (
  owner,
  postId,
  commentId,
  replyTarget,
  replyId,
  content
) =>
  HTTP.request(`${prefix}/reply`, {
    method: 'POST',
    data: { owner, postId, commentId, replyTarget, replyId, content }
  })

export const getRepliesAPI = async (commendId, page, lastId) =>
  HTTP.request(
    `${prefix}/replies?commentId=${commendId}&page=${page}&lastId=${lastId}`
  )

export const deleteReplyAPI = async commentId =>
  HTTP.request(`${prefix}/reply?commentId=${commentId}`, {
    method: 'DELETE'
  })
