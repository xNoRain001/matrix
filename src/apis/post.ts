import HTTP from './http'

const prefix = '/post'

export const publishPostAPI = async data =>
  HTTP.request(`${prefix}`, {
    data,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const getPostsAPI = async targetId =>
  HTTP.request(`${prefix}?targetId=${targetId}`)

export const deletePostAPI = async postId =>
  HTTP.request(`${prefix}?postId=${postId}`, {
    method: 'DELETE'
  })

export const updatePostAPI = async data =>
  HTTP.request(`${prefix}`, {
    data,
    method: 'PATCH',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
