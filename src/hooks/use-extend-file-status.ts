import { reactive } from 'vue'

import { pending } from '@/const'

import type { extendedFiles } from '@/types'

const useExtendFileStatus = (files: extendedFiles) => {
  for (let i = 0, l = files.length; i < l; i++) {
    files[i].fileStatus = reactive({
      // speed: '0 Mb/s',
      status: pending,
      progress: 0,
      formatedProgress: '0 %',
      time: '0 s'
    })
  }
}

export default useExtendFileStatus
