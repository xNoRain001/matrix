import HTTP from './http'

const prefix = '/post'

export const publishPostAPI = async content =>
  HTTP.request(`${prefix}`, {
    method: 'POST',
    data: { content }
  })

export const getPostsAPI = async targetId =>
  HTTP.request(`${prefix}?targetId=${targetId}`)

export const deletePostAPI = async postId =>
  HTTP.request(`${prefix}?postId=${postId}`, {
    method: 'DELETE'
  })

export const updatePostAPI = async (postId, content) =>
  HTTP.request(`${prefix}`, {
    method: 'PATCH',
    data: { postId, content }
  })
