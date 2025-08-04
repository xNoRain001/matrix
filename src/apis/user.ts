import HTTP from './http'

const prefix = '/user'

export const updateProfile = async userInfo =>
  HTTP.request(`${prefix}/update-profile`, {
    method: 'POST',
    data: userInfo
  })

export const updatePassword = async encryptedUserInfo =>
  HTTP.request(`${prefix}/update-password`, {
    method: 'POST',
    data: { encryptedUserInfo }
  })

export const resetPassword = async (token, encryptedUserInfo) =>
  HTTP.request(`${prefix}/reset-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
      // 'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: { encryptedUserInfo }
  })
