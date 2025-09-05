import { useUserStore } from '@/store'

const useLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('contacts')
  useUserStore().userInfo = null
}

export default useLogout
