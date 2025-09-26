import HTTP from './http'

const prefix = '/post'

export const publishPost = async content =>
  HTTP.request(`${prefix}`, {
    method: 'POST',
    data: { content }
  })

export const getPosts = async targetId =>
  HTTP.request(`${prefix}?targetId=${targetId}`)

export const deletePost = async postId =>
  HTTP.request(`${prefix}?postId=${postId}`, {
    method: 'DELETE'
  })

export const updatePost = async (postId, content) =>
  HTTP.request(`${prefix}/update`, {
    method: 'POST',
    data: { postId, content }
  })
