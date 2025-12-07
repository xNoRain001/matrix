import HTTP from './http'

const prefix = '/playground'

export const getPlaygroundPostsAPI = async (
  type: 'myCollege' | 'latest' | 'friend' | 'hot' | 'market' | 'partner',
  lastId = '',
  firstId = ''
) => HTTP.request(`${prefix}/${type}?lastId=${lastId}&firstId=${firstId}`)
