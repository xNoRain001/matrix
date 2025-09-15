const useRefreshContacts = (id, data, contactList, contactProfileMap) => {
  const _contactProfileMap = {}
  const _contactList = []

  for (let i = 0, l = data.length; i < l; i++) {
    const item = data[i]
    const { id } = item
    _contactProfileMap[id] = item
    _contactList.push(id)
  }

  contactList.value = _contactList
  contactProfileMap.value = _contactProfileMap
  localStorage.setItem(`contactList-${id}`, JSON.stringify(_contactList))
  localStorage.setItem(
    `contactProfileMap-${id}`,
    JSON.stringify(_contactProfileMap)
  )
  localStorage.setItem(
    `contactListExpireAt-${id}`,
    String(Date.now() + 1000 * 60 * 60 * 6)
  )
}

export default useRefreshContacts
