import HTTP from './http'

const validateVerificationCode = async (
  type: 'login' | 'register' | 'update-password',
  email: string,
  v: string
) =>
  HTTP.request(
    `/validate-verification-code?type=${type}&key=${email}&code=${v}`
  )

export default validateVerificationCode
