import { copyToClipboard } from 'quasar'

import useNotify from './use-notify'

const useCopyToClipboard = async (v: string) => {
  try {
    await copyToClipboard(v)
    useNotify('复制成功')
  } catch {
    useNotify('复制失败', 'negative')
  }
}

export default useCopyToClipboard
