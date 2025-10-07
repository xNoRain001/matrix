import HTTP from './http'

const prefix = '/comment'

export const getCommentsAPI = async postId =>
  HTTP.request(`${prefix}?postId=${postId}`)

export const publishCommentAPI = async data =>
  HTTP.request(`${prefix}`, {
    data,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const updateCommentAPI = async data =>
  HTTP.request(`${prefix}/`, {
    data,
    method: 'PATCH',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const deleteCommentAPI = async commentId =>
  HTTP.request(`${prefix}?commentId=${commentId}`, {
    method: 'DELETE'
  })

export const replyAPI = async data =>
  HTTP.request(`${prefix}/reply`, {
    data,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const updateReplyAPI = async data =>
  HTTP.request(`${prefix}/reply`, {
    data,
    method: 'PATCH',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const getRepliesAPI = async (commendId, page, lastId) =>
  HTTP.request(
    `${prefix}/replies?commentId=${commendId}&page=${page}&lastId=${lastId}`
  )

export const deleteReplyAPI = async commentId =>
  HTTP.request(`${prefix}/reply?commentId=${commentId}`, {
    method: 'DELETE'
  })
