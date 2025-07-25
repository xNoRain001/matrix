import HTTP from './http'

const register = async encryptedUserInfo =>
  HTTP.request('/register', {
    method: 'POST',
    data: { encryptedUserInfo }
  })

export default register
