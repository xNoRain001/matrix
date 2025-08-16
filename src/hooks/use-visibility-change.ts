const useVisibilityChange = (
  socket,
  showOfflineModal,
  leaved,
  remoteRoomInfo,
  useRefreshRoomInfo,
  onBye,
  getOnlineWhenReconnection,
  router
) => {
  const visibilityChangeHandler = async () => {
    const { visibilityState } = document

    if (visibilityState === 'visible') {
      if (
        // 如果回来时提示网络错误，那么在重连成功后会获取最新的房间信息
        showOfflineModal.value ||
        // 当前页面可见时触发
        // 在后台时，对方可能离开了，如果是我切换到后台的几秒内，对方离开了，无论我马上
        // 回到页面还是过很久回到页面，都会有对方离开房间的提示，或者我过了很久后回来
        // 通过接口发现对方离开了，又切换到了其他应用，再回来时也会在这里被拦截
        leaved.value ||
        // 我在等待对方加入房间时，切换到后台，再回来时在这里被拦截，如果我在后台时，对方
        // 加入了房间，当我回来了依然能成功建立连接，当在后台时间很短时，自然能成功建立
        // 连接，在后台时间很长时，回来时会马上自动断开 socket 连接，之后重连，连接成功
        // 的回调中又会加入房间
        !remoteRoomInfo.value.latestId
      ) {
        return
      }

      // 如果在我切换到后台很久后，对方离开了，我再切换回页面时需要通过获取房间信息
      // 才能知道他是否离开了
      try {
        useRefreshRoomInfo(
          socket,
          remoteRoomInfo,
          onBye,
          getOnlineWhenReconnection
        )
      } catch {
        // 如果获取房间信息失败，说明断网，重试达到上限后触发模态框,模态框中连接成功
        // 会重新获取房间信息，但有可能重试没达到上限时就恢复了网络，目前的处理是
        // 返回大厅
        router.replace('/hall')
      }
    } else if (visibilityState === 'hidden') {
      // 当前页面不可见触发
      // TODO: 给对方提示，在别的应用，可以作为隐私项设置
    }
  }

  document.addEventListener('visibilitychange', visibilityChangeHandler)

  return () => {
    document.removeEventListener('visibilitychange', visibilityChangeHandler)
  }
}

export default useVisibilityChange
