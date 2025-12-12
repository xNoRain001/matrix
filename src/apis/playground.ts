import HTTP from './http'

const prefix = '/playground'

export const getPlaygroundPostsAPI = async (
  lastId = '',
  firstId = '',
  college = ''
) =>
  HTTP.request(
    `${prefix}?lastId=${lastId}&firstId=${firstId}&college=${college}`
  )

export const getPlaygroundFriendPostsAPI = async (lastId = '') =>
  HTTP.request(`${prefix}/friend?lastId=${lastId}`)

export const getPlaygroundProductsAPI = async (
  college,
  lastId = '',
  firstId = ''
) =>
  HTTP.request(
    `${prefix}/products?college=${college}&lastId=${lastId}&firstId=${firstId}`
  )
