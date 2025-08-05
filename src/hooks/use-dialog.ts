import { Dialog } from 'quasar'

import type { QDialogOptions } from 'quasar'

const defaultOptions = {
  class: 'bg-x-card',
  color: 'primary',
  ok: {
    label: '确定',
    rounded: true
  },
  cancel: {
    label: '取消',
    rounded: true
  }
}

const useDialog = (options: QDialogOptions) =>
  Dialog.create({ ...defaultOptions, ...options })

export default useDialog
