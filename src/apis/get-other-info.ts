import HTTP from './http'

const getOtherInfo = async id => HTTP.request(`/get-other-info?id=${id}`)

export default getOtherInfo
