import HTTP from './http'

const updatePassword = async encryptedUserInfo =>
  HTTP.request('/update-password', {
    method: 'POST',
    data: { encryptedUserInfo }
  })

export default updatePassword
