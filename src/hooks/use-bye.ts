import { useRoomStore } from '@/store'
import type { Ref } from 'vue'

const useBye = (leaved: Ref<boolean>, otherLeaved: Ref<boolean>) => {
  leaved.value = otherLeaved.value = true
  useRoomStore().otherInfo = null
}

export default useBye
