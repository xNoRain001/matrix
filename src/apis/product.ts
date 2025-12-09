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

export const deleteProductAPI = async productId =>
  HTTP.request(`${prefix}?productId=${productId}`, {
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

export const delistAPI = async productId =>
  HTTP.request(`${prefix}/delist?productId=${productId}`)

export const relistAPI = async productId =>
  HTTP.request(`${prefix}/relist?productId=${productId}`)

export const refreshProductAPI = async productId =>
  HTTP.request(`${prefix}/refresh?productId=${productId}`)
