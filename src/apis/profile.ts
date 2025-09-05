import HTTP from './http'

const prefix = '/profile'

export const getProfiles = async ids =>
  HTTP.request(`${prefix}/get-profiles?ids=${ids}`)
