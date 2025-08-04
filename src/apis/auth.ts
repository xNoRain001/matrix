import HTTP from './http'

const prefix = '/auth'

export const login = async encryptedUserInfo =>
  HTTP.request(`${prefix}/login`, {
    method: 'POST',
    data: { encryptedUserInfo }
  })

export const register = async encryptedUserInfo =>
  HTTP.request(`${prefix}/register`, {
    method: 'POST',
    data: { encryptedUserInfo }
  })

export const sendPin = (
  email: string,
  type: 'login' | 'register' | 'update-password'
) => HTTP.request(`${prefix}/send-pin?email=${email}&type=${type}`)

export const hasPin = async (email, type) =>
  HTTP.request(`${prefix}/has-pin?email=${email}&type=${type}`)

export const validatePin = async (
  type: 'login' | 'register' | 'update-password',
  email: string,
  v: string
) => HTTP.request(`${prefix}/validate-pin?type=${type}&key=${email}&code=${v}`)

export const getPublicKey = async () => HTTP.request(`${prefix}/get-public-key`)

export const isExistedUser = async (email: string) =>
  HTTP.request(`${prefix}/is-existed-user?email=${email}`)

export const hasResetPasswordURL = async (email: string) =>
  HTTP.request(`${prefix}/has-reset-password-url?email=${email}`)

export const sendResetPasswordURL = async (email: string) =>
  HTTP.request(`${prefix}/send-reset-password-url?email=${email}`)
