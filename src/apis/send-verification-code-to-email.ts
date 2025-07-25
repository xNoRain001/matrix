import HTTP from './http'

const sendVerificationCodeToEmail = (
  email: string,
  type: 'login' | 'register' | 'update-password'
) =>
  HTTP.request(`/send-verification-code-to-email?email=${email}&type=${type}`)
export default sendVerificationCodeToEmail
