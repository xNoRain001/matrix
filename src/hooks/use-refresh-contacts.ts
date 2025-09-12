const useRefreshContacts = (id, data, contactList, contactProfileMap) => {
  const _contactProfileMap = {}

  for (let i = 0, l = data.length; i < l; i++) {
    const item = data[i]
    const { id } = item
    _contactProfileMap[id] = item
  }

  contactList.value = data
  contactProfileMap.value = _contactProfileMap
  localStorage.setItem(`contactList-${id}`, JSON.stringify(data))
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
