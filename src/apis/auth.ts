import HTTP from './http'

const prefix = '/auth'

export const login = async encryptedUserInfo =>
  HTTP.request(`${prefix}/login`, {
    method: 'POST',
    data: { encryptedUserInfo }
  })

export const loginWithPin = async (email, code) =>
  HTTP.request(`${prefix}/login-with-pin?email=${email}&code=${code}`)

export const register = async encryptedUserInfo =>
  HTTP.request(`${prefix}/register`, {
    method: 'POST',
    data: { encryptedUserInfo }
  })

export const sendPin = (email: string, type: 'login' | 'register') =>
  HTTP.request(`${prefix}/send-pin?email=${email}&type=${type}`)

export const hasPin = async (email, type) =>
  HTTP.request(`${prefix}/has-pin?email=${email}&type=${type}`)

export const getPublicKey = async () => HTTP.request(`${prefix}/get-public-key`)

export const isExistedUser = async (email: string) =>
  HTTP.request(`${prefix}/is-existed-user?email=${email}`)

export const hasResetPasswordURL = async (email: string) =>
  HTTP.request(`${prefix}/has-reset-password-url?email=${email}`)

export const sendResetPasswordURL = async (email: string) =>
  HTTP.request(`${prefix}/send-reset-password-url?email=${email}`)
