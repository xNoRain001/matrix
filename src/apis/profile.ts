import HTTP from './http'

const prefix = '/profile'

export const getProfiles = async ids =>
  HTTP.request(`${prefix}/get-profiles?ids=${ids}`)

export const updateProfile = async userInfo =>
  HTTP.request(`${prefix}/update-profile`, {
    method: 'POST',
    data: userInfo
  })
