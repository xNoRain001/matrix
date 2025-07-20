import { reactive } from 'vue'

import { pending } from '@/const'

const useExtendFileStatus = (files: FileList) => {
  for (let i = 0, l = files.length; i < l; i++) {
    ;(files[i] as any).fileStatus = reactive({
      // speed: '0 Mb/s',
      status: pending,
      progress: '0 %',
      time: '0 s'
    })
  }
}

export default useExtendFileStatus
