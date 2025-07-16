import { Notify } from 'quasar'

type useNotifyFn = (
  message: string,
  type?: 'positive' | 'negative' | 'warning' | 'info' | 'ongoing',
  position?:
    | 'bottom'
    | 'left'
    | 'right'
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'center',
  progress?: boolean
) => undefined

const useNotify: useNotifyFn = (
  message,
  type = 'positive',
  position = 'top',
  progress = true
) => {
  Notify.create({
    type,
    position,
    message,
    progress
  })
}

export default useNotify
