import { Loading } from 'quasar'

const useLoading = (message = '') => {
  if (message) {
    Loading.show({ message })
  } else {
    Loading.hide()
  }
}

export default useLoading
