import HTTP from './http'

const prefix = '/profile'

export const refreshNickname = async ids =>
  HTTP.request(`${prefix}/refresh-nickname?ids=${ids}`)

export const getProfile = async (id = '') =>
  HTTP.request(`${prefix}/get-profile?targetId=${id}`)

export const updateProfile = async userInfo =>
  HTTP.request(`${prefix}/update-profile`, {
    method: 'POST',
    data: userInfo
  })

export const getRandomProfilesAPI = async () =>
  HTTP.request(`${prefix}/get-random-profiles`)
