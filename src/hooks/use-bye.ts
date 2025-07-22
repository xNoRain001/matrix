import type { Ref } from 'vue'

const useBye = (leaved: Ref<boolean>, otherLeaved: Ref<boolean>) =>
  (leaved.value = otherLeaved.value = true)

export default useBye
