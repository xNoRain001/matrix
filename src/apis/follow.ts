import HTTP from './http'

const prefix = '/follow'

export const followAPI = async following =>
  HTTP.request(`${prefix}?following=${following}`)

export const unfollowAPI = async following =>
  HTTP.request(`${prefix}/unfollow?following=${following}`)

export const getFollowingAPI = async () =>
  HTTP.request(`${prefix}/get-following`)

export const getFollowersAPI = async () =>
  HTTP.request(`${prefix}/get-followers`)

export const getMutualsAPI = async () => HTTP.request(`${prefix}/get-mutuals`)
