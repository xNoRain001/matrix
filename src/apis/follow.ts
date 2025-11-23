import HTTP from './http'

const prefix = '/follow'

export const followAPI = async following =>
  HTTP.request(`${prefix}?following=${following}`)

export const unfollowAPI = async following =>
  HTTP.request(`${prefix}/unfollow?following=${following}`)

export const getFollowingAPI = async targetId =>
  HTTP.request(`${prefix}/get-following?targetId=${targetId}`)

export const getFollowersAPI = async targetId =>
  HTTP.request(`${prefix}/get-followers?targetId=${targetId}`)

export const getMutualsAPI = async () => HTTP.request(`${prefix}/get-mutuals`)

export const isPublicFollowingAPI = async targetId =>
  HTTP.request(`${prefix}/is-public-following?targetId=${targetId}`)

export const isPublicFollowersAPI = async targetId =>
  HTTP.request(`${prefix}/is-public-followers?targetId=${targetId}`)
