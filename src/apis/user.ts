import HTTP from './http'

const prefix = '/user'

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
    },
    data: { encryptedUserInfo }
  })
