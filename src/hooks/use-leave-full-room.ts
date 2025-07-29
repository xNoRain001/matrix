import type { Ref } from 'vue'

const useLeaveFullRoom = (leaved: Ref<boolean>, isFull: Ref<boolean>) => {
  // 满员时是加入不了房间的，但是需要显示底部的重新加入房间或匹配的按钮
  // 所以手动更新 leaved 的值
  leaved.value = true
  // 将 isFull 修改为 false，让这部分的视图不会显示在匹配或 PIN 中
  isFull.value = false
}

export default useLeaveFullRoom
