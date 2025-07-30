import HTTP from './http'

const updateProfile = async userInfo =>
  HTTP.request('/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(userInfo)
  })

export default updateProfile
