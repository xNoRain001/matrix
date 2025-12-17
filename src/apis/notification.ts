import HTTP from './http'

const prefix = '/notification'

export const getNotificationsAPI = async (type = 'like') =>
  HTTP.request(`${prefix}?type=${type}`)
