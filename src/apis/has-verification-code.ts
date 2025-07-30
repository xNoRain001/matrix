import HTTP from './http'

const hasVerification = async (email, type) =>
  HTTP.request(`/has-verification-code?email=${email}&type=${type}`)

export default hasVerification
