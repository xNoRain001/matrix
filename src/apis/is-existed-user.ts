import HTTP from './http'

const isExistedUser = async email =>
  HTTP.request(`/is-existed-user?email=${email}`)

export default isExistedUser
