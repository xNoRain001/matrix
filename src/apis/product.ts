import HTTP from './http'

const prefix = '/product'

export const publishProductAPI = async data =>
  HTTP.request(`${prefix}`, {
    data,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const getProductsAPI = async (targetId = '', lastId = '') =>
  HTTP.request(`${prefix}?targetId=${targetId}&lastId=${lastId}`)

export const deleteProductAPI = async postId =>
  HTTP.request(`${prefix}?postId=${postId}`, {
    method: 'DELETE'
  })

export const updateProductAPI = async data =>
  HTTP.request(`${prefix}`, {
    data,
    method: 'PATCH',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
