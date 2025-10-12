import HTTP from './http'

const prefix = '/contact'

export const addCandidate = async targetId =>
  HTTP.request(`${prefix}/add-candidate?targetId=${targetId}`)

export const agreeCandidate = async targetId =>
  HTTP.request(`${prefix}/agree-candidate?targetId=${targetId}`)

export const refuseCandidate = async targetId =>
  HTTP.request(`${prefix}/refuse-candidate?targetId=${targetId}`)

export const getCandidates = async () =>
  HTTP.request(`${prefix}/get-candidates`)

export const deleteContact = async targetId =>
  HTTP.request(`${prefix}/delete-contact?targetId=${targetId}`)

export const getContacts = async () => HTTP.request(`${prefix}/all`)
