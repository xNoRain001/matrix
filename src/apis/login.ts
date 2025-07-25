import HTTP from './http'

const login = async encryptedUserInfo =>
  HTTP.request('/login', {
    method: 'POST',
    data: { encryptedUserInfo }
  })

export default login
