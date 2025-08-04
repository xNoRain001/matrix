import HTTP from './http'

const prefix = '/user'

export const updateProfile = async userInfo =>
  HTTP.request(`${prefix}/update-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(userInfo)
  })

export const updatePassword = async encryptedUserInfo =>
  HTTP.request(`${prefix}/update-password`, {
    method: 'POST',
    data: { encryptedUserInfo }
  })
