import type { Ref } from 'vue'

const useBye = async (exitRoom: Function, otherLeaved: Ref<boolean>) => {
  await exitRoom()
  otherLeaved.value = true
}

export default useBye
