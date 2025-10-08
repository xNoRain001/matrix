import HTTP from './http'

const prefix = '/playground'

export const getPlaygroundPostsAPI = async (
  type: 'latest' | 'friend' | 'hot',
  lastId = '',
  firstId = ''
) => HTTP.request(`${prefix}/${type}?lastId=${lastId}&firstId=${firstId}`)
