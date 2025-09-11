const useLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('contactList')
  localStorage.removeItem('contactListExpireAt')
  localStorage.removeItem('contactProfileMap')
  localStorage.removeItem('matchRes')
  localStorage.removeItem('matchType')
  localStorage.removeItem('lastMsgProfileMapExpireAt')
}

export default useLogout
