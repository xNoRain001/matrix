import HTTP from './http'

const prefix = '/like'

export const likeAPI = async (targetId, targetType: 'post' | 'comment') =>
  HTTP.request(`${prefix}?targetId=${targetId}&targetType=${targetType}`)

export const getPostLikesAPI = async targetId =>
  HTTP.request(`${prefix}/post?targetId=${targetId}`)
