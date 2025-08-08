import type { Ref } from 'vue'

const useBye = async (
  leaveAfterConnected: Function,
  otherLeaved: Ref<boolean>
) => {
  await leaveAfterConnected()
  otherLeaved.value = true
}

export default useBye
