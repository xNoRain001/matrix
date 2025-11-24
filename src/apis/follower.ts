import HTTP from './http'

const prefix = '/follower'

export const followAPI = async targetId =>
  HTTP.request(`${prefix}?targetId=${targetId}`)

export const unfollowAPI = async targetId =>
  HTTP.request(`${prefix}/unfollow?targetId=${targetId}`)

export const getFollowingAPI = async targetId =>
  HTTP.request(`${prefix}/get-following?targetId=${targetId}`)

export const getFollowersAPI = async targetId =>
  HTTP.request(`${prefix}/get-followers?targetId=${targetId}`)

export const getMutualsAPI = async () => HTTP.request(`${prefix}/get-mutuals`)

export const removeFollowerAPI = async targetId =>
  HTTP.request(`${prefix}/remove-follower?targetId=${targetId}`)

export const isPublicFollowingAPI = async targetId =>
  HTTP.request(`${prefix}/is-public-following?targetId=${targetId}`)

export const isPublicFollowersAPI = async targetId =>
  HTTP.request(`${prefix}/is-public-followers?targetId=${targetId}`)
